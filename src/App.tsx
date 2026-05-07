import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { WritingEditor } from './components/WritingEditor';
import { CharacterCodex } from './components/CharacterCodex';
import { WorldMap } from './components/WorldMap';
import { ChronosTimeline } from './components/ChronosTimeline';
import { GrimoireAI } from './components/GrimoireAI';
import { AtmospherePlayer } from './components/AtmospherePlayer';
import { Moodboard } from './components/Moodboard';
import { GothicDecorations } from './components/GothicElements';
import { Login } from './components/Login';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { AppState } from './types';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';

const DEFAULT_STATE: AppState = {
  story: { title: 'Untitled Grimoire', content: '', lastSaved: new Date().toISOString() },
  characters: [],
  world: [],
  timeline: [],
};

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<AppState>(DEFAULT_STATE);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setLoading(false);
        setState(DEFAULT_STATE);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    
    // Ensure user profile exists
    getDoc(userDocRef).then((snap) => {
      if (!snap.exists()) {
        setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString()
        }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`));
      }
    });

    // Listen to main story
    const storyRef = doc(db, 'users', user.uid, 'stories', 'main');
    const unsubStory = onSnapshot(storyRef, (snap) => {
      if (snap.exists()) {
        setState(prev => ({ ...prev, story: snap.data() as any }));
      }
      setLoading(false);
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}/stories/main`));

    // Listen to characters
    const charColRef = collection(db, 'users', user.uid, 'characters');
    const unsubChars = onSnapshot(charColRef, (snap) => {
      const chars = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setState(prev => ({ ...prev, characters: chars }));
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}/characters`));

    // Listen to world locations
    const locColRef = collection(db, 'users', user.uid, 'locations');
    const unsubLocs = onSnapshot(locColRef, (snap) => {
      const locs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setState(prev => ({ ...prev, world: locs }));
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}/locations`));

    // Listen to timeline
    const timeColRef = collection(db, 'users', user.uid, 'timeline');
    const unsubTime = onSnapshot(timeColRef, (snap) => {
      const events = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setState(prev => ({ ...prev, timeline: events }));
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}/timeline`));

    return () => {
      unsubStory();
      unsubChars();
      unsubLocs();
      unsubTime();
    };
  }, [user]);

  const updateStory = async (story: AppState['story']) => {
    if (!user) return;
    const storyRef = doc(db, 'users', user.uid, 'stories', 'main');
    try {
      await setDoc(storyRef, { ...story, userId: user.uid });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/stories/main`);
    }
  };

  const updateCharacters = async (characters: AppState['characters']) => {
    if (!user) return;
    // For simplicity with this current UI structure, we'll reconcile in the components.
    // However, the Codex component already handles its own logic, so we pass state.
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-goth-black flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-goth-blood border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-goth-black text-goth-paper selection:bg-goth-blood/30 selection:text-white relative">
        <GothicDecorations />
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 relative overflow-y-auto custom-scrollbar z-10 scroll-smooth">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/editor" replace />} />
              <Route 
                path="/editor" 
                element={
                  <PageTransition key="editor">
                    <WritingEditor 
                      story={state.story} 
                      onSave={updateStory} 
                    />
                  </PageTransition>
                } 
              />
              <Route 
                path="/characters" 
                element={
                  <PageTransition key="characters">
                    <CharacterCodex 
                      characters={state.characters}
                      onUpdate={() => {}} // CRUD logic moved to component for simplicity
                    />
                  </PageTransition>
                } 
              />
              <Route 
                path="/world" 
                element={
                  <PageTransition key="world">
                    <WorldMap 
                      locations={state.world}
                      onUpdate={() => {}} // CRUD logic moved to component
                    />
                  </PageTransition>
                } 
              />
              <Route 
                path="/timeline" 
                element={
                  <PageTransition key="timeline">
                    <ChronosTimeline 
                      events={state.timeline}
                      onUpdate={() => {}} // CRUD logic moved to component
                    />
                  </PageTransition>
                } 
              />
              <Route 
                path="/moodboard" 
                element={
                  <PageTransition key="moodboard">
                    <Moodboard />
                  </PageTransition>
                } 
              />
              <Route 
                path="/ai" 
                element={
                  <PageTransition key="ai">
                    <GrimoireAI context={state} />
                  </PageTransition>
                } 
              />
            </Routes>
          </AnimatePresence>
        </main>

        <AtmospherePlayer />
      </div>
    </Router>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-full w-full"
    >
      {children}
    </motion.div>
  );
}
