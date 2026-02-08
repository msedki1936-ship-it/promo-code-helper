import { useMemo } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  getWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { DayCell } from './DayCell';
import { WeekHeader } from './WeekHeader';
import { CalendarSettings, Astreinte, Holiday, Vacation, CalendarEvent, CancelledAstreinteDate, Arret } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  currentDate: Date;
  settings: CalendarSettings;
  astreintes: Astreinte[];
  arrets: Arret[];
  isAstreinteDay: (date: Date, astreintes: Astreinte[]) => Astreinte | null;
  hasConflict: (date: Date, astreintes: Astreinte[]) => boolean;
  getConflictDetails: (date: Date, astreintes: Astreinte[]) => string[];
  isHoliday: (date: Date) => Holiday | null;
  isVacationDay: (date: Date) => Vacation | null;
  isArretDay: (date: Date) => Arret | null;
  getEventsForDate: (date: Date) => CalendarEvent[];
  isDateCancelled: (date: Date) => CancelledAstreinteDate | null;
  onDayClick?: (date: Date) => void;
}

export function CalendarGrid({
  currentDate,
  settings,
  astreintes,
  arrets,
  isAstreinteDay,
  hasConflict,
  getConflictDetails,
  isHoliday,
  isVacationDay,
  isArretDay,
  getEventsForDate,
  isDateCancelled,
  onDayClick,
}: CalendarGridProps) {
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

  return (
    <div className="bg-card rounded-xl border border-border shadow-card-elevated overflow-hidden">
      <WeekHeader settings={settings} />
      
      <div className="divide-y divide-calendar-grid">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex">
            {/* Week number */}
            <div 
              className="w-10 flex items-center justify-center text-xs font-medium border-r border-calendar-grid"
              style={{ backgroundColor: settings.weekNumbersColor, color: '#fff' }}
            >
              S{getWeek(week[0], { locale: fr, weekStartsOn: 1 })}
            </div>
            
            {/* Days */}
            <div className="flex-1 grid grid-cols-7">
              {week.map((day, dayIndex) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                if (!isCurrentMonth) {
                  return (
                    <div 
                      key={dayIndex} 
                      className="min-h-[100px] bg-muted/30 border-r border-calendar-grid last:border-r-0"
                      style={{ backgroundColor: settings.emptyCellsColor }}
                    />
                  );
                }

                return (
                  <DayCell
                    key={dayIndex}
                    date={day}
                    events={getEventsForDate(day)}
                    astreinte={isAstreinteDay(day, astreintes)}
                    holiday={isHoliday(day)}
                    vacation={isVacationDay(day)}
                    arret={isArretDay(day)}
                    hasConflict={hasConflict(day, astreintes)}
                    cancelledInfo={isDateCancelled(day)}
                    conflictDetails={getConflictDetails(day, astreintes)}
                    settings={settings}
                    onClick={() => onDayClick?.(day)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
