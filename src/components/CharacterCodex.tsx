import { useState } from 'react';
import { Character } from '../types';
import { Plus, Trash2, Edit3, UserPlus, Fingerprint, Sparkles, Loader2, Wand2, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

import { CinematicTitle } from './GothicElements';

interface CharacterCodexProps {
  characters: Character[];
  onUpdate: () => void;
}

export function CharacterCodex({ characters, onUpdate }: CharacterCodexProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newChar, setNewChar] = useState<Partial<Character>>({
    name: '',
    role: '',
    description: '',
    traits: [],
    imageUrl: ''
  });

  const user = auth.currentUser;

  const generatePortrait = async () => {
    if (!newChar.description) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [{ 
          text: `A dark gothic fantasy portrait of a character. Name: ${newChar.name}. Role: ${newChar.role}. Description: ${newChar.description}. Style: dark academic, gothic horror, oil painting, deep shadows, melancholic atmosphere, highly detailed, 4k.` 
        }],
        config: {
          imageConfig: {
            aspectRatio: "3:4"
          }
        }
      });
      
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            const url = `data:image/png;base64,${part.inlineData.data}`;
            setNewChar(prev => ({ ...prev, imageUrl: url }));
            break;
          }
        }
      }
    } catch (error) {
      console.error("The spirits failed to paint:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addCharacter = async () => {
    if (!newChar.name || !user) return;
    
    const charData = {
      name: newChar.name!,
      role: newChar.role || 'Wanderer',
      description: newChar.description || '',
      traits: newChar.traits || [],
      imageUrl: newChar.imageUrl || `https://picsum.photos/seed/${newChar.name}/400/600?grayscale`,
      userId: user.uid
    };

    try {
      const colRef = collection(db, 'users', user.uid, 'characters');
      await addDoc(colRef, charData);
      setIsAdding(false);
      setNewChar({ name: '', role: '', description: '', traits: [], imageUrl: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/characters`);
    }
  };

  const removeCharacter = async (id: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'characters', id);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/characters/${id}`);
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
        
        <header className="flex justify-between items-start mb-16 relative z-20">
          <div>
            <CinematicTitle title="Character Codex" subtitle="The Register of Lost Souls" />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-black/5 border border-goth-blood/20 hover:bg-black/10 transition-all p-4 rounded-full text-goth-blood shadow-sm group"
          >
            <UserPlus className="w-8 h-8 group-hover:scale-110 transition-transform" />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 pb-20 relative z-20">
          <AnimatePresence>
            {characters.map((char, index) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="tarot-card group h-[550px] flex flex-col"
              >
                <div className="tarot-card-inner" />
                <div className="relative h-72 overflow-hidden border-b-2 border-[#c5a059]/30">
                  <img 
                    src={char.imageUrl} 
                    alt={char.name} 
                    className="w-full h-full object-cover opacity-60 grayscale group-hover:scale-105 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#d4cfc1] via-transparent to-transparent opacity-40" />
                </div>

                <div className="p-6 flex-1 flex flex-col relative">
                  <div className="mb-4">
                    <h3 className="text-2xl font-serif text-black/80 mb-0.5">{char.name}</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-goth-blood font-bold">{char.role}</p>
                  </div>
                  
                  {char.traits && char.traits.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {char.traits.map((trait, i) => (
                        <span key={i} className="px-2 py-0.5 bg-black/5 text-black/60 text-[8px] uppercase tracking-wider border border-black/10 rounded-sm">
                          {trait}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-black/50 line-clamp-4 font-serif italic leading-relaxed">"{char.description}"</p>
                  
                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-black/5">
                    <div className="flex gap-1">
                      <button className="p-2 hover:bg-black/5 rounded transition-colors text-black/30 hover:text-black">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeCharacter(char.id)}
                        className="p-2 hover:bg-black/5 rounded transition-colors text-black/30 hover:text-goth-blood"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[8px] uppercase tracking-[0.3em] opacity-20 font-sans">#{(index + 1).toString().padStart(3, '0')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {characters.length === 0 && !isAdding && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-black/10">
              <Fingerprint className="w-24 h-24 mb-4 opacity-5" />
              <p className="font-serif italic text-2xl">The registry is empty. Invoke a soul to begin.</p>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-goth-black/90 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-goth-charcoal border border-goth-blood/30 p-12 rounded-3xl w-full max-w-4xl parchment-glow flex flex-col md:flex-row gap-12"
            >
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl font-serif text-goth-ink mb-8">Invoke a New Soul</h2>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-goth-paper/40 mb-2 block font-semibold">Name of Vitality</label>
                  <input
                    value={newChar.name}
                    onChange={(e) => setNewChar({...newChar, name: e.target.value})}
                    className="w-full bg-goth-black border-b border-goth-blood/20 p-3 outline-none focus:border-goth-ink transition-colors font-serif text-lg"
                    placeholder="E.g. Lysander Crow..."
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-goth-paper/40 mb-2 block font-semibold">Role in the Grimoire</label>
                  <input
                    value={newChar.role}
                    onChange={(e) => setNewChar({...newChar, role: e.target.value})}
                    className="w-full bg-goth-black border-b border-goth-blood/20 p-3 outline-none focus:border-goth-ink transition-colors font-serif text-lg"
                    placeholder="E.g. Fallen Knight..."
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-goth-paper/40 mb-2 block font-semibold">Glimpse of Narrative</label>
                  <textarea
                    value={newChar.description}
                    onChange={(e) => setNewChar({...newChar, description: e.target.value})}
                    className="w-full bg-goth-black border-b border-goth-blood/20 p-3 outline-none focus:border-goth-ink transition-colors font-serif text-lg resize-none"
                    rows={4}
                    placeholder="What shadows follow them?"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-goth-paper/40 mb-2 block font-semibold">Character Traits (Enter to add)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newChar.traits?.map((trait, i) => (
                      <span key={i} className="px-2 py-1 bg-goth-blood/10 text-goth-ink text-[10px] uppercase tracking-tighter border border-goth-blood/20 rounded flex items-center gap-2">
                        {trait}
                        <button onClick={() => setNewChar(prev => ({ ...prev, traits: prev.traits?.filter((_, idx) => idx !== i) }))}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !newChar.traits?.includes(val)) {
                          setNewChar(prev => ({ ...prev, traits: [...(prev.traits || []), val] }));
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    className="w-full bg-goth-black border-b border-goth-blood/20 p-3 outline-none focus:border-goth-ink transition-colors font-serif text-lg"
                    placeholder="Add a trait and press Enter..."
                  />
                </div>
                <div className="flex gap-4 pt-8">
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-8 py-4 bg-transparent border border-goth-paper/20 rounded-xl hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
                  >
                    Bury Input
                  </button>
                  <button 
                    onClick={addCharacter}
                    className="flex-1 px-8 py-4 bg-goth-blood text-white rounded-xl hover:bg-goth-blood/80 transition-all text-sm uppercase tracking-widest font-semibold shadow-[0_0_20px_rgba(136,8,8,0.3)]"
                  >
                    Bind Soul
                  </button>
                </div>
              </div>

              <div className="w-full md:w-80 shrink-0 flex flex-col gap-6">
                <div className="aspect-[3/4] bg-goth-black rounded-2xl border border-goth-blood/10 overflow-hidden relative group">
                  {newChar.imageUrl ? (
                    <img src={newChar.imageUrl} alt="Generated" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-goth-paper/10 text-center p-8">
                      <Sparkles className="w-12 h-12 mb-4 opacity-5" />
                      <p className="text-xs font-serif italic">The mirror is currently dark...</p>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="absolute inset-0 bg-goth-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-pulse">
                      <Loader2 className="w-8 h-8 text-goth-ink animate-spin mb-4" />
                      <p className="text-xs font-serif italic text-goth-paper/60">Summoning spirits to paint the portrait...</p>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={generatePortrait}
                  disabled={isGenerating || !newChar.description}
                  className="w-full py-4 bg-white/5 border border-goth-ink/30 text-goth-ink rounded-xl hover:bg-goth-ink/10 transition-all flex items-center justify-center gap-3 group disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold">Perform Portrait Ritual</span>
                </button>
                <p className="text-[10px] text-goth-paper/30 italic text-center leading-relaxed">
                  The ritual requires a description to guide the ink. Use the Glimpse of Narrative field.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
