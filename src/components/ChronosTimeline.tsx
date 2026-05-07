import { useState } from 'react';
import { TimelineEvent } from '../types';
import { CinematicTitle } from './GothicElements';
import { Plus, Trash2, Milestone, Calendar, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';

interface ChronosTimelineProps {
  events: TimelineEvent[];
  onUpdate: () => void;
}

export function ChronosTimeline({ events, onUpdate }: ChronosTimelineProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    date: '',
    title: '',
    content: '',
    importance: 'minor'
  });

  const user = auth.currentUser;
  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date || !user) return;
    
    const eventData = {
      title: newEvent.title!,
      date: newEvent.date!,
      content: newEvent.content || '',
      importance: newEvent.importance as any || 'minor',
      userId: user.uid
    };

    try {
      const colRef = collection(db, 'users', user.uid, 'timeline');
      await addDoc(colRef, eventData);
      setIsAdding(false);
      setNewEvent({ date: '', title: '', content: '', importance: 'minor' });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/timeline`);
    }
  };

  const removeEvent = async (id: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'timeline', id);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/timeline/${id}`);
    }
  };

  return (
    <div className="flex flex-col p-6 lg:p-12 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grimoire-page parchment-texture p-8 lg:p-16 min-h-0"
      >
        <div className="grimoire-inner-shadow" />
        
        <header className="flex justify-between items-center mb-16 relative z-20">
          <div>
            <CinematicTitle title="Chronos Timeline" subtitle="The Echo of Past & Future" />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-black/5 border border-goth-blood/20 hover:bg-black/10 transition-all p-4 rounded-full text-goth-blood shadow-sm group"
          >
            <Calendar className="w-8 h-8 group-hover:scale-110 transition-transform" />
          </button>
        </header>

        <div className="max-w-4xl mx-auto w-full relative pb-32 z-20">
          {/* The Thread of Time */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-goth-blood/40 via-black/10 to-transparent -translate-x-1/2" />

          <div className="space-y-16">
            <AnimatePresence>
              {sortedEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                  className={cn(
                    "flex items-center gap-12 w-full",
                    index % 2 === 0 ? "flex-row text-right" : "flex-row-reverse text-left"
                  )}
                >
                  <div className="flex-1">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-8 bg-black/[0.03] border border-black/5 rounded-sm relative group"
                    >
                      <div className="absolute inset-0 border border-black/5 m-1 pointer-events-none" />
                      <div className="text-[10px] uppercase tracking-[0.3em] text-goth-blood font-bold mb-2">{event.date}</div>
                      <h3 className="text-2xl font-serif text-black/80 mb-4">{event.title}</h3>
                      <p className="text-sm text-black/50 leading-relaxed font-serif italic">"{event.content}"</p>
                      
                      <button 
                        onClick={() => removeEvent(event.id)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-black/20 hover:text-goth-blood"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      {event.importance === 'critical' && (
                        <div className="absolute -top-3 -right-3 p-2 bg-goth-blood rounded-full shadow-lg">
                          <Zap className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </motion.div>
                  </div>

                  <div className="relative z-10">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all duration-500",
                      event.importance === 'critical' 
                        ? "bg-goth-blood border-goth-blood scale-150 shadow-[0_0_20px_rgba(136,8,8,0.4)]" 
                        : "bg-white border-black/20"
                    )} />
                  </div>

                  <div className="flex-1 h-1" />
                </motion.div>
              ))}
            </AnimatePresence>

            {sortedEvents.length === 0 && !isAdding && (
              <div className="py-32 flex flex-col items-center justify-center text-black/10">
                <Milestone className="w-24 h-24 mb-4 opacity-5" />
                <p className="font-serif italic text-2xl">Time stands still. Mark an era to proceed.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-goth-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-goth-charcoal border border-goth-blood/30 p-12 rounded-3xl w-full max-w-lg parchment-glow"
            >
              <h2 className="text-3xl font-serif text-goth-ink mb-8">Inscribe a Moment</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-goth-paper/40 mb-2 block font-semibold">Temporal Point (Date/Year)</label>
                  <input
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    className="w-full bg-goth-black border-b border-goth-blood/20 p-3 outline-none focus:border-goth-ink transition-colors font-serif text-lg"
                    placeholder="E.g. 1442 A.C."
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-goth-paper/40 mb-2 block font-semibold">The Event's Appellation</label>
                  <input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full bg-goth-black border-b border-goth-blood/20 p-3 outline-none focus:border-goth-ink transition-colors font-serif text-lg"
                    placeholder="E.g. The Night of Crimson Ash..."
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-goth-paper/40 mb-2 block font-semibold">Narrative Weight</label>
                  <select
                    value={newEvent.importance}
                    onChange={(e) => setNewEvent({...newEvent, importance: e.target.value as any})}
                    className="w-full bg-goth-black border-b border-goth-blood/20 p-3 outline-none focus:border-goth-ink transition-colors font-serif text-lg"
                  >
                    <option value="minor">Minor Echo</option>
                    <option value="major">Major Whisper</option>
                    <option value="critical">Critical Revelation</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-goth-paper/40 mb-2 block font-semibold">Depiction of History</label>
                  <textarea
                    value={newEvent.content}
                    onChange={(e) => setNewEvent({...newEvent, content: e.target.value})}
                    className="w-full bg-goth-black border-b border-goth-blood/20 p-3 outline-none focus:border-goth-ink transition-colors font-serif text-lg resize-none"
                    rows={3}
                    placeholder="Describe the shifting tides..."
                  />
                </div>
                <div className="flex gap-4 pt-8">
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-8 py-4 bg-transparent border border-goth-paper/20 rounded-xl hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
                  >
                    Forget Moment
                  </button>
                  <button 
                    onClick={addEvent}
                    className="flex-1 px-8 py-4 bg-goth-blood text-white rounded-xl hover:bg-goth-blood/80 transition-all text-sm uppercase tracking-widest font-semibold shadow-[0_0_20px_rgba(136,8,8,0.3)]"
                  >
                    Seal History
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
