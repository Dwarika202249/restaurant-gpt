import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';

interface OrderStatusWidgetProps {
  orders: any[];
  onRefresh: () => void;
}

const OrderStatusWidget: React.FC<OrderStatusWidgetProps> = ({ orders, onRefresh }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Focus only on non-completed orders for this "In-Progress" widget
  const activeOrders = orders.filter(o => o.status !== 'completed');

  if (activeOrders.length === 0) return null;

  const mainOrder = activeOrders[0];

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[60] flex justify-center pointer-events-none">
      <motion.div 
        layout
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-900 border border-white/10 shadow-2xl rounded-[2rem] overflow-hidden w-full max-w-sm pointer-events-auto"
      >
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-5 flex items-center justify-between group"
          title={isOpen ? "Hide Status" : "View Order Progress"}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <ChefHat className="text-white" size={20} />
              </motion.div>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 line-clamp-1">
                {activeOrders.length} Order{activeOrders.length > 1 ? 's' : ''} in progress
              </p>
              <h4 className="text-white text-xs font-black uppercase tracking-widest">
                 {mainOrder.status === 'new' && 'Order Received'}
                 {mainOrder.status === 'preparing' && 'In the Kitchen'}
                 {mainOrder.status === 'ready' && 'Ready for Service'}
                 {mainOrder.status === 'completed' && 'Deliciously Done'}
              </h4>
            </div>
          </div>
          <div className={`p-2 rounded-xl bg-white/5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
            <ChevronRight className="text-white" size={16} />
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 px-5 pb-5"
            >
              <div className="space-y-4 pt-4 text-left">
                 {activeOrders.map((order) => (
                   <div key={order._id} className="flex items-start justify-between">
                      <div>
                         <p className="text-white text-[10px] font-black uppercase tracking-widest mb-1">Order #{order.orderNumber?.split('-').pop()}</p>
                         <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${order.status === 'ready' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{order.status}</span>
                          </div>
                      </div>
                      <div className="text-right">
                         <p className="text-white text-[10px] font-black">₹{order.total?.toFixed(2)}</p>
                         <p className="text-slate-500 text-[8px] font-bold">{new Date(order.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                   </div>
                 ))}
                 <button 
                   onClick={onRefresh}
                   className="w-full mt-2 py-2 bg-white/5 text-white/60 text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition-colors"
                 >
                   Refresh Status
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default OrderStatusWidget;
