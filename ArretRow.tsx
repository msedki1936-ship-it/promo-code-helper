import { useMemo } from 'react';
import { Arret, CalendarSettings } from '@/types/calendar';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isWithinInterval,
  differenceInDays,
  format,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { getArretColor } from '@/lib/trancheColors';

interface ArretRowProps {
  arrets: Arret[];
  currentDate: Date;
  settings: CalendarSettings;
}

export function ArretRow({ arrets, currentDate, settings }: ArretRowProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate position and width for each arret
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
    <div className="mt-4 bg-card rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-2 bg-muted border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Arrêts de Tranches</h3>
      </div>
      
      <div className="p-4">
        <div className="relative">
          {/* Grid background */}
          <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, 1fr)` }}>
            {daysInMonth.map((day, index) => (
              <div 
                key={index} 
                className="h-4 bg-muted/50 text-[8px] text-muted-foreground text-center"
              >
                {format(day, 'd')}
              </div>
            ))}
          </div>

          {/* Arret bars */}
          <div className="mt-2 space-y-2">
            {arretBars.map(arret => (
              <div
                key={arret.id}
                className="relative h-8"
              >
                <div
                  className={cn(
                    'absolute h-full rounded-md flex items-center px-2 text-xs font-medium text-white shadow-sm transition-transform hover:scale-[1.02]',
                    arret.type === 'prepa' && 'pattern-dots'
                  )}
                  style={{
                    left: `${(arret.startIndex / daysInMonth.length) * 100}%`,
                    width: `${(arret.width / daysInMonth.length) * 100}%`,
                    backgroundColor: arret.color || getArretColor(arret, settings),
                  }}
                  title={`${arret.name} (${arret.tranche})`}
                >
                  <span className="truncate">
                    {arret.type === 'prepa' ? '⚙️ ' : '🔧 '}{arret.name}
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
