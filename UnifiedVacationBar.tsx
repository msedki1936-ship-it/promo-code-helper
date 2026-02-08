import { useMemo } from 'react';
import { Vacation, CalendarSettings } from '@/types/calendar';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  differenceInDays,
  format,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { CollapsibleSection } from './CollapsibleSection';

interface UnifiedVacationBarProps {
  vacations: Vacation[];
  currentDate: Date;
  settings: CalendarSettings;
  viewMode: 'year' | 'month';
  defaultExpanded?: boolean;
}

export function UnifiedVacationBar({ 
  vacations, 
  currentDate, 
  settings, 
  viewMode,
  defaultExpanded = true 
}: UnifiedVacationBarProps) {
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

  // Create vacation segments for display on a SINGLE line
  const vacationSegments = useMemo(() => {
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
          leftPercent: (startDayIndex / totalDays) * 100,
          widthPercent: (width / totalDays) * 100,
        };
      })
      .sort((a, b) => a.startIndex - b.startIndex);
  }, [vacations, periodStart, periodEnd, totalDays]);

  if (vacationSegments.length === 0) return null;

  return (
    <CollapsibleSection 
      title="Vacances Scolaires" 
      icon="🏖️"
      defaultExpanded={defaultExpanded}
      className="mb-3"
    >
      <div className="p-3 sm:p-4">
        <div className="relative">
          {/* Month markers for year view */}
          {viewMode === 'year' && (
            <div className="flex mb-1">
              {eachMonthOfInterval({ start: periodStart, end: periodEnd }).map((month, index) => (
                <div 
                  key={index} 
                  className="flex-1 text-[8px] sm:text-[10px] text-muted-foreground text-center border-r border-border/30 last:border-r-0"
                >
                  {format(month, 'MMM', { locale: fr })}
                </div>
              ))}
            </div>
          )}

          {/* Single line with all vacation segments */}
          <div className="relative h-7 sm:h-8 bg-muted/20 rounded-full overflow-hidden">
            {vacationSegments.map(vac => (
              <div
                key={vac.id}
                className="absolute h-full flex items-center justify-center px-1 sm:px-2 text-[9px] sm:text-[11px] font-medium text-white shadow-sm overflow-hidden rounded-full transition-transform hover:scale-[1.02] hover:z-10"
                style={{
                  left: `${vac.leftPercent}%`,
                  width: `${vac.widthPercent}%`,
                  backgroundColor: settings.vacationColor,
                  minWidth: '16px',
                }}
                title={`${vac.name} (${format(vac.startDate, 'dd/MM')} - ${format(vac.endDate, 'dd/MM')})`}
              >
                <span className="truncate">{vac.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
