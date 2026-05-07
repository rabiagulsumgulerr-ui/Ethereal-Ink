import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, LogIn, AlertCircle } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { CinematicTitle } from './GothicElements';
import { cn } from '../lib/utils';

export function Login() {
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setIsConnecting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'The shadows refused your entry. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-goth-black relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-goth-blood/5 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center p-12"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block mb-8"
        >
          <Sword className="w-24 h-24 text-goth-blood drop-shadow-[0_0_15px_rgba(136,8,8,0.5)]" />
        </motion.div>
        
        <CinematicTitle 
          title="Ethereal Ink" 
          subtitle="Bind your soul to the digital grimoire" 
        />
        
        <p className="max-w-md mx-auto text-goth-paper/40 font-serif italic mb-12 leading-relaxed">
          The shadows await your inscription. Manifest your tales across the dimensions and let the void preserve them.
        </p>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 p-4 bg-goth-blood/10 border border-goth-blood/30 rounded-xl flex items-center gap-3 text-goth-blood text-sm font-serif italic max-w-sm mx-auto"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={handleLogin}
          disabled={isConnecting}
          className="group relative px-12 py-5 bg-white/5 border border-goth-blood/30 rounded-2xl overflow-hidden transition-all hover:bg-goth-blood/20 parchment-glow flex items-center gap-4 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <LogIn className={cn("w-6 h-6 text-goth-blood group-hover:scale-110 transition-transform", isConnecting && "animate-pulse")} />
          <span className="text-xl font-serif tracking-widest text-goth-ink">
            {isConnecting ? 'Binding Soul...' : 'Enter the Sanctum'}
          </span>
        </button>
        
        <p className="mt-12 text-[10px] uppercase tracking-[0.4em] text-goth-paper/20">
          Google Authentication Required for Binding
        </p>
      </motion.div>
    </div>
  );
}
