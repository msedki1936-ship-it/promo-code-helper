export type EventType = 
  | 'astreinte'
  | 'astreinte-cancelled'
  | 'astreinte-ponctuelle'
  | 'event'
  | 'vacation'
  | 'holiday'
  | 'arret'
  | 'arret-prepa'
  | 're'  // Repos / Récupération
  | 'cp'; // Congés Payés

export type PatternType = 
  | 'none'
  | 'stripes'
  | 'dots'
  | 'crosshatch'
  | 'waves'
  | 'diagonal'
  | 'grid'
  | 'zigzag';

// Module types for AT preparation phases
export type PrepaModuleType = 'M0' | 'M1' | 'M2A' | 'M2B' | 'M3' | 'M4';

// Pattern mapping for each preparation module
export const modulePatterns: Record<PrepaModuleType, PatternType> = {
  'M0': 'dots',
  'M1': 'stripes',
  'M2A': 'diagonal',
  'M2B': 'crosshatch',
  'M3': 'waves',
  'M4': 'grid',
};
export interface CalendarEvent {
  id: string;
  type: EventType;
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
  pattern?: PatternType;
  isRecurring?: boolean;
  recurringWeeks?: number;
}

export interface Astreinte {
  id: string;
  name?: string; // Name for display (for cancellation or ponctuelle)
  startDate: Date; // Thursday
  endDate: Date; // Following Thursday
  isCancelled: boolean;
  isPonctuelle: boolean;
}

// Cancelled dates for specific days (not entire astreinte periods)
export interface CancelledAstreinteDate {
  id: string;
  date: Date;
  name: string;
  astreinteId: string; // Reference to the parent astreinte
}

export interface Vacation {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

export interface Holiday {
  date: Date;
  name: string;
}

export interface Arret {
  id: string;
  type: 'arret' | 'prepa';
  name: string;
  startDate: Date;
  endDate: Date;
  color?: string; // Optional - will use tranche color by default
  pattern?: PatternType;
  tranche: 'Tr2' | 'Tr3' | 'Tr4' | 'Tr5';
  module?: PrepaModuleType; // For prepa types: M0, M1, M2A, M2B, M3, M4
  parentArretId?: string; // Reference to the parent AT for preparations
}

export interface CalendarSettings {
  titleWeekColor: string;
  titleWeekendColor: string;
  weekNumbersColor: string;
  weekdaysColor: string;
  weekendDaysColor: string;
  emptyCellsColor: string;
  holidayPattern: PatternType;
  astreinteColor: string;
  astreinteCancelledColor: string;
  astreinteCancelledPattern: PatternType;
  astreintePonctuelleColor: string;
  eventColor: string;
  vacationColor: string;
  reColor: string;  // Couleur RE (repos/récupération) - grisage case
  cpColor: string;  // Couleur CP (congés payés) - plus foncée que RE
  // Couleurs par tranche - Arrêts
  arretTr2Color: string;
  arretTr3Color: string;
  arretTr4Color: string;
  arretTr5Color: string;
  // Couleurs par tranche - Préparations (mêmes couleurs, patterns différencient)
  prepaTr2Color: string;
  prepaTr3Color: string;
  prepaTr4Color: string;
  prepaTr5Color: string;
}

// Mandatory tranche colors as per specification
export const TRANCHE_COLORS = {
  Tr2: '#3C9453',
  Tr3: '#CC6600',
  Tr4: '#558ED5',
  Tr5: '#FF0000',
} as const;

export const defaultSettings: CalendarSettings = {
  titleWeekColor: '#3b82f6',
  titleWeekendColor: '#6366f1',
  weekNumbersColor: '#64748b',
  weekdaysColor: '#1e293b',
  weekendDaysColor: '#94a3b8',
  emptyCellsColor: '#f8fafc',
  holidayPattern: 'stripes',
  astreinteColor: '#f59e0b',
  astreinteCancelledColor: '#9ca3af',
  astreinteCancelledPattern: 'crosshatch',
  astreintePonctuelleColor: '#ea580c',
  eventColor: '#0ea5e9',
  vacationColor: '#a855f7',
  reColor: '#d1d5db',   // Gris clair pour RE
  cpColor: '#9ca3af',   // Gris plus foncé pour CP
  // Couleurs par tranche - Arrêts (obligatoires)
  arretTr2Color: TRANCHE_COLORS.Tr2,
  arretTr3Color: TRANCHE_COLORS.Tr3,
  arretTr4Color: TRANCHE_COLORS.Tr4,
  arretTr5Color: TRANCHE_COLORS.Tr5,
  // Couleurs par tranche - Préparations (mêmes que AT, patterns différencient)
  prepaTr2Color: TRANCHE_COLORS.Tr2,
  prepaTr3Color: TRANCHE_COLORS.Tr3,
  prepaTr4Color: TRANCHE_COLORS.Tr4,
  prepaTr5Color: TRANCHE_COLORS.Tr5,
};
