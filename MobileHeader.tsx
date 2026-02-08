import { ChevronLeft, ChevronRight, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MobileHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onAddEvent: () => void;
  onOpenSettings: () => void;
}

export function MobileHeader({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth, 
  onToday,
  onAddEvent,
  onOpenSettings,
}: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border pb-3">
      {/* Title Row */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-foreground capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onOpenSettings}
            className="h-9 w-9"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Navigation Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Month Navigation */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onPrevMonth}
            className="h-9 w-9 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToday}
            className="h-9 px-3 rounded-lg text-sm font-medium"
          >
            Aujourd'hui
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onNextMonth}
            className="h-9 w-9 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Add Event Button */}
        <Button 
          onClick={onAddEvent}
          className="h-9 gap-2 rounded-xl shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Ajouter</span>
        </Button>
      </div>
    </div>
  );
}
