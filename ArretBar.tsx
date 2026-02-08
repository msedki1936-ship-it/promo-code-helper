import { useMemo } from 'react';
import { Arret, CalendarSettings } from '@/types/calendar';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  differenceInDays,
  format,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { getArretColor } from '@/lib/trancheColors';
interface ArretBarProps {
  arrets: Arret[];
  currentDate: Date;
  settings: CalendarSettings;
}

export function ArretBar({ arrets, currentDate, settings }: ArretBarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const arretBars = useMemo(() => {
    return arrets
      .filter(arret => arret.startDate <= monthEnd && arret.endDate >= monthStart)
      .map(arret => {
        const displayStart = arret.startDate < monthStart ? monthStart : arret.startDate;
        const displayEnd = arret.endDate > monthEnd ? monthEnd : arret.endDate;
        
        const startDayIndex = differenceInDays(displayStart, monthStart);
        const endDayIndex = differenceInDays(displayEnd, monthStart);
        const width = endDayIndex - startDayIndex + 1;
        
        return {
          ...arret,
          startIndex: startDayIndex,
          width,
        };
      });
  }, [arrets, monthStart, monthEnd]);

  if (arretBars.length === 0) return null;

  return (
    <div className="mb-4 bg-card rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-2 bg-arret/10 border-b border-border flex items-center gap-2">
        <span className="text-lg">🔧</span>
        <h3 className="text-sm font-semibold text-foreground">Arrêts de Tranches</h3>
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

          {/* Arret bars */}
          <div className="mt-2 space-y-1">
            {arretBars.map(arret => (
              <div
                key={arret.id}
                className="relative h-7"
              >
                <div
                  className={cn(
                    "absolute h-full rounded-full flex items-center justify-center px-3 text-xs font-medium text-white shadow-sm overflow-hidden",
                    arret.type === 'prepa' && 'pattern-dots'
                  )}
                  style={{
                    left: `${(arret.startIndex / daysInMonth.length) * 100}%`,
                    width: `${(arret.width / daysInMonth.length) * 100}%`,
                    backgroundColor: arret.color || getArretColor(arret, settings),
                  }}
                  title={`${arret.name} (${arret.tranche})`}
                >
                  <span className="truncate text-[11px]">
                    {arret.type === 'prepa' ? '⚙️ ' : ''}{arret.name} ({arret.tranche})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
