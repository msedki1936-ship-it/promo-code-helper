import { useMemo, useState, useEffect } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isWeekend,
  format,
  getWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarSettings, Astreinte, Holiday, Vacation, CalendarEvent, CancelledAstreinteDate, Arret } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { getArretColor, getArretPattern } from '@/lib/trancheColors';
import { AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useOrientation } from '@/hooks/useOrientation';

interface UnifiedCalendarGridProps {
  currentDate: Date;
  settings: CalendarSettings;
  astreintes: Astreinte[];
  vacations: Vacation[];
  arrets: Arret[];
  isAstreinteDay: (date: Date, astreintes: Astreinte[]) => Astreinte | null;
  hasConflict: (date: Date, astreintes: Astreinte[]) => boolean;
  getConflictDetails: (date: Date, astreintes: Astreinte[]) => string[];
  isHoliday: (date: Date) => Holiday | null;
  isVacationDay: (date: Date) => Vacation | null;
  isArretDay: (date: Date) => Arret | null;
  isREDay: (date: Date) => CalendarEvent | null;
  isCPDay: (date: Date) => CalendarEvent | null;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getNonREEventsForDate: (date: Date) => CalendarEvent[];
  isDateCancelled: (date: Date) => CancelledAstreinteDate | null;
  onDayClick?: (date: Date) => void;
  showWeekNumbers?: boolean;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const WEEKDAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Helper to compute bar spans for a week
function computeBarSpans(
  items: Array<{ startDate: Date; endDate: Date; name: string; color: string; id?: string }>,
  weekDays: Date[]
): Array<{ startCol: number; span: number; item: typeof items[0] }> {
  const bars: Array<{ startCol: number; span: number; item: typeof items[0] }> = [];
  
  items.forEach(item => {
    let startCol = -1;
    let span = 0;
    
    weekDays.forEach((day, index) => {
      const isWithin = day >= item.startDate && day <= item.endDate;
      if (isWithin) {
        if (startCol === -1) startCol = index;
        span++;
      }
    });
    
    if (startCol !== -1 && span > 0) {
      bars.push({ startCol, span, item });
    }
  });
  
  return bars;
}

export function UnifiedCalendarGrid({
  currentDate,
  settings,
  astreintes,
  vacations,
  arrets,
  isAstreinteDay,
  hasConflict,
  getConflictDetails,
  isHoliday,
  isVacationDay,
  isArretDay,
  isREDay,
  isCPDay,
  getEventsForDate,
  getNonREEventsForDate,
  isDateCancelled,
  onDayClick,
  showWeekNumbers = true,
}: UnifiedCalendarGridProps) {
  const { isMobileLandscape } = useOrientation();
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { locale: fr, weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { locale: fr, weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Group days by weeks
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  // Compute vacation bars for header
  const vacationBars = useMemo(() => {
    return weeks.map(week => computeBarSpans(
      vacations.map(v => ({ ...v, color: v.color || settings.vacationColor })),
      week
    ));
  }, [weeks, vacations, settings.vacationColor]);

  // Compute arret bars for header - resolve tranche colors
  const arretBars = useMemo(() => {
    return weeks.map(week => computeBarSpans(
      arrets.map(a => ({ ...a, color: a.color || getArretColor(a, settings) })),
      week
    ));
  }, [weeks, arrets, settings]);

  // RE/CP are day states, NOT events - they should NOT have header bars
  // They only gray out the day cells (handled below in day rendering)

  return (
    <div className={cn(
      "bg-card rounded-2xl border border-border shadow-lg overflow-hidden",
      isMobileLandscape && "text-xs"
    )}>
      {/* Weekday Headers */}
      <div className={cn(
        "grid bg-muted/50",
        showWeekNumbers ? "grid-cols-8" : "grid-cols-7"
      )}>
        {showWeekNumbers && (
          <div className="py-1 sm:py-2 lg:py-3 text-center text-[9px] sm:text-[10px] lg:text-xs font-semibold text-muted-foreground border-r border-border">
            S.
          </div>
        )}
        {(isMobileView ? WEEKDAYS_SHORT : WEEKDAYS).map((day, index) => (
          <div 
            key={`${day}-${index}`} 
            className={cn(
              "py-1 sm:py-2 lg:py-3 text-center text-[9px] sm:text-[10px] lg:text-xs font-semibold text-muted-foreground",
              index >= 5 && "text-primary/70"
            )}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Weeks */}
      <div className="divide-y divide-border/50">
        {weeks.map((week, weekIndex) => {
          const weekNumber = getWeek(week[0], { locale: fr, weekStartsOn: 1 });
          const weekVacationBars = vacationBars[weekIndex] || [];
          const weekArretBars = arretBars[weekIndex] || [];
          
          // RE/CP are NOT shown as bars - they gray out day cells only
          const hasContextBars = weekVacationBars.length > 0 || weekArretBars.length > 0;
          
          return (
            <div key={weekIndex}>
              {/* Context bars above day cells */}
              {hasContextBars && (
                <div className={cn(
                  "grid bg-muted/20",
                  showWeekNumbers ? "grid-cols-8" : "grid-cols-7"
                )}>
                  {showWeekNumbers && <div className="border-r border-border" />}
                  <div className="col-span-7 relative py-1 px-0.5 space-y-0.5">
                    {/* Vacation bars */}
                    {weekVacationBars.map((bar, idx) => (
                      <div
                        key={`vac-${idx}`}
                        className="h-3 sm:h-4 rounded text-[8px] sm:text-[10px] text-white font-medium flex items-center justify-center truncate shadow-sm"
                        style={{
                          backgroundColor: bar.item.color,
                          marginLeft: `${(bar.startCol / 7) * 100}%`,
                          width: `${(bar.span / 7) * 100}%`,
                        }}
                        title={bar.item.name}
                      >
                        {bar.span >= 2 && bar.item.name}
                      </div>
                    ))}
                    {/* Arret bars with patterns */}
                    {weekArretBars.map((bar, idx) => {
                      const arret = arrets.find(a => a.id === bar.item.id);
                      const pattern = arret ? getArretPattern(arret) : 'none';
                      const patternClass = pattern !== 'none' ? `pattern-${pattern === 'stripes' ? 'stripes-light' : pattern}` : '';
                      return (
                        <div
                          key={`arret-${idx}`}
                          className={cn(
                            "h-3 sm:h-4 rounded text-[8px] sm:text-[10px] text-white font-medium flex items-center justify-center truncate shadow-sm",
                            patternClass
                          )}
                          style={{
                            backgroundColor: bar.item.color,
                            marginLeft: `${(bar.startCol / 7) * 100}%`,
                            width: `${(bar.span / 7) * 100}%`,
                          }}
                          title={bar.item.name}
                        >
                          {bar.span >= 2 && bar.item.name}
                        </div>
                      );
                    })}
                    {/* RE/CP are NOT displayed as bars - they gray out day cells only */}
                  </div>
                </div>
              )}
              
              {/* Day cells */}
              <div className={cn(
                "grid",
                showWeekNumbers ? "grid-cols-8" : "grid-cols-7"
              )}>
                {/* Week number */}
                {showWeekNumbers && (
                  <div className="flex items-center justify-center text-[8px] sm:text-[10px] lg:text-xs font-medium text-muted-foreground bg-muted/30 border-r border-border min-h-[50px] sm:min-h-[60px] lg:min-h-[80px]">
                    {weekNumber}
                  </div>
                )}
                
                {week.map((day, dayIndex) => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isTodayDate = isToday(day);
                  const isWeekendDay = isWeekend(day);
                  const astreinte = isAstreinteDay(day, astreintes);
                  const holiday = isHoliday(day);
                  const cancelled = isDateCancelled(day);
                  const reDay = isREDay(day);
                  const cpDay = isCPDay(day);
                  const events = getNonREEventsForDate(day);
                  
                  const hasActiveAstreinte = astreinte && !astreinte.isCancelled && !cancelled;
                  
                  const conflict = hasConflict(day, astreintes);
                  // Event+astreinte conflict: active astreinte + non-RE/CP events = conflict
                  const eventAstreinteConflict = hasActiveAstreinte && events.length > 0;
                  const showConflict = (conflict || eventAstreinteConflict) && isCurrentMonth;
                  const conflictDetails = conflict ? getConflictDetails(day, astreintes) : [];
                  if (eventAstreinteConflict) {
                    events.forEach(e => {
                      conflictDetails.push(`${e.name} / Astreinte`);
                    });
                  }
                  
                  const showCPBackground = cpDay && !hasActiveAstreinte;
                  const showREBackground = reDay && !hasActiveAstreinte && !showCPBackground;

                  // Determine background color
                  let cellBgColor = undefined;
                  if (showCPBackground && isCurrentMonth) {
                    cellBgColor = settings.cpColor;
                  } else if (showREBackground && isCurrentMonth) {
                    cellBgColor = settings.reColor;
                  }

                  return (
                    <button
                      key={dayIndex}
                      onClick={() => isCurrentMonth && onDayClick?.(day)}
                      disabled={!isCurrentMonth}
                      className={cn(
                        "relative min-h-[50px] sm:min-h-[60px] lg:min-h-[80px] flex flex-col p-0.5 sm:p-1 transition-all duration-200 border-r border-border/30 last:border-r-0",
                        "active:scale-[0.98] touch-manipulation",
                        !isCurrentMonth && "opacity-30 bg-muted/20",
                        isCurrentMonth && !showREBackground && !showCPBackground && "hover:bg-accent/30",
                        isWeekendDay && isCurrentMonth && !showREBackground && !showCPBackground && "bg-muted/20",
                        isTodayDate && "ring-2 ring-primary ring-inset"
                      )}
                      style={cellBgColor ? { backgroundColor: cellBgColor } : undefined}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between w-full mb-0.5">
                        <span className={cn(
                          "text-[9px] sm:text-[10px] lg:text-xs font-medium",
                          isTodayDate && "text-primary font-bold bg-primary/20 rounded-full w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex items-center justify-center",
                          holiday && !isTodayDate && "text-destructive font-bold",
                          !isTodayDate && !holiday && isWeekendDay && "text-muted-foreground"
                        )}>
                          {format(day, 'd')}
                        </span>
                        
                        {/* Conflict indicator */}
                        {showConflict && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-destructive rounded-full flex items-center justify-center cursor-pointer animate-pulse">
                                <AlertTriangle className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-2.5 lg:h-2.5 text-white" />
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3 z-50 bg-background">
                              <div className="text-sm font-semibold text-destructive mb-2">{"Conflits détectés"}</div>
                              <ul className="text-xs space-y-1">
                                {conflictDetails.map((detail, i) => (
                                  <li key={i} className="text-muted-foreground">• {detail}</li>
                                ))}
                              </ul>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>

                      {/* Holiday name */}
                      {holiday && isCurrentMonth && (
                        <div className="text-[7px] sm:text-[8px] lg:text-[10px] text-destructive font-medium truncate w-full mb-0.5">
                          {holiday.name}
                        </div>
                      )}

                      {/* Full cell for astreintes, otherwise event bars */}
                      <div className="flex-1 w-full flex flex-col overflow-hidden">
                        {/* Astreinte - takes full cell */}
                        {hasActiveAstreinte && isCurrentMonth && (
                          <div 
                            className="flex-1 rounded text-[6px] sm:text-[7px] lg:text-[9px] text-white font-medium flex items-center justify-center truncate min-h-[20px] sm:min-h-[24px] lg:min-h-[32px]"
                            style={{ 
                              backgroundColor: astreinte.isPonctuelle 
                                ? settings.astreintePonctuelleColor 
                                : settings.astreinteColor 
                            }}
                          >
                            {astreinte.isPonctuelle ? (isMobileView ? 'P' : 'Ponct.') : (isMobileView ? 'AST' : 'Astreinte')}
                          </div>
                        )}
                        
                        {/* Cancelled astreinte - with pattern AND events on top */}
                        {cancelled && isCurrentMonth && !hasActiveAstreinte && events.length === 0 && (
                          <div 
                            className="flex-1 rounded text-[6px] sm:text-[7px] lg:text-[9px] text-white font-medium flex items-center justify-center truncate min-h-[20px] sm:min-h-[24px] lg:min-h-[32px] pattern-crosshatch"
                            style={{ backgroundColor: settings.astreinteCancelledColor }}
                          >
                            {cancelled.name}
                          </div>
                        )}
                        
                        {/* Cancelled astreinte WITH events - show events on colored background */}
                        {cancelled && isCurrentMonth && !hasActiveAstreinte && events.length > 0 && (
                          <div 
                            className="flex-1 rounded p-0.5 pattern-crosshatch"
                            style={{ backgroundColor: settings.astreinteCancelledColor }}
                          >
                            {events.slice(0, 2).map((event, idx) => (
                              <div 
                                key={event.id || idx}
                                className="h-2.5 sm:h-3 lg:h-4 rounded text-[6px] sm:text-[7px] lg:text-[9px] text-white font-medium flex items-center px-0.5 truncate mb-0.5"
                                style={{ backgroundColor: event.color }}
                              >
                                {event.name}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Event bars (non-RE/CP) - only if no full-cell astreinte */}
                        {!hasActiveAstreinte && !cancelled && (
                          <div className="space-y-0.5">
                            {events.slice(0, 2).map((event, idx) => (
                              <div 
                                key={event.id || idx}
                                className="h-2.5 sm:h-3 lg:h-4 rounded text-[6px] sm:text-[7px] lg:text-[9px] text-white font-medium flex items-center px-0.5 truncate"
                                style={{ backgroundColor: event.color }}
                              >
                                {event.name}
                              </div>
                            ))}
                            
                            {/* More events indicator */}
                            {events.length > 2 && isCurrentMonth && (
                              <div className="text-[6px] sm:text-[8px] text-muted-foreground">
                                +{events.length - 2} autres
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}