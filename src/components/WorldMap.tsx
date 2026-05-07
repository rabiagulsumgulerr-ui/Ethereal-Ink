import { useState } from 'react';
import { Location } from '../types';
import { CinematicTitle } from './GothicElements';
import { Plus, Trash2, MapPin, Globe, Compass, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';

interface WorldMapProps {
  locations: Location[];
  onUpdate: () => void;
}

export function WorldMap({ locations, onUpdate }: WorldMapProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLoc, setNewLoc] = useState<Partial<Location>>({
    name: '',
    type: 'City',
    description: '',
    imageUrl: ''
  });

  const user = auth.currentUser;

  const addLocation = async () => {
    if (!newLoc.name || !user) return;
    
    const locData = {
      name: newLoc.name!,
      type: newLoc.type || 'City',
      description: newLoc.description || '',
      imageUrl: newLoc.imageUrl || '',
      userId: user.uid
    };

    try {
      const colRef = collection(db, 'users', user.uid, 'locations');
      await addDoc(colRef, locData);
      setIsAdding(false);
      setNewLoc({ name: '', type: 'City', description: '', imageUrl: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/locations`);
    }
  };

  const removeLocation = async (id: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'locations', id);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/locations/${id}`);
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
            <CinematicTitle title="Cartography of Whispers" subtitle="Mapping the Unmapped Lands" />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-black/5 border border-goth-blood/20 hover:bg-black/10 transition-all p-4 rounded-full text-goth-blood shadow-sm group"
          >
            <Globe className="w-8 h-8 group-hover:animate-spin-slow" />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32 relative z-20">
          <AnimatePresence>
            {locations.map((loc) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="relative bg-black/[0.02] border-2 border-black/5 rounded-sm flex flex-col group h-full overflow-hidden"
              >
                <div className="absolute inset-0 border border-black/5 m-1 pointer-events-none" />
                
                {loc.imageUrl && (
                  <div className="h-48 overflow-hidden relative border-b border-black/5">
                    <img 
                      src={loc.imageUrl} 
                      alt={loc.name} 
                      className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                  </div>
                )}

                <div className="p-8 flex gap-8">
                  {!loc.imageUrl && (
                    <div className="w-20 h-20 shrink-0 bg-black/5 border border-black/10 flex items-center justify-center text-goth-blood group-hover:scale-105 transition-transform duration-700">
                      {loc.type === 'City' ? <Landmark className="w-10 h-10" /> : <Compass className="w-10 h-10" />}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-3xl font-serif text-black/80">{loc.name}</h3>
                      <button 
                        onClick={() => removeLocation(loc.id)}
                        className="p-2 text-black/10 hover:text-goth-blood transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-goth-blood font-bold mb-6">{loc.type}</div>
                    <p className="text-sm text-black/50 leading-relaxed font-serif italic line-clamp-3">"{loc.description}"</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {locations.length === 0 && !isAdding && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-black/10">
              <MapPin className="w-24 h-24 mb-4 opacity-5" />
              <p className="font-serif italic text-2xl">The map is a void. Name a location to manifest it.</p>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-goth-black/95 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1510] border border-goth-blood/30 p-12 rounded-3xl w-full max-w-xl shadow-2xl relative"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none" />
              
              <h2 className="text-3xl font-serif text-goth-ink mb-8 relative z-10">Manifest a Realm</h2>
              <div className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-goth-paper/30 mb-2 block font-semibold">Designation</label>
                    <input
                      value={newLoc.name}
                      onChange={(e) => setNewLoc({...newLoc, name: e.target.value})}
                      className="w-full bg-black/40 border-b border-goth-blood/20 p-3 outline-none focus:border-goth-ink transition-colors font-serif text-lg text-goth-paper"
                      placeholder="E.g. Hollowshade Manor..."
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-goth-paper/30 mb-2 block font-semibold">Nature</label>
                    <select
                      value={newLoc.type}
                      onChange={(e) => setNewLoc({...newLoc, type: e.target.value})}
                      className="w-full bg-black/40 border-b border-goth-blood/20 p-3 outline-none focus:border-goth-ink transition-colors font-serif text-lg text-goth-paper"
                    >
                      <option value="City">Sovereign City</option>
                      <option value="Dungeon">Cursed Dungeon</option>
                      <option value="Nature">Primordial Wilds</option>
                      <option value="Landmark">Ancient Landmark</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-widest text-goth-paper/30 mb-2 block font-semibold">Vision (Image URL)</label>
                  <input
                    value={newLoc.imageUrl}
                    onChange={(e) => setNewLoc({...newLoc, imageUrl: e.target.value})}
                    className="w-full bg-black/40 border-b border-goth-blood/20 p-3 outline-none focus:border-goth-ink transition-colors font-serif text-lg text-goth-paper"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-widest text-goth-paper/30 mb-2 block font-semibold">Echoes of the Land</label>
                  <textarea
                    value={newLoc.description}
                    onChange={(e) => setNewLoc({...newLoc, description: e.target.value})}
                    className="w-full bg-black/40 border-b border-goth-blood/20 p-3 outline-none focus:border-goth-ink transition-colors font-serif text-lg resize-none text-goth-paper"
                    rows={3}
                    placeholder="What secrets are buried in the soil?"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-8 py-4 bg-transparent border border-goth-paper/10 rounded-xl hover:bg-white/5 transition-all text-[10px] uppercase tracking-widest"
                  >
                    Abandon Map
                  </button>
                  <button 
                    onClick={addLocation}
                    className="flex-1 px-8 py-4 bg-goth-blood text-white rounded-xl hover:bg-goth-blood/80 transition-all text-[10px] uppercase tracking-widest font-semibold shadow-[0_0_20px_rgba(136,8,8,0.3)]"
                  >
                    Bind Realm
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
