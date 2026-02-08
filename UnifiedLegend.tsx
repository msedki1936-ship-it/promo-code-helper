import { useMemo } from 'react';
import { CalendarSettings, modulePatterns, PatternType, Arret, Vacation, CalendarEvent, Holiday, Astreinte, CancelledAstreinteDate } from '@/types/calendar';
import { CollapsibleSection } from './CollapsibleSection';
import { cn } from '@/lib/utils';

interface UnifiedLegendProps {
  settings: CalendarSettings;
  defaultExpanded?: boolean;
  viewMode?: 'year' | 'month';
  arrets?: Arret[];
  vacations?: Vacation[];
  events?: CalendarEvent[];
  holidays?: Holiday[];
  astreintes?: Astreinte[];
  ponctualAstreintes?: Astreinte[];
  cancelledAstreinteDates?: CancelledAstreinteDate[];
}

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

export function UnifiedLegend({ 
  settings, 
  defaultExpanded = true,
  arrets = [],
  vacations = [],
  events = [],
  holidays = [],
  astreintes = [],
  ponctualAstreintes = [],
  cancelledAstreinteDates = [],
}: UnifiedLegendProps) {
  // Build legend dynamically based on what's present
  const { mainItems, trancheItems, moduleItems } = useMemo(() => {
    const main: Array<{ label: string; color: string; pattern: PatternType }> = [];
    
    // Check what types are present
    const hasRegularAstreinte = astreintes.some(a => !a.isPonctuelle && !a.isCancelled);
    const hasPonctuelle = ponctualAstreintes.length > 0;
    const hasCancelled = cancelledAstreinteDates.length > 0;
    const hasEvents = events.some(e => e.type === 'event');
    const hasRE = events.some(e => e.type === 're');
    const hasCP = events.some(e => e.type === 'cp');
    const hasVacations = vacations.length > 0;
    const hasHolidays = holidays.length > 0;

    if (hasRegularAstreinte) main.push({ label: 'Astreinte', color: settings.astreinteColor, pattern: 'none' });
    if (hasPonctuelle) main.push({ label: 'Astr. ponctuelle', color: settings.astreintePonctuelleColor, pattern: 'none' });
    if (hasCancelled) main.push({ label: 'Astr. annulée', color: settings.astreinteCancelledColor, pattern: 'crosshatch' });
    if (hasEvents) main.push({ label: 'Événement', color: settings.eventColor, pattern: 'none' });
    if (hasRE) main.push({ label: 'RE (Repos)', color: settings.reColor, pattern: 'none' });
    if (hasCP) main.push({ label: 'CP (Congés)', color: settings.cpColor, pattern: 'none' });
    if (hasVacations) main.push({ label: 'Vacances', color: settings.vacationColor, pattern: 'none' });
    if (hasHolidays) main.push({ label: 'Jour férié', color: '#ef4444', pattern: 'stripes' });

    // Tranche colors - only show tranches that have arrets
    const presentTranches = new Set(arrets.map(a => a.tranche));
    const tranches: Array<{ label: string; color: string }> = [];
    if (presentTranches.has('Tr2')) tranches.push({ label: 'AT Tr2', color: settings.arretTr2Color });
    if (presentTranches.has('Tr3')) tranches.push({ label: 'AT Tr3', color: settings.arretTr3Color });
    if (presentTranches.has('Tr4')) tranches.push({ label: 'AT Tr4', color: settings.arretTr4Color });
    if (presentTranches.has('Tr5')) tranches.push({ label: 'AT Tr5', color: settings.arretTr5Color });

    // Module patterns - only show modules that have prepas
    const presentModules = new Set(arrets.filter(a => a.type === 'prepa' && a.module).map(a => a.module!));
    const modules: Array<{ label: string; pattern: PatternType }> = [];
    if (presentModules.has('M0')) modules.push({ label: 'M0', pattern: modulePatterns.M0 });
    if (presentModules.has('M1')) modules.push({ label: 'M1', pattern: modulePatterns.M1 });
    if (presentModules.has('M2A')) modules.push({ label: 'M2A', pattern: modulePatterns.M2A });
    if (presentModules.has('M2B')) modules.push({ label: 'M2B', pattern: modulePatterns.M2B });
    if (presentModules.has('M3')) modules.push({ label: 'M3', pattern: modulePatterns.M3 });
    if (presentModules.has('M4')) modules.push({ label: 'M4', pattern: modulePatterns.M4 });

    return { mainItems: main, trancheItems: tranches, moduleItems: modules };
  }, [settings, arrets, vacations, events, holidays, astreintes, ponctualAstreintes, cancelledAstreinteDates]);

  // Don't render if nothing to show
  if (mainItems.length === 0 && trancheItems.length === 0 && moduleItems.length === 0) return null;

  return (
    <CollapsibleSection 
      title="Légende" 
      icon="📋"
      defaultExpanded={defaultExpanded}
    >
      <div className="p-3 sm:p-4 space-y-3">
        {/* Main event types */}
        {mainItems.length > 0 && (
          <div>
            <h4 className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2">Événements</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {mainItems.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div 
                    className={cn(
                      "w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0",
                      item.pattern !== 'none' && patternClasses[item.pattern]
                    )}
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tranche colors */}
        {trancheItems.length > 0 && (
          <div>
            <h4 className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2">Arrêts de Tranches</h4>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {trancheItems.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module patterns */}
        {moduleItems.length > 0 && (
          <div>
            <h4 className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2">Modules de préparation</h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              {moduleItems.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div 
                    className={cn(
                      "w-3 h-3 sm:w-4 sm:h-4 rounded-md flex-shrink-0 bg-muted-foreground/60",
                      patternClasses[item.pattern]
                    )}
                  />
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
