import { useMemo } from 'react';
import { Vacation, CalendarSettings } from '@/types/calendar';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  differenceInDays,
  format,
} from 'date-fns';

interface VacationBarProps {
  vacations: Vacation[];
  currentDate: Date;
  settings: CalendarSettings;
}

export function VacationBar({ vacations, currentDate, settings }: VacationBarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const vacationBars = useMemo(() => {
    return vacations
      .filter(vac => vac.startDate <= monthEnd && vac.endDate >= monthStart)
      .map(vac => {
        const displayStart = vac.startDate < monthStart ? monthStart : vac.startDate;
        const displayEnd = vac.endDate > monthEnd ? monthEnd : vac.endDate;
        
        const startDayIndex = differenceInDays(displayStart, monthStart);
        const endDayIndex = differenceInDays(displayEnd, monthStart);
        const width = endDayIndex - startDayIndex + 1;
        
        return {
          ...vac,
          startIndex: startDayIndex,
          width,
        };
      });
  }, [vacations, monthStart, monthEnd]);

  if (vacationBars.length === 0) return null;

  return (
    <div className="mb-4 bg-card rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-2 bg-vacation/10 border-b border-border flex items-center gap-2">
        <span className="text-lg">🏖️</span>
        <h3 className="text-sm font-semibold text-foreground">Vacances Scolaires</h3>
      </div>
      
      <div className="p-4">
        <div className="relative">
          {/* Grid background */}
          <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, 1fr)` }}>
            {daysInMonth.map((day, index) => (
              <div 
                key={index} 
                className="h-4 bg-muted/30 text-[8px] text-muted-foreground text-center"
              >
                {format(day, 'd')}
              </div>
            ))}
          </div>

          {/* Vacation bars */}
          <div className="mt-2 space-y-1">
            {vacationBars.map(vac => (
              <div
                key={vac.id}
                className="relative h-7"
              >
                <div
                  className="absolute h-full rounded-full flex items-center justify-center px-3 text-xs font-medium text-white shadow-sm overflow-hidden"
                  style={{
                    left: `${(vac.startIndex / daysInMonth.length) * 100}%`,
                    width: `${(vac.width / daysInMonth.length) * 100}%`,
                    backgroundColor: settings.vacationColor,
                  }}
                  title={vac.name}
                >
                  <span className="truncate text-[11px]">{vac.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
