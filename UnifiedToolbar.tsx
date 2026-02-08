import { ChevronLeft, ChevronRight, Plus, Settings, LayoutGrid, Calendar as CalendarIcon, Download, Upload, List, AlertTriangle, MoreVertical, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, getWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UnifiedToolbarProps {
  currentDate: Date;
  currentYear: number;
  viewMode: 'year' | 'month';
  activeTab: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onAddEvent: () => void;
  onOpenSettings: () => void;
  onViewModeChange: (mode: 'year' | 'month') => void;
  onYearChange: (year: number) => void;
  onTabChange: (tab: string) => void;
  onExportPDF?: () => void;
  onImport?: () => void;
}

const years = Array.from({ length: 10 }, (_, i) => 2025 + i);

export function UnifiedToolbar({ 
  currentDate,
  currentYear,
  viewMode,
  activeTab,
  onPrevMonth, 
  onNextMonth, 
  onToday,
  onAddEvent,
  onOpenSettings,
  onViewModeChange,
  onYearChange,
  onTabChange,
  onExportPDF,
  onImport,
}: UnifiedToolbarProps) {
  const weekNumber = getWeek(currentDate, { locale: fr, weekStartsOn: 1 });

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border pb-3 space-y-3">
      {/* Title Row with Year Selector */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-foreground capitalize truncate">
              {viewMode === 'year' 
                ? currentYear
                : format(currentDate, 'MMMM yyyy', { locale: fr })
              }
            </h1>
            {viewMode === 'month' && (
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Semaine {weekNumber}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Select 
            value={currentYear.toString()} 
            onValueChange={(v) => onYearChange(parseInt(v))}
          >
            <SelectTrigger className="w-16 sm:w-20 h-8 text-xs">
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
          
          {/* Desktop: Show all buttons */}
          <div className="hidden sm:flex items-center gap-1">
            {onExportPDF && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onExportPDF}
                className="h-8 w-8"
                title="Exporter PDF"
              >
                <FileText className="w-4 h-4" />
              </Button>
            )}
            {onImport && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onImport}
                className="h-8 w-8"
                title="Importer Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onOpenSettings}
              className="h-8 w-8"
              title="Paramètres"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile: Show menu button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="sm:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
              <DropdownMenuItem onClick={() => onTabChange('events')}>
                <List className="w-4 h-4 mr-2" />
                Gestion
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTabChange('conflicts')}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Conflits
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Exporter PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onImport}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Importer Excel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenSettings}>
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Tabs for Calendar/Events/Conflicts - Desktop only */}
      <div className="hidden sm:block overflow-x-auto -mx-3 px-3">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="h-9 w-full grid grid-cols-3 sm:w-auto sm:inline-flex">
            <TabsTrigger value="calendar" className="gap-1 text-xs px-2 sm:px-3 h-7">
              <CalendarIcon className="h-3 w-3" />
              Calendrier
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1 text-xs px-2 sm:px-3 h-7">
              <List className="h-3 w-3" />
              Gestion
            </TabsTrigger>
            <TabsTrigger value="conflicts" className="gap-1 text-xs px-2 sm:px-3 h-7">
              <AlertTriangle className="h-3 w-3" />
              Conflits
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Mobile: Simple tab indicator */}
      <div className="sm:hidden flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onTabChange('calendar')}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              activeTab === 'calendar' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <CalendarIcon className="h-3 w-3 inline mr-1" />
            Calendrier
          </button>
        </div>
      </div>

      {/* View Mode Toggle + Navigation (only show when on calendar tab) */}
      {activeTab === 'calendar' && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
            <Button 
              variant={viewMode === 'year' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => onViewModeChange('year')}
              className="h-7 px-2 text-xs rounded-md gap-1"
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden sm:inline">Année</span>
              <span className="sm:hidden" translate="no">Année</span>
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
              <span className="hidden sm:inline">Aujourd'hui</span>
              <span className="sm:hidden">Auj.</span>
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

          {/* Add Event Button - Primary action always visible */}
          <Button 
            onClick={onAddEvent}
            size="sm"
            className="h-8 gap-1 rounded-lg shadow-sm text-xs"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden xs:inline">Ajouter</span>
          </Button>
        </div>
      )}
    </div>
  );
}