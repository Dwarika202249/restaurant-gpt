import { useAppDispatch, useAppSelector } from './useRedux';
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  setTableNo,
  setSessionId,
  updateItemCustomizations,
  CartItem,
} from '@/store/slices/cartSlice';

/**
 * Custom hook for cart management
 * Provides easy access to cart state and actions
 */
export const useCart = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);

  return {
    // State
    items: cart.items,
    tableNo: cart.tableNo,
    sessionId: cart.sessionId,
    subtotal: cart.subtotal,
    taxAmount: cart.taxAmount,
    total: cart.total,
    lastUpdated: cart.lastUpdated,
    itemCount: cart.items.length,
    totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),

    // Actions
    addItem: (item: CartItem) => dispatch(addItem(item)),
    removeItem: (itemId: string) => dispatch(removeItem(itemId)),
    updateQuantity: (itemId: string, quantity: number) =>
      dispatch(updateQuantity({ itemId, quantity })),
    clearCart: () => dispatch(clearCart()),
    setTableNo: (tableNo: number) => dispatch(setTableNo(tableNo)),
    setSessionId: (sessionId: string) => dispatch(setSessionId(sessionId)),
    updateItemCustomizations: (itemId: string, customizations: { [key: string]: string }) =>
      dispatch(updateItemCustomizations({ itemId, customizations })),

    // Utility methods
    hasItems: () => cart.items.length > 0,
    getItem: (itemId: string) => cart.items.find((item) => item.itemId === itemId),
    incrementItem: (itemId: string) => {
      const item = cart.items.find((i) => i.itemId === itemId);
      if (item) {
        dispatch(updateQuantity({ itemId, quantity: item.quantity + 1 }));
      }
    },
    decrementItem: (itemId: string) => {
      const item = cart.items.find((i) => i.itemId === itemId);
      if (item) {
        dispatch(updateQuantity({ itemId, quantity: Math.max(0, item.quantity - 1) }));
      }
    },
  };
};
