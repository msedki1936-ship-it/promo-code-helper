 import { useState, useEffect, useCallback } from 'react';
 
 export function useLocalStorage<T>(key: string, initialValue: T) {
   // State to store our value
   // Pass initial state function to useState so logic is only executed once
   const [storedValue, setStoredValue] = useState<T>(() => {
     if (typeof window === 'undefined') {
       return initialValue;
     }
     try {
       const item = window.localStorage.getItem(key);
       if (item) {
         const parsed = JSON.parse(item, (k, v) => {
           // Convert date strings back to Date objects
           if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
             return new Date(v);
           }
           return v;
         });
         return parsed;
       }
       return initialValue;
     } catch (error) {
       console.warn(`Error reading localStorage key "${key}":`, error);
       return initialValue;
     }
   });
 
   // Return a wrapped version of useState's setter function that persists to localStorage
   const setValue = useCallback((value: T | ((val: T) => T)) => {
     try {
       // Allow value to be a function so we have same API as useState
       const valueToStore = value instanceof Function ? value(storedValue) : value;
       setStoredValue(valueToStore);
       if (typeof window !== 'undefined') {
         window.localStorage.setItem(key, JSON.stringify(valueToStore));
       }
     } catch (error) {
       console.warn(`Error setting localStorage key "${key}":`, error);
     }
   }, [key, storedValue]);
 
   return [storedValue, setValue] as const;
 }
 
 // Helper to clear all calendar data from localStorage
 export function clearCalendarStorage() {
   const keys = [
     'calendar-events',
     'calendar-vacations', 
     'calendar-holidays',
     'calendar-arrets',
     'calendar-ponctual-astreintes',
     'calendar-cancelled-dates',
     'calendar-settings',
   ];
   keys.forEach(key => localStorage.removeItem(key));
 }