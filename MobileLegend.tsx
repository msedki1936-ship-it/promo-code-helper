import { CalendarSettings } from '@/types/calendar';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MobileLegendProps {
  settings: CalendarSettings;
  expanded?: boolean;
}

export function MobileLegend({ settings, expanded: initialExpanded = false }: MobileLegendProps) {
  const [expanded, setExpanded] = useState(initialExpanded);

  const items = [
    { label: 'Astreinte', color: settings.astreinteColor },
    { label: 'Astr. ponctuelle', color: settings.astreintePonctuelleColor },
    { label: 'Astr. annulée', color: settings.astreinteCancelledColor, pattern: true },
    { label: 'Événement', color: settings.eventColor },
    { label: 'Vacances', color: settings.vacationColor },
    { label: 'Jour férié', color: '#ef4444', pattern: true },
    { label: 'Arrêt Tr2', color: settings.arretTr2Color },
    { label: 'Arrêt Tr3', color: settings.arretTr3Color },
    { label: 'Arrêt Tr4', color: settings.arretTr4Color },
    { label: 'Arrêt Tr5', color: settings.arretTr5Color },
    { label: 'Prépa', color: settings.prepaTr2Color, pattern: true },
  ];

  const visibleItems = expanded ? items : items.slice(0, 6);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between bg-muted/30 border-b border-border"
      >
        <h3 className="text-xs font-semibold text-foreground">Légende</h3>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      
      <div className="p-2">
        <div className={cn(
          "grid gap-1.5",
          expanded ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3"
        )}>
          {visibleItems.map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div 
                className={cn(
                  "w-3 h-3 rounded-sm flex-shrink-0",
                  item.pattern && "pattern-stripes"
                )}
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-muted-foreground truncate">{item.label}</span>
            </div>
          ))}
        </div>
        
        {!expanded && items.length > 6 && (
          <button 
            onClick={() => setExpanded(true)}
            className="w-full mt-2 text-[10px] text-primary font-medium"
          >
            +{items.length - 6} autres...
          </button>
        )}
      </div>
    </div>
  );
}