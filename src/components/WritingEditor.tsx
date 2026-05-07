import { useState, useEffect, useRef } from 'react';
import { StoryState } from '../types';
import { Save, Type, Eye, Trash2, Clock, Hourglass, Tag, Plus, X, BookText, Download, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { CinematicTitle } from './GothicElements';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface WritingEditorProps {
  story: StoryState;
  onSave: (story: StoryState) => void;
}

export function WritingEditor({ story, onSave }: WritingEditorProps) {
  const [content, setContent] = useState(story.content);
  const [title, setTitle] = useState(story.title);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setContent(story.content);
    setTitle(story.title);
  }, [story.content, story.title]);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentScene, setCurrentScene] = useState<string>('Prologue');
  const [isExporting, setIsExporting] = useState(false);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const parchmentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFocused || isTimerActive) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isFocused, isTimerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exportToPDF = async () => {
    if (!parchmentRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(parchmentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#e8e4db',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'manuscript'}.pdf`);
    } catch (error) {
      console.error('Failed to manifest PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    
    autoSaveTimeout.current = setTimeout(() => {
      onSave({ title, content, lastSaved: new Date().toISOString() });
    }, 2000);

    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
  }, [content, title]);

  return (
    <div className="flex flex-col p-6 lg:p-12 relative min-h-screen">
      <motion.div 
        ref={parchmentRef}
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="grimoire-page parchment-texture p-8 lg:p-16 min-h-[90vh] flex flex-col"
      >
        <div className="grimoire-inner-shadow" />
        
        <AnimatePresence>
          {!isFocused && (
            <motion.header 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-16 relative z-20"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <CinematicTitle title="Scriptorium" subtitle="Transcribing the Void" />
                
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-center px-6 py-2 bg-black/5 border border-black/5 rounded-sm">
                    <span className="text-[8px] uppercase tracking-widest text-black/30 mb-1">Ritual Duration</span>
                    <div className="flex items-center gap-3">
                      <Hourglass className={cn("w-4 h-4 text-goth-blood", isTimerActive && "animate-spin-slow")} />
                      <span className="text-xl font-mono tracking-tighter text-black/70">{formatTime(timer)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center px-6 py-2 bg-black/5 border border-black/5 rounded-sm">
                    <span className="text-[8px] uppercase tracking-widest text-black/30 mb-1">Ink Manifested</span>
                    <div className="flex items-center gap-3">
                      <BookText className="w-4 h-4 text-black/40" />
                      <span className="text-xl font-mono tracking-tighter text-black/70">{content.trim().split(/\s+/).filter(Boolean).length} <span className="text-[10px] uppercase font-sans tracking-wide opacity-40 ml-1">Words</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-4xl">
                <div className="flex items-center gap-2 mb-2 text-goth-blood font-serif italic text-sm">
                  <Tag className="w-3 h-3" />
                  <input 
                    value={currentScene}
                    onChange={(e) => setCurrentScene(e.target.value)}
                    className="bg-transparent border-none outline-none w-full placeholder:text-black/5"
                    placeholder="Untitled Scene..."
                  />
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent text-5xl font-serif text-black/80 border-none outline-none placeholder:text-black/10 transition-all"
                  placeholder="The Whispered Tale..."
                />
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        <div className={cn(
          "relative transition-all duration-1000 flex-1",
          isFocused ? "pt-12" : "pt-0"
        )}>
          <div className="max-w-4xl h-full relative group">
            {isFocused && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed top-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.5em] text-black/30 font-serif italic pointer-events-none z-50 bg-[#e8e4db]/90 backdrop-blur px-8 py-3 rounded-full shadow-lg border border-black/5"
              >
                The Scriptorium • {formatTime(timer)} • {content.trim().split(/\s+/).length} words
              </motion.div>
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={cn(
                "w-full h-full min-h-[50vh] bg-transparent text-xl font-serif leading-[2.5] tracking-wide",
                "text-black/80 outline-none resize-none placeholder:text-black/5 transition-all duration-1000 selection:bg-goth-blood/20",
                isFocused ? "scale-[1.01]" : ""
              )}
              placeholder="Let the shadows speak through your ink..."
            />
            
            {/* Paper Lines subtle effect */}
            <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none opacity-[0.03] space-y-[2.5em] mt-[0.5em]">
              {[...Array(50)].map((_, i) => (
                <div key={i} className="h-[1px] bg-black" />
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-black/5 flex justify-between items-center text-[9px] uppercase tracking-[0.3em] text-black/40 z-20 font-sans">
          <div className="flex gap-12">
            <span className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-goth-blood animate-pulse" /> Ink Flowing
            </span>
            <span 
              onClick={() => setIsTimerActive(!isTimerActive)}
              className={cn(
                "flex items-center gap-2 cursor-pointer transition-colors",
                isTimerActive ? "text-goth-blood" : "hover:text-black"
              )}
            >
              <Hourglass className={cn("w-3 h-3", isTimerActive && "animate-spin-slow")} /> Ritual Timer
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={exportToPDF}
              disabled={isExporting}
              className={cn(
                "flex items-center gap-2 px-4 py-2 bg-black/5 hover:bg-black/10 rounded-sm transition-all border border-black/5 group",
                isExporting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isExporting ? (
                <span className="animate-pulse">Manifesting PDF...</span>
              ) : (
                <>
                  <FileText className="w-3 h-3 text-goth-blood group-hover:scale-110 transition-transform" />
                  <span>Download Manuscript</span>
                </>
              )}
            </button>
            <div className="flex items-center gap-3">
              <span className="opacity-50">Inscribed in Grimoire</span>
              <Save className="w-3 h-3 text-goth-blood" />
            </div>
          </div>
        </footer>
      </motion.div>

      {/* Floating Focus Toggle */}
      {isFocused && (
        <button 
          onClick={() => setIsFocused(false)}
          className="fixed bottom-12 right-24 p-4 bg-goth-charcoal border border-goth-blood/20 text-goth-paper/40 hover:text-goth-paper rounded-full transition-all z-[100] hover:scale-110 shadow-2xl"
        >
          <X className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
