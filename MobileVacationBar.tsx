import { useMemo } from 'react';
import { Vacation, CalendarSettings } from '@/types/calendar';
import { 
  startOfMonth, 
  endOfMonth, 
  differenceInDays,
  format,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
} from 'date-fns';
import { fr } from 'date-fns/locale';

interface MobileVacationBarProps {
  vacations: Vacation[];
  currentDate: Date;
  settings: CalendarSettings;
  viewMode: 'year' | 'month';
}

export function MobileVacationBar({ vacations, currentDate, settings, viewMode }: MobileVacationBarProps) {
  const { periodStart, periodEnd, totalDays } = useMemo(() => {
    if (viewMode === 'year') {
      const start = startOfYear(currentDate);
      const end = endOfYear(currentDate);
      return { periodStart: start, periodEnd: end, totalDays: differenceInDays(end, start) + 1 };
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return { periodStart: start, periodEnd: end, totalDays: differenceInDays(end, start) + 1 };
    }
  }, [currentDate, viewMode]);

  const vacationBars = useMemo(() => {
    return vacations
      .filter(vac => vac.startDate <= periodEnd && vac.endDate >= periodStart)
      .map(vac => {
        const displayStart = vac.startDate < periodStart ? periodStart : vac.startDate;
        const displayEnd = vac.endDate > periodEnd ? periodEnd : vac.endDate;
        
        const startDayIndex = differenceInDays(displayStart, periodStart);
        const width = differenceInDays(displayEnd, displayStart) + 1;
        
        return {
          ...vac,
          startIndex: startDayIndex,
          width,
        };
      });
  }, [vacations, periodStart, periodEnd]);

  if (vacationBars.length === 0) return null;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="px-3 py-1.5 bg-vacation/10 border-b border-border flex items-center gap-2">
        <span className="text-sm">🏖️</span>
        <h3 className="text-xs font-semibold text-foreground">Vacances</h3>
      </div>
      
      <div className="p-2">
        <div className="relative">
          {/* Month markers for year view */}
          {viewMode === 'year' && (
            <div className="flex mb-1">
              {eachMonthOfInterval({ start: periodStart, end: periodEnd }).map((month, index) => (
                <div 
                  key={index} 
                  className="flex-1 text-[8px] text-muted-foreground text-center border-r border-border/30 last:border-r-0"
                >
                  {format(month, 'MMM', { locale: fr })}
                </div>
              ))}
            </div>
          )}

          {/* Vacation bars */}
          <div className="space-y-1">
            {vacationBars.map(vac => (
              <div
                key={vac.id}
                className="relative h-5"
              >
                <div
                  className="absolute h-full rounded-full flex items-center justify-center px-2 text-[10px] font-medium text-white shadow-sm overflow-hidden"
                  style={{
                    left: `${(vac.startIndex / totalDays) * 100}%`,
                    width: `${(vac.width / totalDays) * 100}%`,
                    backgroundColor: settings.vacationColor,
                    minWidth: '20px',
                  }}
                  title={vac.name}
                >
                  <span className="truncate">{vac.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
