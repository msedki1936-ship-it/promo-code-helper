import { CalendarSettings, Arret, TRANCHE_COLORS, modulePatterns, PatternType } from '@/types/calendar';

/**
 * Get the color for an arret based on its tranche.
 * Both AT and preparations use the same tranche color for visual consistency.
 */
export function getArretColor(arret: Arret, settings: CalendarSettings): string {
  // Use mandatory tranche colors
  switch (arret.tranche) {
    case 'Tr2':
      return settings.arretTr2Color;
    case 'Tr3':
      return settings.arretTr3Color;
    case 'Tr4':
      return settings.arretTr4Color;
    case 'Tr5':
      return settings.arretTr5Color;
    default:
      return TRANCHE_COLORS.Tr2;
  }
}

/**
 * Get the pattern for an arret/preparation based on its module type.
 * AT (arrêts) have no pattern, preparations use module-specific patterns.
 */
export function getArretPattern(arret: Arret): PatternType {
  if (arret.type === 'arret') {
    return 'none';
  }
  // For preparations, use module-specific pattern or default dots
  if (arret.module && modulePatterns[arret.module]) {
    return modulePatterns[arret.module];
  }
  return arret.pattern || 'dots';
}

/**
 * Get human-readable module label
 */
export function getModuleLabel(module?: string): string {
  const labels: Record<string, string> = {
    'M0': 'Module 0',
    'M1': 'Module 1',
    'M2A': 'Module 2A',
    'M2B': 'Module 2B',
    'M3': 'Module 3',
    'M4': 'Module 4',
  };
  return module ? labels[module] || module : '';
}
