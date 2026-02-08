import { useMemo } from 'react';
import { 
  startOfYear,
  endOfYear,
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  eachMonthOfInterval,
  isSameMonth,
  isToday,
  isWeekend,
  format,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarSettings, Astreinte, Holiday, Vacation, CalendarEvent, CancelledAstreinteDate, Arret } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { useOrientation } from '@/hooks/useOrientation';

interface UnifiedYearViewProps {
  year: number;
  settings: CalendarSettings;
  astreintes: Astreinte[];
  vacations: Vacation[];
  arrets: Arret[];
  isAstreinteDay: (date: Date, astreintes: Astreinte[]) => Astreinte | null;
  hasConflict: (date: Date, astreintes: Astreinte[]) => boolean;
  isHoliday: (date: Date) => Holiday | null;
  isVacationDay: (date: Date) => Vacation | null;
  isArretDay: (date: Date) => Arret | null;
  isREDay: (date: Date) => CalendarEvent | null;
  isCPDay: (date: Date) => CalendarEvent | null;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getNonREEventsForDate: (date: Date) => CalendarEvent[];
  isDateCancelled: (date: Date) => CancelledAstreinteDate | null;
  onMonthClick?: (date: Date) => void;
  onDayClick?: (date: Date) => void;
}

const WEEKDAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Helper: compute bar spans for a week of days (vacations only)
function computeWeekVacationBars(
  vacations: Array<{ startDate: Date; endDate: Date; name: string; color: string }>,
  weekDays: Date[]
): Array<{ startCol: number; span: number; item: typeof vacations[0] }> {
  const bars: Array<{ startCol: number; span: number; item: typeof vacations[0] }> = [];
  vacations.forEach(item => {
    let startCol = -1;
    let span = 0;
    weekDays.forEach((day, index) => {
      if (day >= item.startDate && day <= item.endDate) {
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

export function UnifiedYearView({
  year,
  settings,
  astreintes,
  vacations,
  isAstreinteDay,
  hasConflict,
  isHoliday,
  isREDay,
  isCPDay,
  getNonREEventsForDate,
  isDateCancelled,
  onMonthClick,
  onDayClick,
}: UnifiedYearViewProps) {
  const { isMobileLandscape } = useOrientation();

  const months = useMemo(() => {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(yearStart);
    return eachMonthOfInterval({ start: yearStart, end: yearEnd });
  }, [year]);

  const gridCols = isMobileLandscape 
    ? 'grid-cols-3' 
    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  return (
    <div className={cn("grid gap-2 sm:gap-3 lg:gap-4", gridCols)}>
      {months.map((month) => (
        <MonthMiniCard
          key={month.toString()}
          month={month}
          settings={settings}
          astreintes={astreintes}
          vacations={vacations}
          isAstreinteDay={isAstreinteDay}
          hasConflict={hasConflict}
          isHoliday={isHoliday}
          isREDay={isREDay}
          isCPDay={isCPDay}
          getNonREEventsForDate={getNonREEventsForDate}
          isDateCancelled={isDateCancelled}
          onMonthClick={onMonthClick}
          onDayClick={onDayClick}
        />
      ))}
    </div>
  );
}

function MonthMiniCard({
  month,
  settings,
  astreintes,
  vacations,
  isAstreinteDay,
  hasConflict,
  isHoliday,
  isREDay,
  isCPDay,
  getNonREEventsForDate,
  isDateCancelled,
  onMonthClick,
  onDayClick,
}: {
  month: Date;
  settings: CalendarSettings;
  astreintes: Astreinte[];
  vacations: Vacation[];
  isAstreinteDay: (date: Date, astreintes: Astreinte[]) => Astreinte | null;
  hasConflict: (date: Date, astreintes: Astreinte[]) => boolean;
  isHoliday: (date: Date) => Holiday | null;
  isREDay: (date: Date) => CalendarEvent | null;
  isCPDay: (date: Date) => CalendarEvent | null;
  getNonREEventsForDate: (date: Date) => CalendarEvent[];
  isDateCancelled: (date: Date) => CancelledAstreinteDate | null;
  onMonthClick?: (date: Date) => void;
  onDayClick?: (date: Date) => void;
}) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { locale: fr, weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { locale: fr, weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Only vacation bars (NO arrêt bars in annual view)
  const vacItems = vacations
    .filter(v => v.startDate <= monthEnd && v.endDate >= monthStart)
    .map(v => ({ ...v, color: v.color || settings.vacationColor }));

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <button
        onClick={() => onMonthClick?.(month)}
        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-primary/10 hover:bg-primary/20 transition-colors text-center touch-manipulation"
      >
        <span className="text-xs sm:text-sm font-semibold text-primary capitalize">
          {format(month, 'MMMM', { locale: fr })}
        </span>
      </button>

      <div className="grid grid-cols-7 bg-muted/30">
        {WEEKDAYS_SHORT.map((day, index) => (
          <div 
            key={`${month}-${day}-${index}`}
            className={cn(
              "py-0.5 text-center text-[8px] sm:text-[10px] font-medium text-muted-foreground",
              index >= 5 && "text-primary/60"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="p-0.5 sm:p-1">
        {weeks.map((week, weekIndex) => {
          const weekVacBars = computeWeekVacationBars(vacItems, week);
          const hasContextBars = weekVacBars.length > 0;

          return (
            <div key={weekIndex}>
              {hasContextBars && (
                <div className="relative px-0.5 space-y-px py-px">
                  {weekVacBars.map((bar, idx) => (
                    <div
                      key={`vac-${idx}`}
                      className="h-[5px] sm:h-[6px] rounded-sm text-[5px] text-white flex items-center justify-center truncate"
                      style={{
                        backgroundColor: bar.item.color,
                        marginLeft: `${(bar.startCol / 7) * 100}%`,
                        width: `${(bar.span / 7) * 100}%`,
                      }}
                      title={bar.item.name}
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-7 gap-px">
                {week.map((day, dayIndex) => {
                  const isCurrentMonth = isSameMonth(day, month);
                  const isTodayDate = isToday(day);
                  const isWeekendDay = isWeekend(day);
                  const astreinte = isAstreinteDay(day, astreintes);
                  const holiday = isHoliday(day);
                  const cancelled = isDateCancelled(day);
                  const conflict = hasConflict(day, astreintes);
                  const reDay = isREDay(day);
                  const cpDay = isCPDay(day);
                  const events = getNonREEventsForDate(day);
                  
                  const hasActiveAstreinte = astreinte && !astreinte.isCancelled && !cancelled;
                  const showCPBackground = cpDay && !hasActiveAstreinte;
                  const showREBackground = reDay && !hasActiveAstreinte && !showCPBackground;
                  const hasEvents = events.length > 0;

                  let cellBgColor = undefined;
                  if (hasActiveAstreinte && isCurrentMonth) {
                    cellBgColor = astreinte.isPonctuelle 
                      ? settings.astreintePonctuelleColor 
                      : settings.astreinteColor;
                  } else if (showCPBackground && isCurrentMonth) {
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
                        "relative aspect-square flex flex-col items-center justify-center text-[9px] sm:text-[10px] rounded-sm transition-all",
                        "touch-manipulation active:scale-95",
                        !isCurrentMonth && "opacity-20",
                        isCurrentMonth && !showREBackground && !showCPBackground && !hasActiveAstreinte && "hover:bg-accent/50",
                        isWeekendDay && isCurrentMonth && !showREBackground && !showCPBackground && !hasActiveAstreinte && "bg-muted/40",
                        isTodayDate && "ring-1 ring-primary font-bold",
                        holiday && isCurrentMonth && !hasActiveAstreinte && "text-destructive",
                        hasActiveAstreinte && isCurrentMonth && "text-white"
                      )}
                      style={cellBgColor ? { backgroundColor: cellBgColor } : undefined}
                    >
                      {format(day, 'd')}
                      
                      {isCurrentMonth && (
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-px pb-0.5">
                          {hasEvents && !hasActiveAstreinte && (
                            <div 
                              className="w-2 h-0.5 rounded-full"
                              style={{ backgroundColor: events[0].color }}
                            />
                          )}
                          {cancelled && (
                            <div 
                              className="w-2 h-0.5 rounded-full"
                              style={{ backgroundColor: settings.astreinteCancelledColor }}
                            />
                          )}
                        </div>
                      )}
                      
                      {conflict && isCurrentMonth && (
                        <div className="absolute top-0 right-0 w-1 h-1 rounded-full bg-destructive" />
                      )}
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
