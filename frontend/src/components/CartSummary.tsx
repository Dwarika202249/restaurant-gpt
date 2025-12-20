import { useCart } from '@/hooks/useCart';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

/**
 * CartSummary Component
 * Displays cart totals and provides quick actions
 */
export const CartSummary = () => {
  const cart = useCart();

  if (!cart.hasItems()) {
    return (
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 text-center">
        <ShoppingCart size={32} className="text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">Cart is empty</p>
        <p className="text-sm text-slate-500 mt-1">Add items from the menu to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-4">
      {/* Cart Items List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {cart.items.map((item) => (
          <div key={item.itemId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500 mt-1">₹{item.price.toFixed(2)}</p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => cart.decrementItem(item.itemId)}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
                title="Decrease quantity"
              >
                <Minus size={14} className="text-slate-600" />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
              <button
                onClick={() => cart.incrementItem(item.itemId)}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
                title="Increase quantity"
              >
                <Plus size={14} className="text-slate-600" />
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => cart.removeItem(item.itemId)}
              className="p-1 hover:bg-red-100 rounded ml-2 transition-colors"
              title="Remove item"
            >
              <Trash2 size={14} className="text-red-500" />
            </button>

            {/* Item Total */}
            <div className="text-right ml-4 w-20">
              <p className="text-sm font-semibold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 pt-4 space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-medium text-slate-900">₹{cart.subtotal.toFixed(2)}</span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Tax (5%)</span>
          <span className="font-medium text-slate-900">₹{cart.taxAmount.toFixed(2)}</span>
        </div>

        {/* Total */}
        <div className="flex justify-between pt-2 border-t border-slate-200">
          <span className="font-semibold text-slate-900">Total</span>
          <span className="text-lg font-bold text-orange-600">₹{cart.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Item Count */}
      <div className="text-xs text-slate-500 text-center">
        {cart.totalQuantity} item{cart.totalQuantity !== 1 ? 's' : ''} in cart
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
          Proceed to Checkout
        </button>
        <button
          onClick={() => cart.clearCart()}
          className="w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
};
