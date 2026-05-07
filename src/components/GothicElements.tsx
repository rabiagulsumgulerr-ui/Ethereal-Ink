import { motion, useAnimation } from 'motion/react';
import { useEffect, useState } from 'react';

const RUNES = ["᚛", "᚜", "ᚨ", "ᛒ", "ᚲ", "ᛞ", "ᛖ", "ᚠ", "ᚷ", "ᚻ", "ᛁ", "ᛃ", "ᚴ", "ᛚ", "ᛗ", "ᚾ", "ᛟ", "ᛐ", "ᚦ", "ᚢ", "ᚥ", "ᛪ", "ᛦ", "ᛨ"];

interface CinematicTitleProps {
  title: string;
  subtitle?: string;
}

export function CinematicTitle({ title, subtitle }: CinematicTitleProps) {
  const [displayText, setDisplayText] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => 
        title.split('')
          .map((char, index) => {
            if (index < iteration) return title[index];
            return RUNES[Math.floor(Math.random() * RUNES.length)];
          })
          .join('')
      );

      if (iteration >= title.length) {
        clearInterval(interval);
        setIsRevealed(true);
      }
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [title]);

  return (
    <div className="mb-12">
      <motion.h1 
        className="text-6xl font-serif text-goth-ink mb-2 select-none tracking-tighter"
        initial={{ letterSpacing: '0.5em', opacity: 0 }}
        animate={{ letterSpacing: '0em', opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        {displayText}
      </motion.h1>
      {subtitle && (
        <motion.div 
          className="text-xs uppercase tracking-[0.5em] text-goth-paper/30 font-semibold inline-block relative"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          {subtitle}
          <motion.div 
            className="absolute -bottom-2 left-0 h-[1px] bg-goth-blood"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 1.5, duration: 2 }}
          />
        </motion.div>
      )}
    </div>
  );
}

export function GothicDecorations() {
  return (
    <>
      <div className="fixed top-0 left-0 w-32 h-screen pointer-events-none z-[10] border-r border-goth-blood/5 bg-gradient-to-r from-goth-black to-transparent opacity-50" />
      <div className="fixed top-0 right-0 w-32 h-screen pointer-events-none z-[10] border-l border-goth-blood/5 bg-gradient-to-l from-goth-black to-transparent opacity-50" />
      
      {/* Decorative Arches */}
      <div className="fixed top-0 left-0 right-0 h-32 pointer-events-none z-[40]">
        <div className="w-full h-full gothic-arch border-b border-goth-blood/20 shadow-[0_10px_50px_rgba(136,8,8,0.1)] bg-gradient-to-b from-goth-black/80 to-transparent" />
      </div>

      <div className="fog-wrapper">
        <div className="fog-layer" />
      </div>

      {/* Flicker Light (Candle) */}
      <motion.div 
        className="fixed bottom-0 left-0 w-64 h-64 pointer-events-none z-[2] bg-goth-gold/5 blur-[100px]"
        animate={{ opacity: [0.1, 0.3, 0.2, 0.4, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </>
  );
}
