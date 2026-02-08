import { useMemo } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  isSameMonth,
  isToday,
  isWeekend,
  format,
  getDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarSettings, Astreinte, Holiday, Vacation, CalendarEvent, CancelledAstreinteDate, Arret } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface MobileYearViewProps {
  year: number;
  settings: CalendarSettings;
  astreintes: Astreinte[];
  isAstreinteDay: (date: Date, astreintes: Astreinte[]) => Astreinte | null;
  hasConflict: (date: Date, astreintes: Astreinte[]) => boolean;
  isHoliday: (date: Date) => Holiday | null;
  isVacationDay: (date: Date) => Vacation | null;
  isArretDay: (date: Date) => Arret | null;
  getEventsForDate: (date: Date) => CalendarEvent[];
  isDateCancelled: (date: Date) => CancelledAstreinteDate | null;
  onMonthClick?: (date: Date) => void;
}

const WEEKDAYS_MINI = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function MobileYearView({
  year,
  settings,
  astreintes,
  isAstreinteDay,
  hasConflict,
  isHoliday,
  isVacationDay,
  isArretDay,
  getEventsForDate,
  isDateCancelled,
  onMonthClick,
}: MobileYearViewProps) {
  const months = useMemo(() => {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(yearStart);
    return eachMonthOfInterval({ start: yearStart, end: yearEnd });
  }, [year]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {months.map((month, monthIndex) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const calendarStart = startOfWeek(monthStart, { locale: fr, weekStartsOn: 1 });
        const calendarEnd = endOfWeek(monthEnd, { locale: fr, weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

        return (
          <button
            key={monthIndex}
            onClick={() => onMonthClick?.(month)}
            className="bg-card rounded-xl border border-border p-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98] touch-manipulation"
          >
            {/* Month Header */}
            <div className="text-xs font-bold text-foreground mb-1 capitalize text-center">
              {format(month, 'MMMM', { locale: fr })}
            </div>

            {/* Mini Weekday Headers */}
            <div className="grid grid-cols-7 mb-0.5">
              {WEEKDAYS_MINI.map((day, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "text-[7px] font-medium text-muted-foreground text-center",
                    index >= 5 && "text-primary/60"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-px">
              {days.map((day, dayIndex) => {
                const isCurrentMonth = isSameMonth(day, month);
                const isTodayDate = isToday(day);
                const isWeekendDay = isWeekend(day);
                const astreinte = isAstreinteDay(day, astreintes);
                const holiday = isHoliday(day);
                const vacation = isVacationDay(day);
                const arret = isArretDay(day);
                const events = getEventsForDate(day);
                const cancelled = isDateCancelled(day);
                const conflict = hasConflict(day, astreintes);

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "aspect-square flex items-center justify-center text-[8px] relative rounded-sm",
                      !isCurrentMonth && "opacity-20",
                      isWeekendDay && isCurrentMonth && "bg-muted/30",
                      isTodayDate && "ring-1 ring-primary bg-primary/10 font-bold",
                      astreinte && !astreinte.isCancelled && !cancelled && isCurrentMonth && "text-white",
                    )}
                    style={{
                      backgroundColor: 
                        astreinte && !astreinte.isCancelled && !cancelled && isCurrentMonth
                          ? astreinte.isPonctuelle 
                            ? settings.astreintePonctuelleColor 
                            : settings.astreinteColor
                          : undefined,
                    }}
                  >
                    <span className={cn(
                      holiday && isCurrentMonth && "text-destructive font-bold"
                    )}>
                      {format(day, 'd')}
                    </span>

                    {/* Indicators */}
                    {isCurrentMonth && (vacation || arret || events.length > 0) && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-px">
                        {vacation && (
                          <div 
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: settings.vacationColor }}
                          />
                        )}
                        {arret && (
                          <div 
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: arret.color }}
                          />
                        )}
                        {events.length > 0 && (
                          <div 
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: events[0].color }}
                          />
                        )}
                      </div>
                    )}

                    {/* Conflict indicator */}
                    {conflict && isCurrentMonth && (
                      <div className="absolute top-0 right-0 w-1 h-1 bg-destructive rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}
