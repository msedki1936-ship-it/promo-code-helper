import { ChevronLeft, ChevronRight, Plus, Settings, LayoutGrid, Calendar as CalendarIcon, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MobileToolbarProps {
  currentDate: Date;
  currentYear: number;
  viewMode: 'year' | 'month';
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onAddEvent: () => void;
  onOpenSettings: () => void;
  onViewModeChange: (mode: 'year' | 'month') => void;
  onYearChange: (year: number) => void;
}

const years = Array.from({ length: 10 }, (_, i) => 2025 + i);

export function MobileToolbar({ 
  currentDate,
  currentYear,
  viewMode,
  onPrevMonth, 
  onNextMonth, 
  onToday,
  onAddEvent,
  onOpenSettings,
  onViewModeChange,
  onYearChange,
}: MobileToolbarProps) {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border pb-3 space-y-3">
      {/* Title Row with Year Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-lg font-bold text-foreground capitalize">
            {viewMode === 'year' 
              ? currentYear
              : format(currentDate, 'MMMM yyyy', { locale: fr })
            }
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onOpenSettings}
            className="h-8 w-8"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
          <Button 
            variant={viewMode === 'year' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => onViewModeChange('year')}
            className="h-7 px-2 text-xs rounded-md gap-1"
          >
            <LayoutGrid className="w-3 h-3" />
            Année
          </Button>
          <Button 
            variant={viewMode === 'month' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => onViewModeChange('month')}
            className="h-7 px-2 text-xs rounded-md gap-1"
          >
            <CalendarIcon className="w-3 h-3" />
            Mois
          </Button>
        </div>

        {/* Year Selector */}
        <Select 
          value={currentYear.toString()} 
          onValueChange={(v) => onYearChange(parseInt(v))}
        >
          <SelectTrigger className="w-20 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Month/Year Navigation */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onPrevMonth}
            className="h-8 w-8 rounded-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToday}
            className="h-8 px-2 rounded-md text-xs font-medium"
          >
            Auj.
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onNextMonth}
            className="h-8 w-8 rounded-md"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Add Event Button */}
        <Button 
          onClick={onAddEvent}
          size="sm"
          className="h-8 gap-1 rounded-lg shadow-sm text-xs"
        >
          <Plus className="w-3 h-3" />
          Ajouter
        </Button>
      </div>
    </div>
  );
}
