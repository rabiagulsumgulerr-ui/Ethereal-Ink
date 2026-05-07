import { useState, useRef, useEffect } from 'react';
import { Trees, Swords, Music, Castle, Volume2, VolumeX, Flame, CloudRain, Library, Wind, X, Ghost } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const TRACKS = [
  { id: 'cathedral', icon: Castle, label: 'Shadow Cathedral', url: 'https://assets.mixkit.co/music/preview/mixkit-spirit-of-the-temple-1033.mp3' },
  { id: 'wind', icon: Wind, label: 'Boreal Whispers', url: 'https://assets.mixkit.co/sfx/preview/mixkit-cold-wind-loop-1139.mp3' },
  { id: 'dark_ambient', icon: Ghost, label: 'Void Presence', url: 'https://assets.mixkit.co/music/preview/mixkit-atmospheric-scary-935.mp3' },
  { id: 'storm', icon: CloudRain, label: 'Ancient Storm', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' },
];

export function AtmospherePlayer() {
  const [activeTracks, setActiveTracks] = useState<{ [key: string]: number }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  const toggleTrack = (id: string) => {
    const isPlaying = activeTracks[id] !== undefined;
    
    if (isPlaying) {
      // Fade out
      let vol = activeTracks[id];
      const fadeOut = setInterval(() => {
        vol -= 0.05;
        if (vol <= 0) {
          clearInterval(fadeOut);
          if (audioRefs.current[id]) {
            audioRefs.current[id]!.pause();
            audioRefs.current[id]!.currentTime = 0;
          }
          setActiveTracks(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        } else {
          if (audioRefs.current[id]) audioRefs.current[id]!.volume = vol;
          setActiveTracks(prev => ({ ...prev, [id]: vol }));
        }
      }, 50);
    } else {
      // Fade in
      setActiveTracks(prev => ({ ...prev, [id]: 0 }));
      if (audioRefs.current[id]) {
        audioRefs.current[id]!.volume = 0;
        audioRefs.current[id]!.play().catch(() => {});
      }
      
      let vol = 0;
      const fadeIn = setInterval(() => {
        vol += 0.05;
        if (vol >= 0.5) {
          clearInterval(fadeIn);
          if (audioRefs.current[id]) audioRefs.current[id]!.volume = 0.5;
          setActiveTracks(prev => ({ ...prev, [id]: 0.5 }));
        } else {
          if (audioRefs.current[id]) audioRefs.current[id]!.volume = vol;
          setActiveTracks(prev => ({ ...prev, [id]: vol }));
        }
      }, 50);
    }
  };

  const updateVolume = (id: string, vol: number) => {
    setActiveTracks(prev => ({ ...prev, [id]: vol }));
    if (audioRefs.current[id]) {
      audioRefs.current[id]!.volume = vol;
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto items-end">
        <AnimatePresence>
          {Object.entries(activeTracks).map(([id, volume]) => {
            const track = TRACKS.find(t => t.id === id);
            if (!track) return null;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-goth-charcoal/90 backdrop-blur-xl border border-goth-blood/30 p-4 rounded-xl w-64 shadow-2xl flex flex-col gap-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <track.icon className="w-3 h-3 text-goth-ink animate-pulse" />
                    <span className="text-[10px] font-serif uppercase tracking-widest text-goth-paper/60">{track.label}</span>
                  </div>
                  <button 
                    onClick={() => toggleTrack(id)}
                    className="p-1 hover:text-goth-blood transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  value={volume}
                  onChange={(e) => updateVolume(id, parseFloat(e.target.value))}
                  className="w-full accent-goth-blood h-1 bg-goth-black rounded-lg cursor-pointer appearance-none"
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex gap-2 p-2 bg-goth-charcoal/80 backdrop-blur-md rounded-full border border-goth-blood/20 shadow-2xl pointer-events-auto">
        {TRACKS.map((track) => (
          <div key={track.id} className="relative group">
            <audio 
              ref={(el) => { if (el) audioRefs.current[track.id] = el; }}
              src={track.url}
              loop
            />
            <button
              onClick={() => toggleTrack(track.id)}
              className={cn(
                "p-3 rounded-full transition-all duration-500 relative",
                activeTracks[track.id] !== undefined 
                  ? "bg-goth-blood text-white scale-110 shadow-[0_0_15px_rgba(136,8,8,0.5)]" 
                  : "text-goth-paper/40 hover:text-goth-paper hover:bg-white/5"
              )}
            >
              <track.icon className="w-5 h-5" />
              
              {activeTracks[track.id] !== undefined && (
                <motion.div 
                  layoutId={`audio-ping-${track.id}`}
                  className="absolute inset-0 rounded-full border-2 border-goth-blood"
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-goth-black px-3 py-1 rounded text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-goth-blood/30 z-[110]">
              {track.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
