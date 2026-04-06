import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VITE_API_URL } from '@/config/env';
import { Sparkles, Plus, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Suggestion {
  itemId: string;
  name: string;
  reason: string;
  item: {
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
}

interface CartSuggestionsProps {
  cartItems: any[];
  restaurantSlug: string;
  onAdd: (item: any) => void;
  themeColor?: string;
}

export const CartSuggestions: React.FC<CartSuggestionsProps> = ({
  cartItems,
  restaurantSlug,
  onAdd,
  themeColor = '#f97316'
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${VITE_API_URL}/ai/cart-suggestions/${restaurantSlug}`, {
          cartItems: cartItems.map(i => ({ name: i.name, price: i.price }))
        });
        setSuggestions(response.data.data.suggestions || []);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 1000); // Debounce
    return () => clearTimeout(timeoutId);
  }, [cartItems.length, restaurantSlug]);

  if (cartItems.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Sparkles size={14} className="text-amber-500 animate-pulse" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Chef's Recommendations</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex items-center gap-3 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
            <Loader2 size={16} className="animate-spin text-brand-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chef is analyzing pairings...</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {suggestions.map((suggestion, idx) => (
              <motion.div
                key={suggestion.itemId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-4 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shrink-0">
                    {suggestion.item.imageUrl ? (
                      <img src={suggestion.item.imageUrl} alt={suggestion.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Sparkles size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-black uppercase italic text-xs tracking-tight text-slate-900 dark:text-white truncate">
                        {suggestion.name}
                      </p>
                      <span className="text-[10px] font-black text-brand-500">₹{suggestion.item.price}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold mt-1 line-clamp-2 leading-tight bg-brand-500/5 dark:bg-brand-500/10 p-1.5 rounded-lg border border-brand-500/10 italic">
                      "{suggestion.reason}"
                    </p>
                  </div>
                  <button
                    onClick={() => onAdd(suggestion.item)}
                    style={{ backgroundColor: themeColor }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all shrink-0"
                    title={`Add ${suggestion.name} to tray`}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
