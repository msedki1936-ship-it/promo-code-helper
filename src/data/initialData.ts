import { Vacation, Holiday, Arret, CalendarEvent, TRANCHE_COLORS } from '@/types/calendar';

// Initial astreinte start date from the Excel file
export const ASTREINTE_START_DATE = new Date(2026, 1, 5); // February 5, 2026 (Thursday)
export const ASTREINTE_CYCLE_WEEKS = 6;

// Vacances scolaires from the Excel file
export const initialVacations: Vacation[] = [
  {
    id: 'vac-1',
    name: 'Noël',
    startDate: new Date(2025, 11, 21),
    endDate: new Date(2026, 0, 4),
    color: '#a855f7',
  },
  {
    id: 'vac-2',
    name: 'Hiver',
    startDate: new Date(2026, 1, 7),
    endDate: new Date(2026, 1, 22),
    color: '#a855f7',
  },
  {
    id: 'vac-3',
    name: 'Printemps',
    startDate: new Date(2026, 3, 4),
    endDate: new Date(2026, 3, 19),
    color: '#a855f7',
  },
  {
    id: 'vac-4',
    name: 'Pont Ascension',
    startDate: new Date(2026, 4, 14),
    endDate: new Date(2026, 4, 17),
    color: '#a855f7',
  },
  {
    id: 'vac-5',
    name: 'Vacances été',
    startDate: new Date(2026, 6, 4),
    endDate: new Date(2026, 7, 30),
    color: '#a855f7',
  },
];

// Jours fériés from the Excel file
export const initialHolidays: Holiday[] = [
  { date: new Date(2026, 0, 1), name: "Jour de l'An" },
  { date: new Date(2026, 3, 6), name: "Lundi de Pâques" },
  { date: new Date(2026, 4, 1), name: "Fête du Travail" },
  { date: new Date(2026, 4, 8), name: "Victoire 1945" },
  { date: new Date(2026, 4, 14), name: "Ascension" },
  { date: new Date(2026, 4, 25), name: "Lundi de Pentecôte" },
  { date: new Date(2026, 6, 14), name: "Fête nationale" },
  { date: new Date(2026, 7, 15), name: "Assomption" },
  { date: new Date(2026, 10, 1), name: "Toussaint" },
  { date: new Date(2026, 10, 11), name: "Armistice 1918" },
  { date: new Date(2026, 11, 25), name: "Jour de Noël" },
  { date: new Date(2027, 0, 1), name: "Jour de l'An" },
  { date: new Date(2027, 2, 29), name: "Lundi de Pâques" },
  { date: new Date(2027, 4, 1), name: "Fête du Travail" },
  { date: new Date(2027, 4, 6), name: "Ascension" },
  { date: new Date(2027, 4, 8), name: "Victoire 1945" },
  { date: new Date(2027, 4, 17), name: "Lundi de Pentecôte" },
  { date: new Date(2027, 6, 14), name: "Fête nationale" },
  { date: new Date(2027, 7, 15), name: "Assomption" },
  { date: new Date(2027, 10, 1), name: "Toussaint" },
  { date: new Date(2027, 10, 11), name: "Armistice 1918" },
  { date: new Date(2027, 11, 25), name: "Jour de Noël" },
];

// Arrêts de tranches from the Excel file
export const initialArrets: Arret[] = [
  // AT Tr2 avec ses modules de préparation
  {
    id: 'prepa-m0-2p37',
    type: 'prepa',
    name: 'M0 2P37',
    startDate: new Date(2025, 10, 1),
    endDate: new Date(2025, 11, 15),
    tranche: 'Tr2',
    module: 'M0',
    parentArretId: 'arret-2p37',
  },
  {
    id: 'prepa-m1-2p37',
    type: 'prepa',
    name: 'M1 2P37',
    startDate: new Date(2025, 11, 16),
    endDate: new Date(2026, 0, 31),
    tranche: 'Tr2',
    module: 'M1',
    parentArretId: 'arret-2p37',
  },
  {
    id: 'prepa-m2a-2p37',
    type: 'prepa',
    name: 'M2A 2P37',
    startDate: new Date(2026, 1, 1),
    endDate: new Date(2026, 2, 15),
    tranche: 'Tr2',
    module: 'M2A',
    parentArretId: 'arret-2p37',
  },
  {
    id: 'prepa-m3-2p37',
    type: 'prepa',
    name: 'M3 2P37',
    startDate: new Date(2026, 2, 16),
    endDate: new Date(2026, 3, 30),
    tranche: 'Tr2',
    module: 'M3',
    parentArretId: 'arret-2p37',
  },
  {
    id: 'arret-2p37',
    type: 'arret',
    name: '2P37',
    startDate: new Date(2026, 4, 2),
    endDate: new Date(2026, 6, 14),
    tranche: 'Tr2',
  },
  // AT Tr3 avec préparations
  {
    id: 'prepa-m0-3p35',
    type: 'prepa',
    name: 'M0 3P35',
    startDate: new Date(2025, 11, 1),
    endDate: new Date(2026, 2, 31),
    tranche: 'Tr3',
    module: 'M0',
    parentArretId: 'arret-3p35',
  },
  {
    id: 'prepa-m1-3p35',
    type: 'prepa',
    name: 'M1 3P35',
    startDate: new Date(2026, 3, 1),
    endDate: new Date(2026, 6, 31),
    tranche: 'Tr3',
    module: 'M1',
    parentArretId: 'arret-3p35',
  },
  {
    id: 'prepa-m2b-3p35',
    type: 'prepa',
    name: 'M2B 3P35',
    startDate: new Date(2026, 7, 1),
    endDate: new Date(2026, 9, 31),
    tranche: 'Tr3',
    module: 'M2B',
    parentArretId: 'arret-3p35',
  },
  {
    id: 'arret-3p35',
    type: 'arret',
    name: '3P35',
    startDate: new Date(2026, 10, 7),
    endDate: new Date(2027, 0, 28),
    tranche: 'Tr3',
  },
  // AT Tr5
  {
    id: 'arret-5r34',
    type: 'arret',
    name: '5R34',
    startDate: new Date(2026, 1, 28),
    endDate: new Date(2026, 3, 11),
    tranche: 'Tr5',
  },
  // AT Tr4
  {
    id: 'prepa-m4-4p37',
    type: 'prepa',
    name: 'M4 4P37',
    startDate: new Date(2026, 11, 1),
    endDate: new Date(2027, 1, 19),
    tranche: 'Tr4',
    module: 'M4',
    parentArretId: 'arret-4p37',
  },
  {
    id: 'arret-4p37',
    type: 'arret',
    name: '4P37',
    startDate: new Date(2027, 1, 20),
    endDate: new Date(2027, 4, 4),
    tranche: 'Tr4',
  },
];

// Events from the Excel file
export const initialEvents: CalendarEvent[] = [
  // RE events (day state - grays out the cell)
  {
    id: 'evt-re-1',
    type: 're',
    name: 'RE',
    startDate: new Date(2025, 11, 20),
    endDate: new Date(2026, 0, 4),
    color: '#d1d5db', // Uses settings.reColor in practice
  },
  // CP events (day state - darker gray)
  {
    id: 'evt-cp-1',
    type: 'cp',
    name: 'CP',
    startDate: new Date(2026, 1, 9),
    endDate: new Date(2026, 1, 13),
    color: '#9ca3af', // Uses settings.cpColor in practice
  },
  {
    id: 'evt-2',
    type: 'event',
    name: 'AKSC 53',
    startDate: new Date(2026, 0, 5),
    endDate: new Date(2026, 0, 29),
    color: '#8b5cf6',
  },
  {
    id: 'evt-3',
    type: 'event',
    name: 'AKSC 53',
    startDate: new Date(2026, 1, 3),
    endDate: new Date(2026, 1, 5),
    color: '#8b5cf6',
  },
  {
    id: 'evt-4',
    type: 'event',
    name: 'RPAD',
    startDate: new Date(2026, 2, 9),
    endDate: new Date(2026, 2, 13),
    color: '#06b6d4',
  },
];

// Cancelled astreintes
export const initialCancelledAstreintes: string[] = [];

// Ponctual astreintes
export const initialPonctualAstreintes: Array<{ startDate: Date; endDate: Date }> = [
  {
    startDate: new Date(2026, 3, 10),
    endDate: new Date(2026, 3, 17),
  },
];
