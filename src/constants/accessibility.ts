/**
 * Constantes et utilitaires pour l'accessibilité
 * Conforme WCAG 2.1 Level AA
 */

// Tailles minimales pour touch targets (44x44 selon WCAG)
export const TOUCH_TARGET = {
  MIN_SIZE: 44,
  RECOMMENDED_SIZE: 48,
} as const;

// Ratios de contraste conformes WCAG AA
export const CONTRAST_RATIOS = {
  NORMAL_TEXT: 4.5, // Pour texte normal (< 18px)
  LARGE_TEXT: 3.0, // Pour texte large (>= 18px ou >= 14px bold)
  UI_COMPONENTS: 3.0, // Pour composants UI
} as const;

// Durées d'animation accessibles
export const ANIMATION_DURATION = {
  SHORT: 200,
  MEDIUM: 300,
  LONG: 500,
  REDUCED_MOTION: 0, // Pour reduce-motion
} as const;

// Labels accessibilité standardisés
export const A11Y_LABELS = {
  // Navigation
  NAV_BACK: 'Retour',
  NAV_CLOSE: 'Fermer',
  NAV_MENU: 'Menu',
  NAV_SEARCH: 'Rechercher',
  NAV_FILTER: 'Filtrer',
  
  // Actions
  ACTION_LIKE: 'Aimer',
  ACTION_UNLIKE: 'Ne plus aimer',
  ACTION_COMMENT: 'Commenter',
  ACTION_SHARE: 'Partager',
  ACTION_SAVE: 'Enregistrer',
  ACTION_UNSAVE: 'Retirer des enregistrements',
  ACTION_FOLLOW: 'Suivre',
  ACTION_UNFOLLOW: 'Ne plus suivre',
  ACTION_DELETE: 'Supprimer',
  ACTION_EDIT: 'Modifier',
  
  // Formulaires
  FORM_REQUIRED: 'Champ obligatoire',
  FORM_OPTIONAL: 'Champ optionnel',
  FORM_ERROR: 'Erreur de validation',
  
  // Chargement
  LOADING: 'Chargement en cours',
  REFRESHING: 'Actualisation en cours',
  
  // États
  STATE_SELECTED: 'Sélectionné',
  STATE_UNSELECTED: 'Non sélectionné',
  STATE_CHECKED: 'Coché',
  STATE_UNCHECKED: 'Non coché',
  STATE_EXPANDED: 'Développé',
  STATE_COLLAPSED: 'Réduit',
} as const;

// Hints accessibilité
export const A11Y_HINTS = {
  DOUBLE_TAP: 'Touchez deux fois pour activer',
  SWIPE_LEFT: 'Glissez vers la gauche pour plus d\'options',
  SWIPE_RIGHT: 'Glissez vers la droite pour revenir',
  LONG_PRESS: 'Appuyez longuement pour plus d\'options',
} as const;

// Rôles accessibilité
export const A11Y_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  HEADER: 'header',
  IMAGE: 'image',
  TEXT: 'text',
  SEARCH: 'search',
  MENU: 'menu',
  TAB: 'tab',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  SWITCH: 'switch',
  SLIDER: 'adjustable',
} as const;

// Traits accessibilité
export const A11Y_TRAITS = {
  BUTTON: 'button',
  LINK: 'link',
  HEADER: 'header',
  IMAGE: 'image',
  SELECTED: 'selected',
  DISABLED: 'disabled',
  ADJUSTABLE: 'adjustable',
} as const;

/**
 * Vérifie si une taille de touch target est accessible
 */
export const isAccessibleTouchTarget = (size: number): boolean => {
  return size >= TOUCH_TARGET.MIN_SIZE;
};

/**
 * Calcule le ratio de contraste entre deux couleurs
 * Formule WCAG : https://www.w3.org/TR/WCAG21/#contrast-minimum
 */
export const calculateContrastRatio = (
  color1: string,
  color2: string
): number => {
  // Conversion hex vers RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Calcul de la luminance relative
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Vérifie si un contraste est conforme WCAG AA
 */
export const isAccessibleContrast = (
  ratio: number,
  isLargeText: boolean = false
): boolean => {
  const minRatio = isLargeText
    ? CONTRAST_RATIOS.LARGE_TEXT
    : CONTRAST_RATIOS.NORMAL_TEXT;
  return ratio >= minRatio;
};

/**
 * Génère un label accessible pour un bouton d'action
 */
export const getActionLabel = (
  action: string,
  isActive: boolean,
  count?: number
): string => {
  const countText = count !== undefined ? ` (${count})` : '';
  
  switch (action) {
    case 'like':
      return isActive ? `${A11Y_LABELS.ACTION_UNLIKE}${countText}` : `${A11Y_LABELS.ACTION_LIKE}${countText}`;
    case 'save':
      return isActive ? A11Y_LABELS.ACTION_UNSAVE : A11Y_LABELS.ACTION_SAVE;
    case 'follow':
      return isActive ? A11Y_LABELS.ACTION_UNFOLLOW : A11Y_LABELS.ACTION_FOLLOW;
    default:
      return action;
  }
};
