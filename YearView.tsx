import { useMemo } from 'react';
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
  differenceInDays,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarSettings, Astreinte, Holiday, Vacation, Arret, CancelledAstreinteDate, PatternType, CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { getArretColor } from '@/lib/trancheColors';
import { AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const patternClasses: Record<PatternType, string> = {
  none: '',
  stripes: 'pattern-stripes-mini',
  dots: 'pattern-dots-mini',
  crosshatch: 'pattern-crosshatch-mini',
  waves: 'pattern-waves-mini',
  diagonal: 'pattern-diagonal-mini',
  grid: 'pattern-grid-mini',
  zigzag: 'pattern-zigzag-mini',
};

interface YearViewProps {
  year: number;
  settings: CalendarSettings;
  astreintes: Astreinte[];
  holidays: Holiday[];
  vacations: Vacation[];
  arrets: Arret[];
  onMonthClick: (date: Date) => void;
  onDayClick: (date: Date) => void;
  isAstreinteDay: (date: Date, astreintes: Astreinte[]) => Astreinte | null;
  isDateCancelled: (date: Date) => CancelledAstreinteDate | null;
  isHoliday: (date: Date) => Holiday | null;
  isVacationDay: (date: Date) => Vacation | null;
  isArretDay: (date: Date) => Arret | null;
  getEventsForDate: (date: Date) => CalendarEvent[];
  hasConflict: (date: Date, astreintes: Astreinte[]) => boolean;
  getConflictDetails: (date: Date, astreintes: Astreinte[]) => string[];
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i);
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function YearView({
  year,
  settings,
  astreintes,
  holidays,
  vacations,
  arrets,
  onMonthClick,
  onDayClick,
  isAstreinteDay,
  isDateCancelled,
  isHoliday,
  isVacationDay,
  isArretDay,
  getEventsForDate,
  hasConflict,
  getConflictDetails,
}: YearViewProps) {
  const monthsData = useMemo(() => {
    return MONTHS.map(month => {
      const date = new Date(year, month, 1);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const calendarStart = startOfWeek(monthStart, { locale: fr, weekStartsOn: 1 });
      const calendarEnd = endOfWeek(monthEnd, { locale: fr, weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      
      // Get arrets for this month
      const monthArrets = arrets.filter(
        arret => arret.startDate <= monthEnd && arret.endDate >= monthStart
      );
      
      // Get vacations for this month
      const monthVacations = vacations.filter(
        vac => vac.startDate <= monthEnd && vac.endDate >= monthStart
      );
      
      return { date, days, monthArrets, monthVacations, monthStart, monthEnd };
    });
  }, [year, arrets, vacations]);

  const getAstreinteForDate = (date: Date) => {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    
    // Filter relevant astreintes
    const relevantAstreintes = astreintes.filter(a => 
      a.startDate <= yearEnd && a.endDate >= yearStart
    );
    
    return isAstreinteDay(date, relevantAstreintes);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
      {monthsData.map(({ date, days, monthArrets, monthVacations, monthStart, monthEnd }) => {
        // Calculate vacation bars for mini display
        const vacationBars = monthVacations.map(vac => {
          const displayStart = vac.startDate < monthStart ? monthStart : vac.startDate;
          const displayEnd = vac.endDate > monthEnd ? monthEnd : vac.endDate;
          const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
          const startDayIndex = differenceInDays(displayStart, monthStart);
          const width = differenceInDays(displayEnd, displayStart) + 1;
          
          return {
            ...vac,
            left: (startDayIndex / daysInMonth) * 100,
            width: (width / daysInMonth) * 100,
          };
        });
        
        // Calculate arret bars for mini display - group by row for multi-line support
        const arretBars = monthArrets.map(arret => {
          const displayStart = arret.startDate < monthStart ? monthStart : arret.startDate;
          const displayEnd = arret.endDate > monthEnd ? monthEnd : arret.endDate;
          const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
          const startDayIndex = differenceInDays(displayStart, monthStart);
          const width = differenceInDays(displayEnd, displayStart) + 1;
          
          return {
            ...arret,
            left: (startDayIndex / daysInMonth) * 100,
            width: (width / daysInMonth) * 100,
            displayColor: arret.color || getArretColor(arret, settings),
          };
        });
        
        // Sort bars and assign to rows (up to 3 rows)
        const sortedBars = [...arretBars].sort((a, b) => a.left - b.left);
        const rows: typeof arretBars[] = [[], [], []];
        
        sortedBars.forEach(bar => {
          // Find the first row where this bar fits (no overlap)
          for (let i = 0; i < 3; i++) {
            const rowBars = rows[i];
            const overlaps = rowBars.some(existing => 
              !(bar.left + bar.width <= existing.left || bar.left >= existing.left + existing.width)
            );
            if (!overlaps) {
              rows[i].push(bar);
              break;
            }
          }
        });
        
        // Filter out empty rows
        const activeRows = rows.filter(row => row.length > 0);
        
        return (
          <div
            key={date.getMonth()}
            className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            onClick={() => onMonthClick(date)}
          >
            {/* Month header */}
            <div 
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-center font-semibold text-white text-xs sm:text-sm"
              style={{ backgroundColor: settings.titleWeekColor }}
            >
              {format(date, 'MMM', { locale: fr })}
              <span className="hidden sm:inline">{format(date, 'MMM', { locale: fr }).length < 4 ? '' : ''}</span>
            </div>
            
            {/* Vacation indicator bar with day numbers */}
            <div className="relative h-5 bg-muted/20">
              {/* Day numbers grid overlay */}
              <div className="absolute inset-0 grid grid-cols-31 pointer-events-none">
                {Array.from({ length: differenceInDays(monthEnd, monthStart) + 1 }, (_, i) => (
                  <div 
                    key={i} 
                    className="text-[7px] text-center text-muted-foreground/60 leading-5 font-medium"
                    style={{ width: `${100 / (differenceInDays(monthEnd, monthStart) + 1)}%` }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* Vacation bars */}
              {vacationBars.map(vac => (
                <div
                  key={vac.id}
                  className="absolute h-full flex items-center justify-center"
                  style={{ 
                    left: `${vac.left}%`,
                    width: `${vac.width}%`,
                    backgroundColor: settings.vacationColor,
                  }}
                  title={vac.name}
                >
                  <span className="text-[7px] text-white font-medium truncate px-1">{vac.name}</span>
                </div>
              ))}
            </div>
            
            {/* Arret indicator bars - up to 3 rows for overlapping */}
            {activeRows.length > 0 && (
              <div className="space-y-0.5">
                {activeRows.map((rowBars, rowIndex) => (
                  <div key={rowIndex} className="relative h-4 bg-muted/20">
                    {rowBars.map(arret => (
                      <div
                        key={arret.id}
                        className={cn(
                          "absolute h-full flex items-center justify-center",
                          arret.type === 'prepa' && 'opacity-80',
                          arret.pattern && arret.pattern !== 'none' && patternClasses[arret.pattern]
                        )}
                        style={{ 
                          left: `${arret.left}%`,
                          width: `${arret.width}%`,
                          backgroundColor: arret.displayColor,
                        }}
                        title={`${arret.name} (${arret.tranche})`}
                      >
                        <span className="text-[7px] text-white font-medium truncate px-1">{arret.name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            
            {/* Weekday headers */}
            <div className="grid grid-cols-7 bg-muted/30">
              {WEEKDAYS.map((day, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "text-[10px] text-center py-0.5 font-medium",
                    i >= 5 ? "text-muted-foreground" : "text-foreground/70"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Days grid */}
            <div className="grid grid-cols-7 gap-px p-0.5 sm:p-1">
              {days.map((day, index) => {
                const inMonth = isSameMonth(day, date);
                const todayDate = isToday(day);
                const weekend = isWeekend(day);
                const astreinte = inMonth ? getAstreinteForDate(day) : null;
                const cancelledInfo = inMonth ? isDateCancelled(day) : null;
                const holiday = inMonth ? isHoliday(day) : null;
                const vacation = inMonth ? isVacationDay(day) : null;
                const arret = inMonth ? isArretDay(day) : null;
                const dayEvents = inMonth ? getEventsForDate(day) : [];
                const conflict = inMonth ? hasConflict(day, astreintes) : false;
                const conflictDetails = conflict ? getConflictDetails(day, astreintes) : [];

                // Determine background color and pattern
                let bgColor: string | undefined;
                let patternClass = '';

                if (cancelledInfo) {
                  bgColor = settings.astreinteCancelledColor;
                  patternClass = patternClasses[settings.astreinteCancelledPattern];
                } else if (astreinte && !astreinte.isCancelled) {
                  bgColor = astreinte.isPonctuelle
                    ? settings.astreintePonctuelleColor
                    : settings.astreinteColor;
                }

                return (
                  <div
                    key={index}
                    className={cn(
                      "relative text-[7px] sm:text-[9px] h-5 sm:h-7 rounded-sm cursor-pointer hover:ring-1 hover:ring-primary/50 overflow-hidden",
                      !inMonth && "text-muted-foreground/30 pointer-events-none",
                      inMonth && weekend && "text-muted-foreground bg-muted/30",
                      inMonth && todayDate && "ring-1 ring-primary font-bold",
                      inMonth && holiday && !todayDate && "text-holiday font-bold",
                      patternClass
                    )}
                    style={
                      inMonth && bgColor && !todayDate
                        ? { backgroundColor: bgColor, color: '#fff' }
                        : undefined
                    }
                    onClick={(e) => {
                      if (inMonth) {
                        e.stopPropagation();
                        onDayClick(day);
                      }
                    }}
                  >
                    {/* Vacation bar - top (larger) */}
                    {vacation && inMonth && (
                      <div 
                        className="absolute top-0 left-0 right-0 h-[3px]"
                        style={{ backgroundColor: settings.vacationColor }}
                      />
                    )}

                    {/* Arret bar - below vacation (larger) */}
                    {arret && inMonth && (
                      <div 
                        className={cn(
                          "absolute left-0 right-0 h-[3px]",
                          arret.type === 'prepa' && 'opacity-70',
                          arret.pattern && arret.pattern !== 'none' && patternClasses[arret.pattern]
                        )}
                        style={{ 
                          top: vacation ? '3px' : '0px',
                          backgroundColor: arret.color || getArretColor(arret, settings),
                        }}
                      />
                    )}

                    {/* Day number (top-left like month view) */}
                    <span className={cn(
                      "absolute left-[3px] top-[3px] leading-none",
                      (vacation || arret) && "top-[5px]"
                    )}>
                      {inMonth ? format(day, 'd') : ''}
                    </span>

                    {/* Event band (middle of cell) */}
                    {inMonth && dayEvents.length > 0 && (
                      <div 
                        className="absolute left-0 right-0 h-[3px] top-1/2 -translate-y-1/2 z-10"
                        style={{ backgroundColor: dayEvents[0].color }}
                        title={dayEvents.map(ev => ev.name).join(', ')}
                      />
                    )}

                    {/* Conflict indicator + message box */}
                    {conflict && inMonth && (
                      <div className="absolute top-0 right-0 z-20">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              aria-label="Voir les détails du conflit"
                              onPointerDownCapture={(e) => {
                                e.stopPropagation();
                              }}
                              onClickCapture={(e) => {
                                e.stopPropagation();
                              }}
                              onPointerDown={(e) => {
                                e.stopPropagation();
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="hover:scale-110 transition-transform"
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-destructive" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-3">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-destructive flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Conflit détecté !
                              </h4>
                              <div className="text-sm text-foreground space-y-1">
                                {conflictDetails.length > 0 ? (
                                  conflictDetails.map((detail, idx) => (
                                    <p key={idx} className="flex items-start gap-2">
                                      <span className="text-destructive">•</span>
                                      {detail}
                                    </p>
                                  ))
                                ) : (
                                  <p>Un événement est en conflit.</p>
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
