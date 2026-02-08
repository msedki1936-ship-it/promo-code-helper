import { useMemo } from 'react';
import { Arret, CalendarSettings, PatternType } from '@/types/calendar';
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
import { cn } from '@/lib/utils';
import { getArretColor, getArretPattern, getModuleLabel } from '@/lib/trancheColors';
import { CollapsibleSection } from './CollapsibleSection';

interface UnifiedArretBarProps {
  arrets: Arret[];
  currentDate: Date;
  settings: CalendarSettings;
  viewMode: 'year' | 'month';
  defaultExpanded?: boolean;
}

// Pattern class mappings
const patternClasses: Record<PatternType, string> = {
  none: '',
  stripes: 'pattern-stripes-light',
  dots: 'pattern-dots',
  crosshatch: 'pattern-crosshatch',
  waves: 'pattern-waves',
  diagonal: 'pattern-diagonal',
  grid: 'pattern-grid',
  zigzag: 'pattern-zigzag',
};

// Tranche order for consistent display
const TRANCHE_ORDER = ['Tr2', 'Tr3', 'Tr4', 'Tr5'] as const;

export function UnifiedArretBar({ 
  arrets, 
  currentDate, 
  settings, 
  viewMode,
  defaultExpanded = true 
}: UnifiedArretBarProps) {
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

  // Group arrets by tranche - each tranche gets ONE line with all its AT + prépas
  const arretsByTranche = useMemo(() => {
    const visibleArrets = arrets.filter(
      arret => arret.startDate <= periodEnd && arret.endDate >= periodStart
    );

    const grouped: Record<string, Array<Arret & { startIndex: number; width: number; leftPercent: number; widthPercent: number }>> = {};

    for (const tranche of TRANCHE_ORDER) {
      const trancheArrets = visibleArrets
        .filter(a => a.tranche === tranche)
        .map(arret => {
          const displayStart = arret.startDate < periodStart ? periodStart : arret.startDate;
          const displayEnd = arret.endDate > periodEnd ? periodEnd : arret.endDate;
          
          const startDayIndex = differenceInDays(displayStart, periodStart);
          const width = differenceInDays(displayEnd, displayStart) + 1;
          
          return {
            ...arret,
            startIndex: startDayIndex,
            width,
            leftPercent: (startDayIndex / totalDays) * 100,
            widthPercent: (width / totalDays) * 100,
          };
        })
        .sort((a, b) => a.startIndex - b.startIndex);

      if (trancheArrets.length > 0) {
        grouped[tranche] = trancheArrets;
      }
    }

    return grouped;
  }, [arrets, periodStart, periodEnd, totalDays]);

  const hasTranches = Object.keys(arretsByTranche).length > 0;
  if (!hasTranches) return null;

  return (
    <CollapsibleSection 
      title="Arrêts de Tranches" 
      icon="🔧"
      defaultExpanded={defaultExpanded}
      className="mb-3"
    >
      <div className="p-3 sm:p-4">
        <div className="relative">
          {/* Month markers for year view */}
          {viewMode === 'year' && (
            <div className="flex mb-2">
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

          {/* One line per tranche with all AT + preparations */}
          <div className="space-y-2">
            {TRANCHE_ORDER.map(tranche => {
              const trancheArrets = arretsByTranche[tranche];
              if (!trancheArrets) return null;

              const trancheColor = getArretColor({ tranche, type: 'arret' } as Arret, settings);

              return (
                <div key={tranche} className="flex items-center gap-2">
                  {/* Tranche label */}
                  <div 
                    className="w-10 sm:w-12 flex-shrink-0 text-[10px] sm:text-xs font-semibold text-white rounded px-1 py-0.5 text-center"
                    style={{ backgroundColor: trancheColor }}
                  >
                    {tranche}
                  </div>

                  {/* Timeline for this tranche - single line with all segments */}
                  <div className="flex-1 relative h-6 sm:h-7 bg-muted/20 rounded overflow-visible">
                    {trancheArrets.map(arret => {
                      const pattern = getArretPattern(arret);
                      const isPrepa = arret.type === 'prepa';
                      const moduleLabel = arret.module ? getModuleLabel(arret.module) : '';
                      
                      return (
                        <div
                          key={arret.id}
                          className={cn(
                            "absolute h-full flex items-center justify-center px-1 sm:px-2 text-[8px] sm:text-[10px] font-medium text-white shadow-sm overflow-hidden transition-all hover:scale-[1.02] hover:z-10",
                            isPrepa ? 'rounded border border-white/40' : 'rounded-full',
                            patternClasses[pattern]
                          )}
                          style={{
                            left: `${arret.leftPercent}%`,
                            width: `${arret.widthPercent}%`,
                            backgroundColor: getArretColor(arret, settings),
                            minWidth: '20px',
                          }}
                          title={`${arret.name}${moduleLabel ? ` - ${moduleLabel}` : ''} (${format(arret.startDate, 'dd/MM')} - ${format(arret.endDate, 'dd/MM')})`}
                        >
                          <span className="truncate flex items-center gap-0.5">
                            {isPrepa && arret.module && (
                              <span className="bg-white/25 rounded px-0.5 text-[7px] sm:text-[8px] font-bold">
                                {arret.module}
                              </span>
                            )}
                            <span className="hidden sm:inline">{arret.name}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact legend */}
          <div className="mt-3 pt-2 border-t border-border/30 flex flex-wrap gap-3 text-[9px] sm:text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 rounded-full bg-muted-foreground/60" />
              <span>AT (arrêt)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 rounded bg-muted-foreground/60 pattern-dots border border-white/30" />
              <span>Prépa (M0-M4)</span>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
