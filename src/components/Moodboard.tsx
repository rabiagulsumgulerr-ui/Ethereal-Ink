import { useState, useEffect } from 'react';
import { CinematicTitle } from './GothicElements';
import { Plus, Image, Trash2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

interface MoodItem {
  id: string;
  url: string;
  label: string;
  x: number;
  y: number;
}

export function Moodboard() {
  const [items, setItems] = useState<MoodItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, 'users', user.uid, 'moodboard');
    return onSnapshot(colRef, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as MoodItem[];
      setItems(data);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${user.uid}/moodboard`));
  }, [user]);

  const addImage = async () => {
    if (newUrl && user) {
      const itemData = {
        url: newUrl,
        label: newLabel || 'Inspiration',
        x: Math.random() * 60 + 10,
        y: Math.random() * 60 + 10,
        userId: user.uid
      };

      try {
        const colRef = collection(db, 'users', user.uid, 'moodboard');
        await addDoc(colRef, itemData);
        setNewUrl('');
        setNewLabel('');
        setIsAdding(false);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/moodboard`);
      }
    }
  };

  const removeItem = async (id: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'moodboard', id);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/moodboard/${id}`);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-12 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="grimoire-page parchment-texture p-8 lg:p-12 flex flex-col min-h-0 relative"
      >
        <div className="grimoire-inner-shadow" />
        
        <header className="flex justify-between items-start mb-8 z-20">
          <CinematicTitle title="Visions of the Void" subtitle="Moodboard of Lost Echoes" />
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-black/5 border border-goth-blood/20 p-4 rounded-full text-goth-blood shadow-sm hover:bg-black/10 transition-all font-serif italic text-sm flex items-center gap-2 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Manifest Fragment
          </button>
        </header>
  
        <div className="flex-1 relative overflow-hidden bg-black/[0.02] rounded-sm border border-black/5">
          {/* Grid guide */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
          />
          
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                drag
                dragMomentum={false}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute p-3 bg-[#d4cfc1] border-2 border-[#c5a059]/40 shadow-xl cursor-move group z-10"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                <div className="absolute inset-0 border border-[#c5a059]/20 m-1 pointer-events-none" />
                <div className="relative overflow-hidden w-64 h-48 bg-black/10">
                  <img 
                    src={item.url} 
                    alt={item.label} 
                    className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-goth-blood/20 hover:bg-goth-blood rounded text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="mt-3 text-[10px] uppercase tracking-[0.4em] font-serif italic text-black/50 text-center">{item.label}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
  
        <footer className="mt-8 text-[9px] uppercase tracking-[0.4em] text-black/20 font-serif italic text-center">
          "Organize the chaotic fragments of thy imagination upon the ritual canvas."
        </footer>
      </motion.div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-goth-black/95 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1510] border border-goth-blood/30 p-12 rounded-3xl w-full max-w-md shadow-2xl"
            >
              <h2 className="text-3xl font-serif text-goth-ink mb-8">Manifest Fragment</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-goth-paper/30 mb-2 block">Vision URI</label>
                  <input
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full bg-black/40 border-b border-goth-blood/20 p-3 outline-none focus:border-goth-ink transition-colors font-serif text-goth-paper"
                    placeholder="https://..."
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-goth-paper/30 mb-2 block">Inscription</label>
                  <input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full bg-black/40 border-b border-goth-blood/20 p-3 outline-none focus:border-goth-ink transition-colors font-serif text-goth-paper"
                    placeholder="Shadows of the Void"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-8 py-4 bg-transparent border border-goth-paper/10 rounded-xl hover:bg-white/5 transition-all text-[10px] uppercase tracking-widest"
                  >
                    Abandon
                  </button>
                  <button 
                    onClick={addImage}
                    className="flex-1 px-8 py-4 bg-goth-blood text-white rounded-xl hover:bg-goth-blood/80 transition-all text-[10px] uppercase tracking-widest font-semibold"
                  >
                    Bind Fragment
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
