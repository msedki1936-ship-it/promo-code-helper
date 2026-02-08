import { useState, useCallback, useEffect } from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { UnifiedToolbar } from '@/components/Calendar/UnifiedToolbar';
import { UnifiedCalendarGrid } from '@/components/Calendar/UnifiedCalendarGrid';
import { UnifiedYearView } from '@/components/Calendar/UnifiedYearView';

import { UnifiedArretBar } from '@/components/Calendar/UnifiedArretBar';
import { UnifiedLegend } from '@/components/Calendar/UnifiedLegend';
import { DayDetails } from '@/components/Calendar/DayDetails';
import { SettingsPanel } from '@/components/Settings/SettingsPanel';
import { AddEventDialog } from '@/components/Dialogs/AddEventDialog';
import { EventsManager } from '@/components/Events/EventsManager';
import { ConflictsList } from '@/components/Conflicts/ConflictsList';
import { ExportPDF } from '@/components/Export/ExportPDF';
import { ExcelImport } from '@/components/Import/ExcelImport';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

const Index = () => {
  const {
    currentDate,
    settings,
    events,
    vacations,
    holidays,
    arrets,
    currentAstreintes,
    ponctualAstreintes,
    cancelledAstreinteDates,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    goToDate,
    updateSettings,
    addEvent,
    updateEvent,
    removeEvent,
    cancelAstreinteDates,
    restoreCancelledDate,
    addPonctualAstreinte,
    updatePonctualAstreinte,
    removePonctualAstreinte,
    addArret,
    updateArret,
    deleteArret,
    addVacation,
    updateVacation,
    deleteVacation,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    isAstreinteDay,
    isDateCancelled,
    hasConflict,
    getConflictDetails,
    isHoliday,
    isVacationDay,
    isArretDay,
    isREDay,
    isCPDay,
    getEventsForDate,
    getNonREEventsForDate,
    getArretsForPeriod,
    getAstreintesForYear,
    importEvents,
    importVacations,
    importArrets,
    importHolidays,
  } = useCalendar();

  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dayDetailsOpen, setDayDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'year' | 'month'>('month');
  const [activeTab, setActiveTab] = useState('calendar');

  // Global error handler for unhandled promise rejections (prevents blank screen)
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event.reason);
      toast.error("Une erreur inattendue s'est produite.");
      event.preventDefault(); // Prevent crash
    };

    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  // Collapsible sections - collapsed by default on mobile
  const defaultSectionsExpanded = !isMobile;

  const yearAstreintes = getAstreintesForYear(currentDate.getFullYear());

  // Swipe navigation handlers - intelligently handles month/year changes
  const handleSwipeNext = useCallback(() => {
    try {
      if (viewMode === 'year') {
        const nextYear = currentDate.getFullYear() + 1;
        if (isNaN(nextYear) || nextYear < 1900 || nextYear > 2100) return;
        const safeDate = new Date(nextYear, 0, 1);
        if (!isNaN(safeDate.getTime())) {
          goToDate(safeDate);
        }
      } else {
        if (currentDate.getMonth() === 11) {
          const nextYear = currentDate.getFullYear() + 1;
          if (isNaN(nextYear) || nextYear < 1900 || nextYear > 2100) return;
          const safeDate = new Date(nextYear, 0, 1);
          if (!isNaN(safeDate.getTime())) {
            goToDate(safeDate);
          }
        } else {
          goToNextMonth();
        }
      }
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Erreur de navigation.");
    }
  }, [viewMode, currentDate, goToDate, goToNextMonth]);

  const handleSwipePrev = useCallback(() => {
    try {
      if (viewMode === 'year') {
        const prevYear = currentDate.getFullYear() - 1;
        if (isNaN(prevYear) || prevYear < 1900 || prevYear > 2100) return;
        const safeDate = new Date(prevYear, 0, 1);
        if (!isNaN(safeDate.getTime())) {
          goToDate(safeDate);
        }
      } else {
        if (currentDate.getMonth() === 0) {
          const prevYear = currentDate.getFullYear() - 1;
          if (isNaN(prevYear) || prevYear < 1900 || prevYear > 2100) return;
          const safeDate = new Date(prevYear, 11, 1);
          if (!isNaN(safeDate.getTime())) {
            goToDate(safeDate);
          }
        } else {
          goToPrevMonth();
        }
      }
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Erreur de navigation.");
    }
  }, [viewMode, currentDate, goToDate, goToPrevMonth]);

  const swipeHandlers = useSwipeNavigation(handleSwipeNext, handleSwipePrev);

  // Get data for selected day
  const selectedDayData = selectedDate ? {
    events: getEventsForDate(selectedDate),
    astreinte: isAstreinteDay(selectedDate, currentAstreintes),
    holiday: isHoliday(selectedDate),
    vacation: isVacationDay(selectedDate),
    arret: isArretDay(selectedDate),
    cancelled: isDateCancelled(selectedDate),
  } : null;

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setDayDetailsOpen(true);
  }, []);

  const handleMonthClick = useCallback((date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return;
    goToDate(date);
    setViewMode('month');
  }, [goToDate]);

  const handleAddEvent = useCallback((eventData: {
    type: 'event' | 'astreinte-ponctuelle' | 'astreinte-cancelled' | 're' | 'cp';
    name: string;
    startDate: Date;
    endDate: Date;
    color: string;
  }) => {
    if (eventData.type === 'event') {
      addEvent({
        type: 'event',
        name: eventData.name,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        color: eventData.color,
      });
    } else if (eventData.type === 're') {
      addEvent({
        type: 're',
        name: eventData.name || 'RE',
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        color: settings.reColor,
      });
    } else if (eventData.type === 'cp') {
      addEvent({
        type: 'cp',
        name: eventData.name || 'CP',
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        color: settings.cpColor,
      });
    } else if (eventData.type === 'astreinte-ponctuelle') {
      addPonctualAstreinte(eventData.startDate, eventData.endDate, eventData.name);
    } else if (eventData.type === 'astreinte-cancelled') {
      cancelAstreinteDates(eventData.startDate, eventData.endDate, eventData.name);
    }
  }, [addEvent, addPonctualAstreinte, cancelAstreinteDates, settings.reColor, settings.cpColor]);

  const handleYearChange = useCallback((year: number) => {
    try {
      // Validate year is a valid number
      const numericYear = typeof year === 'string' ? parseInt(year, 10) : year;
      if (isNaN(numericYear) || numericYear < 1900 || numericYear > 2100) {
        console.warn("Invalid year:", year);
        return;
      }

      const safeMonth = Math.min(Math.max(currentDate.getMonth(), 0), 11);
      const safeDate = new Date(numericYear, safeMonth, 1);

      if (isNaN(safeDate.getTime())) {
        console.warn("Invalid date created from year:", year);
        return;
      }

      goToDate(safeDate);
    } catch (error) {
      console.error("Year change error:", error);
      toast.error("Erreur lors du changement d'année.");
    }
  }, [currentDate, goToDate]);

  const openAddEventFromDetails = useCallback(() => {
    setDayDetailsOpen(false);
    setAddEventOpen(true);
  }, []);

  // Validate currentDate before rendering
  if (!(currentDate instanceof Date) || isNaN(currentDate.getTime())) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Chargement du calendrier…
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 max-w-7xl mx-auto">
        {/* Unified Toolbar - Same options everywhere */}
        <UnifiedToolbar
          currentDate={currentDate}
          currentYear={currentDate.getFullYear()}
          viewMode={viewMode}
          activeTab={activeTab}
          onPrevMonth={viewMode === 'year' 
            ? () => {
                const y = currentDate.getFullYear() - 1;
                if (y >= 1900 && y <= 2100) goToDate(new Date(y, 0, 1));
              }
            : goToPrevMonth
          }
          onNextMonth={viewMode === 'year'
            ? () => {
                const y = currentDate.getFullYear() + 1;
                if (y >= 1900 && y <= 2100) goToDate(new Date(y, 0, 1));
              }
            : goToNextMonth
          }
          onToday={goToToday}
          onAddEvent={() => {
            setSelectedDate(new Date());
            setAddEventOpen(true);
          }}
          onOpenSettings={() => setSettingsOpen(true)}
          onViewModeChange={setViewMode}
          onYearChange={handleYearChange}
          onTabChange={setActiveTab}
        />

        {/* Calendar Tab Content */}
        {activeTab === 'calendar' && (
          <div className="mt-3 sm:mt-4">
            {/* Export/Import buttons - Always visible */}
            <div className="flex items-center justify-end gap-2 mb-3">
              <ExportPDF />
              <ExcelImport
                onImportEvents={importEvents}
                onImportVacations={importVacations}
                onImportArrets={importArrets}
                onImportHolidays={importHolidays}
              />
            </div>

            {/* Collapsible Legend - FIRST */}
            <div className="space-y-2 sm:space-y-3" data-legend-print>
              <UnifiedLegend 
                settings={settings} 
                defaultExpanded={defaultSectionsExpanded}
                arrets={arrets}
                vacations={vacations}
                events={events}
                holidays={holidays}
                astreintes={yearAstreintes}
                ponctualAstreintes={ponctualAstreintes}
                cancelledAstreinteDates={cancelledAstreinteDates}
              />
            </div>

            {/* Collapsible Arrêts - SECOND */}
            <div className="mt-2 sm:mt-3">
              <UnifiedArretBar
                arrets={arrets}
                currentDate={currentDate}
                settings={settings}
                viewMode={viewMode}
                defaultExpanded={defaultSectionsExpanded}
              />
            </div>

            {/* Calendar View - Year or Month with swipe navigation */}
            <div 
              className="mt-3 sm:mt-4" 
              data-calendar-print
              {...swipeHandlers}
            >
              {viewMode === 'year' ? (
                <UnifiedYearView
                  year={currentDate.getFullYear()}
                  settings={settings}
                  astreintes={yearAstreintes}
                  vacations={vacations}
                  arrets={arrets}
                  isAstreinteDay={isAstreinteDay}
                  hasConflict={hasConflict}
                  isHoliday={isHoliday}
                  isVacationDay={isVacationDay}
                  isArretDay={isArretDay}
                  isREDay={isREDay}
                  isCPDay={isCPDay}
                  getEventsForDate={getEventsForDate}
                  getNonREEventsForDate={getNonREEventsForDate}
                  isDateCancelled={isDateCancelled}
                  onMonthClick={handleMonthClick}
                  onDayClick={handleDayClick}
                />
              ) : (
                <UnifiedCalendarGrid
                  currentDate={currentDate}
                  settings={settings}
                  astreintes={currentAstreintes}
                  vacations={vacations}
                  arrets={arrets}
                  isAstreinteDay={isAstreinteDay}
                  hasConflict={hasConflict}
                  getConflictDetails={getConflictDetails}
                  isHoliday={isHoliday}
                  isVacationDay={isVacationDay}
                  isArretDay={isArretDay}
                  isREDay={isREDay}
                  isCPDay={isCPDay}
                  getEventsForDate={getEventsForDate}
                  getNonREEventsForDate={getNonREEventsForDate}
                  isDateCancelled={isDateCancelled}
                  onDayClick={handleDayClick}
                  showWeekNumbers={true}
                />
              )}
            </div>
          </div>
        )}

        {/* Events Management Tab */}
        {activeTab === 'events' && (
          <div className="mt-3 sm:mt-4">
            <EventsManager
              events={events}
              vacations={vacations}
              arrets={arrets}
              holidays={holidays}
              ponctualAstreintes={ponctualAstreintes}
              cancelledAstreinteDates={cancelledAstreinteDates}
              onUpdateEvent={updateEvent}
              onDeleteEvent={removeEvent}
              onUpdateVacation={updateVacation}
              onDeleteVacation={deleteVacation}
              onUpdateArret={updateArret}
              onDeleteArret={deleteArret}
              onUpdateHoliday={updateHoliday}
              onDeleteHoliday={deleteHoliday}
              onRemovePonctualAstreinte={removePonctualAstreinte}
              onUpdatePonctualAstreinte={updatePonctualAstreinte}
              onRestoreCancelledDate={restoreCancelledDate}
              onAddVacation={addVacation}
              onAddArret={addArret}
              onAddHoliday={addHoliday}
              onAddPonctualAstreinte={addPonctualAstreinte}
              onCancelAstreinteDates={cancelAstreinteDates}
              onAddEvent={addEvent}
            />
          </div>
        )}

        {/* Conflicts Tab */}
        {activeTab === 'conflicts' && (
          <div className="mt-3 sm:mt-4">
            <ConflictsList
              events={events}
              astreintes={yearAstreintes}
              settings={settings}
              year={currentDate.getFullYear()}
              cancelledDates={cancelledAstreinteDates}
            />
          </div>
        )}
      </div>

      {/* Day Details Drawer - Works on all screen sizes */}
      <DayDetails
        date={selectedDate || null}
        isOpen={dayDetailsOpen}
        onClose={() => setDayDetailsOpen(false)}
        onAddEvent={openAddEventFromDetails}
        events={selectedDayData?.events || []}
        astreinte={selectedDayData?.astreinte || null}
        holiday={selectedDayData?.holiday || null}
        vacation={selectedDayData?.vacation || null}
        arret={selectedDayData?.arret || null}
        cancelled={selectedDayData?.cancelled || null}
        settings={settings}
      />

      {/* Settings Panel - Full functionality */}
      <SettingsPanel
        settings={settings}
        onUpdateSettings={updateSettings}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Add Event Dialog - Full functionality */}
      <AddEventDialog
        isOpen={addEventOpen}
        onClose={() => setAddEventOpen(false)}
        onAdd={handleAddEvent}
        initialDate={selectedDate}
        existingEvents={events.map(e => ({ name: e.name, startDate: e.startDate, endDate: e.endDate }))}
      />

      {/* Backdrop for settings */}
      {settingsOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default Index;
