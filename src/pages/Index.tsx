import { useState, useCallback } from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, getWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getArretColor, getArretPattern } from '@/lib/trancheColors';
import { cn } from '@/lib/utils';

const Index = () => {
  const {
    currentDate,
    settings,
    events,
    vacations,
    holidays,
    arrets,
    currentAstreintes,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    goToDate,
    isAstreinteDay,
    isDateCancelled,
    hasConflict,
    isHoliday,
    isVacationDay,
    isArretDay,
    isREDay,
    isCPDay,
    getEventsForDate,
    getNonREEventsForDate,
  } = useCalendar();

  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'year' | 'month'>('month');

  // Get calendar days for current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const startDayOfWeek = getDay(monthStart);
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Get pattern class
  const getPatternClass = (pattern: string) => {
    switch (pattern) {
      case 'stripes': return 'pattern-stripes';
      case 'dots': return 'pattern-dots';
      case 'crosshatch': return 'pattern-crosshatch';
      case 'waves': return 'pattern-waves';
      case 'diagonal': return 'pattern-diagonal';
      case 'grid': return 'pattern-grid';
      case 'zigzag': return 'pattern-zigzag';
      default: return '';
    }
  };

  // Render a single day cell
  const renderDayCell = (date: Date) => {
    const dayEvents = getNonREEventsForDate(date);
    const astreinte = isAstreinteDay(date, currentAstreintes);
    const cancelled = isDateCancelled(date);
    const holiday = isHoliday(date);
    const vacation = isVacationDay(date);
    const arret = isArretDay(date);
    const reDay = isREDay(date);
    const cpDay = isCPDay(date);
    const conflict = hasConflict(date, currentAstreintes);
    const isWeekend = getDay(date) === 0 || getDay(date) === 6;
    const isTodayDate = isToday(date);

    // Determine background color based on priority
    let bgColor = '';
    let patternClass = '';
    let label = '';

    if (cancelled) {
      bgColor = settings.astreinteCancelledColor;
      patternClass = getPatternClass(settings.astreinteCancelledPattern);
      label = 'Annulé';
    } else if (astreinte) {
      bgColor = astreinte.isPonctuelle ? settings.astreintePonctuelleColor : settings.astreinteColor;
      label = astreinte.isPonctuelle ? 'Ast. Ponct.' : 'Astreinte';
    } else if (arret) {
      bgColor = getArretColor(arret, settings);
      patternClass = getPatternClass(getArretPattern(arret));
      label = arret.name;
    } else if (dayEvents.length > 0) {
      bgColor = dayEvents[0].color;
      label = dayEvents[0].name;
    } else if (holiday) {
      bgColor = '#ef4444';
      patternClass = getPatternClass(settings.holidayPattern);
      label = holiday.name;
    } else if (vacation) {
      bgColor = vacation.color;
      label = vacation.name;
    } else if (cpDay) {
      bgColor = settings.cpColor;
      label = 'CP';
    } else if (reDay) {
      bgColor = settings.reColor;
      label = 'RE';
    }

    return (
      <div
        key={date.toISOString()}
        className={cn(
          "min-h-[60px] sm:min-h-[80px] p-1 border border-border/50 rounded-sm relative transition-all hover:shadow-md cursor-pointer",
          isWeekend && !bgColor && "bg-muted/50",
          isTodayDate && "ring-2 ring-primary ring-offset-1",
          conflict && "ring-2 ring-destructive",
          patternClass
        )}
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        <div className={cn(
          "text-xs sm:text-sm font-medium",
          bgColor ? "text-white" : isWeekend ? "text-muted-foreground" : "text-foreground"
        )}>
          {format(date, 'd')}
        </div>
        {label && (
          <div className={cn(
            "text-[10px] sm:text-xs truncate mt-0.5",
            bgColor ? "text-white/90" : "text-muted-foreground"
          )}>
            {label}
          </div>
        )}
        {conflict && (
          <div className="absolute -top-1 -right-1 text-destructive text-xs font-bold">⚠</div>
        )}
      </div>
    );
  };

  // Render year view
  const renderYearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1));

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map(monthDate => (
          <div
            key={monthDate.toISOString()}
            className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              goToDate(monthDate);
              setViewMode('month');
            }}
          >
            <h3 className="font-semibold text-sm mb-2 capitalize">
              {format(monthDate, 'MMMM', { locale: fr })}
            </h3>
            <div className="grid grid-cols-7 gap-0.5 text-[8px] sm:text-[10px]">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <div key={i} className="text-center text-muted-foreground font-medium">{d}</div>
              ))}
              {Array.from({ length: (getDay(startOfMonth(monthDate)) + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {eachDayOfInterval({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) }).map(day => {
                const astreinte = isAstreinteDay(day, currentAstreintes);
                const arret = isArretDay(day);
                const holiday = isHoliday(day);

                let dotColor = '';
                if (astreinte) dotColor = settings.astreinteColor;
                else if (arret) dotColor = getArretColor(arret, settings);
                else if (holiday) dotColor = '#ef4444';

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "text-center p-0.5 rounded-sm",
                      isToday(day) && "bg-primary text-primary-foreground font-bold",
                      getDay(day) === 0 || getDay(day) === 6 ? "text-muted-foreground" : ""
                    )}
                    style={dotColor && !isToday(day) ? { backgroundColor: dotColor, color: 'white' } : undefined}
                  >
                    {format(day, 'd')}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 max-w-7xl mx-auto">
        {/* Header / Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold capitalize min-w-[140px] text-center">
              {viewMode === 'year' 
                ? currentDate.getFullYear()
                : format(currentDate, 'MMMM yyyy', { locale: fr })
              }
            </h1>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Aujourd'hui
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Mois
            </Button>
            <Button
              variant={viewMode === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('year')}
            >
              Année
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: settings.astreinteColor }} />
            <span>Astreinte</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Tr5</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3C9453' }} />
            <span>Tr2</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#CC6600' }} />
            <span>Tr3</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#558ED5' }} />
            <span>Tr4</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: settings.vacationColor }} />
            <span>Vacances</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500 pattern-stripes" />
            <span>Férié</span>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'year' ? (
          renderYearView()
        ) : (
          <div className="bg-card border border-border rounded-lg p-2 sm:p-4">
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
                <div
                  key={day}
                  className={cn(
                    "text-center text-xs sm:text-sm font-semibold py-2",
                    i >= 5 ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {isMobile ? day.charAt(0) : day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: adjustedStartDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[80px] bg-muted/20 rounded-sm" />
              ))}
              {/* Actual days */}
              {days.map(day => renderDayCell(day))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
