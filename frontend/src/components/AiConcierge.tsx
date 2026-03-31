import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  User,
  MessageSquare,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiConciergeProps {
  restaurantSlug: string;
  restaurantName: string;
  themeColor?: string;
}

export const AiConcierge: React.FC<AiConciergeProps> = ({
  restaurantSlug,
  restaurantName,
  themeColor = '#f97316'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Namaste! I am your AI Concierge for **${restaurantName}**. How can I help you explore our menu today?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMsg = message.trim();
    setMessage('');
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_URL}/ai/chat/${restaurantSlug}`, {
        message: userMsg,
        history: history.slice(-6) // Send small history context
      });

      const aiResponse = response.data.data.response;
      setHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setHistory(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to the kitchen. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* Floating Toggle Button - Only shown when closed */
          <motion.button
            key="chat-trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            style={{ backgroundColor: themeColor }}
            className="w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-[0_15px_40px_rgba(0,0,0,0.3)] relative group overflow-hidden"
            title="Ask our AI Concierge"
          >
            <Bot size={28} />
            <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full m-4 shadow-sm border-2 border-transparent group-hover:animate-ping" />
          </motion.button>
        ) : (
          /* Full Chat Window - Shown when open (replaces button) */
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.8, y: 50, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="w-[350px] sm:w-[400px] h-[550px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden glass dark:glass-dark"
          >
            {/* Header */}
            <div
              className="p-6 text-white flex items-center justify-between"
              style={{ backgroundColor: themeColor }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-[10px]">AI Concierge</h3>
                  <p className="text-[8px] font-bold opacity-80 uppercase tracking-widest leading-none">Online & Ready</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                title="Close AI Concierge"
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                aria-label="Close Chat"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Chat Body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50"
            >
              {history.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-3xl text-xs font-medium leading-relaxed shadow-sm ${msg.role === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                    }`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                        <Sparkles size={10} className="text-amber-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Concierge</span>
                      </div>
                    )}
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-strong:text-brand-500">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                    <Loader2 size={14} className="animate-spin text-brand-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chef is Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  title="Chat Input"
                  className="w-full pl-6 pr-14 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 outline-none dark:text-white"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  style={{ backgroundColor: themeColor }}
                  title="Send Message"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="mt-3 text-center text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-50">Powered by Groq AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
