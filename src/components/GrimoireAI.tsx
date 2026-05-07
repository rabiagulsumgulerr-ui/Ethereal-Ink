import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, Skull, Scroll, Ghost, Wand2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { CinematicTitle } from './GothicElements';
import { AppState } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function GrimoireAI({ context }: { context: AppState }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Speak thy desires, mortal. I shall help thee weave shadows into stories. Shall we craft a character, or perhaps a cursed land?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: `
            You are "The Chronicler of Shadows", a gothic AI writing assistant inside a legendary grimoire. 
            Your tone is mysterious, elegant, slightly dark, and poetic. 
            Use dark fantasy/gothic metaphors.
            Reference the user's current story if appropriate (Title: ${context.story.title}).
            Characters nearby: ${context.characters.map(c => c.name).join(', ') || 'None yet'}.
            Help with: Plot holes, character development, world-building, gothic descriptions.
          `
        }
      });

      const text = response.text;
      setMessages(prev => [...prev, { role: 'assistant', content: text || 'The ink has frozen...' }]);
    } catch (error) {
      console.error("The spirits are silent:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "A curse has blocked my vision. Check thy connection or API key." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-12 overflow-hidden relative">
      <div className="grimoire-book-wrapper">
        <div className="grimoire-page parchment-texture">
          <div className="grimoire-inner-shadow" />
          
          <div className="flex-1 overflow-y-auto p-16 custom-scrollbar" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-12">
              <div className="mb-16">
                <CinematicTitle title="The Chronicler of Shadows" subtitle="Infinite Wisdom from the Void" />
              </div>

              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-6 group",
                      msg.role === 'user' ? "flex-row-reverse text-right" : ""
                    )}
                  >
                    <div className="flex-1">
                      <div className={cn(
                        "font-hand text-2xl leading-relaxed transition-all duration-700",
                        msg.role === 'user' ? "text-goth-blood/70" : "text-black/80"
                      )}>
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      <div className={cn(
                        "mt-2 text-[8px] uppercase tracking-widest opacity-20 font-sans",
                        msg.role === 'user' ? "text-right" : "text-left"
                      )}>
                        {msg.role === 'user' ? 'Thy Whisper' : 'Grimoire Response'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <div className="flex gap-4 animate-pulse">
                  <div className="text-black/20 font-hand text-xl italic">
                    The ink is flowing into existence...
                  </div>
                </div>
              )}
            </div>
          </div>

          <footer className="p-12 border-t border-black/5 bg-black/5 h-40 flex items-center">
            <div className="max-w-3xl mx-auto w-full flex gap-6">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="w-full bg-transparent border-b-2 border-black/10 px-0 py-2 font-hand text-2xl outline-none focus:border-goth-blood/30 transition-all placeholder:text-black/10 resize-none h-16"
                  placeholder="Whisper thy query to the pages..."
                />
              </div>
              <button
                onClick={handleSend}
                disabled={isTyping}
                className="bg-goth-blood/80 hover:bg-goth-blood text-white p-5 rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-30 shadow-lg shrink-0"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
