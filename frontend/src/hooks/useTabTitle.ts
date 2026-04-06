import { useEffect } from 'react';

/**
 * Custom hook to dynamically update the browser tab title.
 * @param title The primary title (e.g., 'Dashboard')
 * @param suffix The suffix (e.g., '| Prime Restaurant')
 */
export const useTabTitle = (title: string, suffix?: string) => {
  useEffect(() => {
    const finalSuffix = suffix !== undefined ? suffix : ' | DineOS Admin';
    document.title = `${title}${finalSuffix}`;
  }, [title, suffix]);
};

export default useTabTitle;
