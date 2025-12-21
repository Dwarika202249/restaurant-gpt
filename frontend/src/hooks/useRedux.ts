import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';

/**
 * Custom hooks for type-safe Redux access
 * Use these instead of plain useDispatch and useSelector
 */

// Use throughout your app instead of plain `useDispatch`
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Use throughout your app instead of plain `useSelector`
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Composite Hook (The fix)
 * Returns dispatch and common state slices to reduce boilerplate in components.
 */
export const useRedux = () => {
  const dispatch = useAppDispatch();
  
  // Assuming your root reducer has an 'auth' slice
  const auth = useAppSelector((state) => state.auth); 
  
  // You can add other slices here as needed
  const state = useAppSelector((state) => state);

  return {
    dispatch,
    auth,
    state, // Returns full state if needed elsewhere
  };
};