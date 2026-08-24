export const formValidation = {
  required: (value: unknown, label: string) => String(value ?? '').trim() ? undefined : `${label} est requis.`,
  email: (value: string, required = false) => !value.trim() ? (required ? 'Adresse e-mail requise.' : undefined) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : 'Adresse e-mail invalide.',
  phone: (value: string, required = false) => !value.trim() ? (required ? 'Numéro de téléphone requis.' : undefined) : /^\+?[0-9\s()-]{8,20}$/.test(value.trim()) ? undefined : 'Numéro de téléphone invalide.',
  url: (value: string) => { if (!value.trim()) return undefined; try { new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`); return undefined; } catch { return 'Adresse web invalide.'; } },
  positiveNumber: (value: string, label: string, required = false) => !value.trim() ? (required ? `${label} est requis.` : undefined) : Number.isFinite(Number(value)) && Number(value) > 0 ? undefined : `${label} doit être un nombre supérieur à zéro.`,
  date: (value: string, label: string, required = false) => !value ? (required ? `${label} est requise.` : undefined) : /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00`).getTime()) ? undefined : `${label} est invalide.`,
  dateOrder: (start: string, end: string) => start && end && new Date(`${end}T12:00:00`) < new Date(`${start}T12:00:00`) ? 'La date de fin doit être postérieure à la date de début.' : undefined,
};
