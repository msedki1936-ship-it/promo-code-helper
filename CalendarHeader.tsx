import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  viewMode?: 'year' | 'month';
  onViewModeChange?: (mode: 'year' | 'month') => void;
}

export function CalendarHeader({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth, 
  onToday,
  viewMode = 'year',
  onViewModeChange,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 sm:mb-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-foreground capitalize">
            {viewMode === 'year' 
              ? currentDate.getFullYear()
              : format(currentDate, 'MMMM yyyy', { locale: fr })
            }
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
        {/* View mode toggle */}
        {onViewModeChange && (
          <div className="flex items-center rounded-lg border border-border bg-card mr-1 sm:mr-2">
            <Button 
              variant={viewMode === 'year' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => onViewModeChange('year')}
              className="rounded-r-none gap-1 text-xs sm:text-sm px-2 sm:px-3 h-8"
            >
              <LayoutGrid className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Année</span>
            </Button>
            <Button 
              variant={viewMode === 'month' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => onViewModeChange('month')}
              className="rounded-l-none gap-1 text-xs sm:text-sm px-2 sm:px-3 h-8"
            >
              <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Mois</span>
            </Button>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToday}
          className="text-xs sm:text-sm font-medium px-2 sm:px-3 h-8"
        >
          <span className="hidden sm:inline">Aujourd'hui</span>
          <span className="sm:hidden">Auj.</span>
        </Button>
        <div className="flex items-center rounded-lg border border-border bg-card">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onPrevMonth}
            className="rounded-r-none h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onNextMonth}
            className="rounded-l-none h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}