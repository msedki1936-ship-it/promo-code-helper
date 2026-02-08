import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  CalendarEvent, 
  Vacation, 
  Holiday, 
  Arret, 
  CalendarSettings,
  defaultSettings,
  Astreinte,
  CancelledAstreinteDate
} from '@/types/calendar';
import {
  initialVacations,
  initialHolidays,
  initialArrets,
  initialEvents,
  ASTREINTE_START_DATE,
  ASTREINTE_CYCLE_WEEKS,
} from '@/data/initialData';
import { 
  addDays, 
  addWeeks, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  differenceInWeeks,
  format,
} from 'date-fns';

// Helper to parse dates from localStorage
const parseStoredData = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item, (k, v) => {
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
        return new Date(v);
      }
      return v;
    });
  } catch {
    return fallback;
  }
};

export function useCalendar() {
  // Initialize from localStorage or fallback to initial data
  const [currentDate, setCurrentDate] = useState(() => {
    const stored = localStorage.getItem('calendar-current-date');
    if (stored) {
      const date = new Date(stored);
      if (!isNaN(date.getTime())) return date;
    }
    return new Date(2026, 0, 1);
  });
  
  const [settings, setSettings] = useState<CalendarSettings>(() => 
    parseStoredData('calendar-settings', defaultSettings)
  );
  
  const [events, setEvents] = useState<CalendarEvent[]>(() => 
    parseStoredData('calendar-events', initialEvents)
  );
  
  const [vacations, setVacations] = useState<Vacation[]>(() => 
    parseStoredData('calendar-vacations', initialVacations)
  );
  
  const [holidays, setHolidays] = useState<Holiday[]>(() => 
    parseStoredData('calendar-holidays', initialHolidays)
  );
  
  const [arrets, setArrets] = useState<Arret[]>(() => 
    parseStoredData('calendar-arrets', initialArrets)
  );
  
  const [ponctualAstreintes, setPonctualAstreintes] = useState<Astreinte[]>(() => 
    parseStoredData('calendar-ponctual-astreintes', [])
  );
  
  const [cancelledAstreinteDates, setCancelledAstreinteDates] = useState<CancelledAstreinteDate[]>(() => 
    parseStoredData('calendar-cancelled-dates', [])
  );

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('calendar-current-date', currentDate.toISOString());
  }, [currentDate]);
  
  useEffect(() => {
    localStorage.setItem('calendar-settings', JSON.stringify(settings));
  }, [settings]);
  
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);
  
  useEffect(() => {
    localStorage.setItem('calendar-vacations', JSON.stringify(vacations));
  }, [vacations]);
  
  useEffect(() => {
    localStorage.setItem('calendar-holidays', JSON.stringify(holidays));
  }, [holidays]);
  
  useEffect(() => {
    localStorage.setItem('calendar-arrets', JSON.stringify(arrets));
  }, [arrets]);
  
  useEffect(() => {
    localStorage.setItem('calendar-ponctual-astreintes', JSON.stringify(ponctualAstreintes));
  }, [ponctualAstreintes]);
  
  useEffect(() => {
    localStorage.setItem('calendar-cancelled-dates', JSON.stringify(cancelledAstreinteDates));
  }, [cancelledAstreinteDates]);

  /* 🔒 Sécurisation centrale des dates */
  const safeSetDate = useCallback((date: Date) => {
    if (!(date instanceof Date)) return;
    if (isNaN(date.getTime())) return;
    setCurrentDate(date);
  }, []);

  /* ================= ASTREINTES ================= */

  const generateAstreintes = useCallback((startDate: Date, endDate: Date): Astreinte[] => {
    const astreintes: Astreinte[] = [];
    let currentStart = ASTREINTE_START_DATE;

    const weeksDiff = differenceInWeeks(startDate, ASTREINTE_START_DATE);
    const cyclesBefore = Math.floor(weeksDiff / ASTREINTE_CYCLE_WEEKS);
    if (cyclesBefore > 0) {
      currentStart = addWeeks(ASTREINTE_START_DATE, cyclesBefore * ASTREINTE_CYCLE_WEEKS);
    }

    currentStart = addWeeks(currentStart, -ASTREINTE_CYCLE_WEEKS);

    while (currentStart <= endDate) {
      const astreinteEnd = addDays(currentStart, 7);
      astreintes.push({
        id: `astreinte-${format(currentStart, 'yyyy-MM-dd')}`,
        startDate: new Date(currentStart),
        endDate: astreinteEnd,
        isCancelled: false,
        isPonctuelle: false,
      });
      currentStart = addWeeks(currentStart, ASTREINTE_CYCLE_WEEKS);
    }

    ponctualAstreintes.forEach(pa => {
      if (pa.startDate <= endDate && pa.endDate >= startDate) {
        astreintes.push(pa);
      }
    });

    return astreintes;
  }, [ponctualAstreintes]);

  /* ================= NAVIGATION ================= */

  const goToNextMonth = useCallback(() => {
    safeSetDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }, [currentDate, safeSetDate]);

  const goToPrevMonth = useCallback(() => {
    safeSetDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }, [currentDate, safeSetDate]);

  const goToToday = useCallback(() => {
    safeSetDate(new Date());
  }, [safeSetDate]);

  const goToDate = useCallback((date: Date) => {
    safeSetDate(date);
  }, [safeSetDate]);

  const goToYear = useCallback((year: number) => {
    if (isNaN(year)) return;
    const month = Math.min(Math.max(currentDate.getMonth(), 0), 11);
    safeSetDate(new Date(year, month, 1));
  }, [currentDate, safeSetDate]);

  /* ================= COMPUTED ================= */

  const monthDays = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    });
  }, [currentDate]);

  const currentAstreintes = useMemo(() => {
    return generateAstreintes(startOfMonth(currentDate), endOfMonth(currentDate));
  }, [currentDate, generateAstreintes]);

  const getAstreintesForYear = useCallback((year: number) => {
    return generateAstreintes(new Date(year, 0, 1), new Date(year, 11, 31));
  }, [generateAstreintes]);

  /* ================= EVENTS ================= */

  const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
    };
    setEvents(prev => [...prev, newEvent]);
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    return events.filter(event => 
      isWithinInterval(date, { start: event.startDate, end: event.endDate }) ||
      isSameDay(date, event.startDate) ||
      isSameDay(date, event.endDate)
    );
  }, [events]);

  const getNonRECPEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    return getEventsForDate(date).filter(e => e.type !== 're' && e.type !== 'cp');
  }, [getEventsForDate]);

  // Alias for backwards compatibility
  const getNonREEventsForDate = getNonRECPEventsForDate;

  const isREDay = useCallback((date: Date): CalendarEvent | null => {
    const reEvents = events.filter(e => 
      e.type === 're' && (
        isWithinInterval(date, { start: e.startDate, end: e.endDate }) ||
        isSameDay(date, e.startDate) ||
        isSameDay(date, e.endDate)
      )
    );
    return reEvents.length > 0 ? reEvents[0] : null;
  }, [events]);

  const isCPDay = useCallback((date: Date): CalendarEvent | null => {
    const cpEvents = events.filter(e => 
      e.type === 'cp' && (
        isWithinInterval(date, { start: e.startDate, end: e.endDate }) ||
        isSameDay(date, e.startDate) ||
        isSameDay(date, e.endDate)
      )
    );
    return cpEvents.length > 0 ? cpEvents[0] : null;
  }, [events]);

  /* ================= ASTREINTE MANAGEMENT ================= */

  const isAstreinteDay = useCallback((date: Date, astreintes: Astreinte[]): Astreinte | null => {
    for (const astreinte of astreintes) {
      if (
        isWithinInterval(date, { start: astreinte.startDate, end: astreinte.endDate }) ||
        isSameDay(date, astreinte.startDate) ||
        isSameDay(date, astreinte.endDate)
      ) {
        return astreinte;
      }
    }
    return null;
  }, []);

  const isDateCancelled = useCallback((date: Date): CancelledAstreinteDate | null => {
    for (const cancelled of cancelledAstreinteDates) {
      if (isSameDay(date, cancelled.date)) {
        return cancelled;
      }
    }
    return null;
  }, [cancelledAstreinteDates]);

  const hasConflict = useCallback((date: Date, astreintes: Astreinte[]): boolean => {
    // Check if the date is cancelled - if so, no conflict
    const isCancelled = cancelledAstreinteDates.some(c => isSameDay(c.date, date));
    if (isCancelled) return false;
    
    const activeAstreintes = astreintes.filter(a => 
      !a.isCancelled && (
        isWithinInterval(date, { start: a.startDate, end: a.endDate }) ||
        isSameDay(date, a.startDate) ||
        isSameDay(date, a.endDate)
      )
    );
    return activeAstreintes.length > 1;
  }, [cancelledAstreinteDates]);

  const getConflictDetails = useCallback((date: Date, astreintes: Astreinte[]): string[] => {
    // Check if the date is cancelled - if so, no conflict details
    const isCancelled = cancelledAstreinteDates.some(c => isSameDay(c.date, date));
    if (isCancelled) return [];
    
    const conflicting = astreintes.filter(a => 
      !a.isCancelled && (
        isWithinInterval(date, { start: a.startDate, end: a.endDate }) ||
        isSameDay(date, a.startDate) ||
        isSameDay(date, a.endDate)
      )
    );
    return conflicting.map(a => a.name || `Astreinte ${format(a.startDate, 'dd/MM')}`);
  }, [cancelledAstreinteDates]);

  const cancelAstreinteDates = useCallback((startDate: Date, endDate: Date, name: string) => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const newCancellations: CancelledAstreinteDate[] = days.map((day, index) => ({
      id: `cancelled-${Date.now()}-${index}`,
      date: day,
      name,
      astreinteId: '',
    }));
    setCancelledAstreinteDates(prev => [...prev, ...newCancellations]);
  }, []);

  const restoreCancelledDate = useCallback((id: string) => {
    setCancelledAstreinteDates(prev => prev.filter(c => c.id !== id));
  }, []);

  const addPonctualAstreinte = useCallback((startDate: Date, endDate: Date, name?: string) => {
    const newAstreinte: Astreinte = {
      id: `ponctual-${Date.now()}`,
      name,
      startDate,
      endDate,
      isCancelled: false,
      isPonctuelle: true,
    };
    setPonctualAstreintes(prev => [...prev, newAstreinte]);
  }, []);

  const updatePonctualAstreinte = useCallback((id: string, updates: Partial<Astreinte>) => {
    setPonctualAstreintes(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const removePonctualAstreinte = useCallback((id: string) => {
    setPonctualAstreintes(prev => prev.filter(a => a.id !== id));
  }, []);

  /* ================= HOLIDAYS ================= */

  const isHoliday = useCallback((date: Date): Holiday | null => {
    for (const holiday of holidays) {
      if (isSameDay(date, holiday.date)) {
        return holiday;
      }
    }
    return null;
  }, [holidays]);

  const addHoliday = useCallback((holiday: Omit<Holiday, 'id'>) => {
    setHolidays(prev => [...prev, holiday as Holiday]);
  }, []);

  const updateHoliday = useCallback((date: Date, updates: Partial<Holiday>) => {
    setHolidays(prev => prev.map(h => 
      isSameDay(h.date, date) ? { ...h, ...updates } : h
    ));
  }, []);

  const deleteHoliday = useCallback((date: Date) => {
    setHolidays(prev => prev.filter(h => !isSameDay(h.date, date)));
  }, []);

  /* ================= VACATIONS ================= */

  const isVacationDay = useCallback((date: Date): Vacation | null => {
    for (const vacation of vacations) {
      if (
        isWithinInterval(date, { start: vacation.startDate, end: vacation.endDate }) ||
        isSameDay(date, vacation.startDate) ||
        isSameDay(date, vacation.endDate)
      ) {
        return vacation;
      }
    }
    return null;
  }, [vacations]);

  const addVacation = useCallback((vacation: Omit<Vacation, 'id'>) => {
    const newVacation: Vacation = {
      ...vacation,
      id: `vacation-${Date.now()}`,
    };
    setVacations(prev => [...prev, newVacation]);
  }, []);

  const updateVacation = useCallback((id: string, updates: Partial<Vacation>) => {
    setVacations(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  }, []);

  const deleteVacation = useCallback((id: string) => {
    setVacations(prev => prev.filter(v => v.id !== id));
  }, []);

  /* ================= ARRETS ================= */

  const isArretDay = useCallback((date: Date): Arret | null => {
    for (const arret of arrets) {
      if (
        isWithinInterval(date, { start: arret.startDate, end: arret.endDate }) ||
        isSameDay(date, arret.startDate) ||
        isSameDay(date, arret.endDate)
      ) {
        return arret;
      }
    }
    return null;
  }, [arrets]);

  const addArret = useCallback((arret: Omit<Arret, 'id'>) => {
    const newArret: Arret = {
      ...arret,
      id: `arret-${Date.now()}`,
    };
    setArrets(prev => [...prev, newArret]);
  }, []);

  const updateArret = useCallback((id: string, updates: Partial<Arret>) => {
    setArrets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteArret = useCallback((id: string) => {
    setArrets(prev => prev.filter(a => a.id !== id));
  }, []);

  const getArretsForPeriod = useCallback((start: Date, end: Date): Arret[] => {
    return arrets.filter(a => 
      (a.startDate <= end && a.endDate >= start)
    );
  }, [arrets]);

  /* ================= IMPORT ================= */

  const importEvents = useCallback((newEvents: CalendarEvent[]) => {
    setEvents(prev => [...prev, ...newEvents]);
  }, []);

  const importVacations = useCallback((newVacations: Vacation[]) => {
    setVacations(prev => [...prev, ...newVacations]);
  }, []);

  const importArrets = useCallback((newArrets: Arret[]) => {
    setArrets(prev => [...prev, ...newArrets]);
  }, []);

  const importHolidays = useCallback((newHolidays: Holiday[]) => {
    setHolidays(prev => [...prev, ...newHolidays]);
  }, []);

  /* ================= RETURN ================= */

  return {
    currentDate,
    settings,
    events,
    vacations,
    holidays,
    arrets,
    ponctualAstreintes,
    cancelledAstreinteDates,
    monthDays,
    currentAstreintes,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    goToDate,
    goToYear,
    updateSettings: (s: Partial<CalendarSettings>) => setSettings(p => ({ ...p, ...s })),
    generateAstreintes,
    getAstreintesForYear,
    // Events
    addEvent,
    updateEvent,
    removeEvent,
    getEventsForDate,
    getNonREEventsForDate,
    getNonRECPEventsForDate,
    isREDay,
    isCPDay,
    // Astreintes
    isAstreinteDay,
    isDateCancelled,
    hasConflict,
    getConflictDetails,
    cancelAstreinteDates,
    restoreCancelledDate,
    addPonctualAstreinte,
    updatePonctualAstreinte,
    removePonctualAstreinte,
    // Holidays
    isHoliday,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    // Vacations
    isVacationDay,
    addVacation,
    updateVacation,
    deleteVacation,
    // Arrets
    isArretDay,
    addArret,
    updateArret,
    deleteArret,
    getArretsForPeriod,
    // Import
    importEvents,
    importVacations,
    importArrets,
    importHolidays,
  };
}
