import { CalendarSettings } from '@/types/calendar';

interface WeekHeaderProps {
  settings: CalendarSettings;
}

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function WeekHeader({ settings }: WeekHeaderProps) {
  return (
    <div className="grid grid-cols-7 border-b border-calendar-grid">
      {weekDays.map((day, index) => (
        <div
          key={day}
          className="py-3 text-center text-sm font-semibold border-r border-calendar-grid last:border-r-0"
          style={{
            backgroundColor: index >= 5 ? settings.titleWeekendColor : settings.titleWeekColor,
            color: '#fff',
          }}
        >
          {day}
        </div>
      ))}
    </div>
  );
}
