import axios from 'axios';
import type { AppApiError } from '@/types/api.types';

type JsonObject = Record<string, unknown>;
const unsafe = /(?:stacktrace|sql|hibernate|postgres|kafka|jdbc|constraint \[|relation .* does not exist|org\.|java\.)/i;
const defaults: Record<number, string> = {
  400: 'La demande est invalide.', 401: 'Votre session doit être renouvelée.',
  403: "Vous n'avez pas l'autorisation nécessaire.", 404: 'La ressource demandée est introuvable.',
  409: 'Cette opération entre en conflit avec les données existantes.',
  422: 'Certaines informations sont invalides.',
  429: 'Trop de demandes ont été envoyées. Réessayez dans quelques instants.',
};

const object = (value: unknown): JsonObject | undefined => typeof value === 'object' && value !== null && !Array.isArray(value) ? value as JsonObject : undefined;
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : undefined;
function fields(body?: JsonObject): Record<string, string> | undefined {
  const result: Record<string, string> = {};
  const direct = object(body?.fieldErrors);
  if (direct) for (const [field, value] of Object.entries(direct)) { const message = text(value); if (message && !unsafe.test(message)) result[field] = message; }
  const errors = object(body?.errors);
  if (errors) for (const [field, value] of Object.entries(errors)) { const message = Array.isArray(value) ? text(value[0]) : text(value); if (message && !unsafe.test(message)) result[field] = message; }
  if (Array.isArray(body?.details)) for (const value of body.details) { const detail = object(value); const field = text(detail?.field); const message = text(detail?.message); if (field && message && !unsafe.test(message)) result[field] = message; }
  return Object.keys(result).length ? result : undefined;
}

export function normalizeApiError(error: unknown): AppApiError {
  const normalized = object(error);
  if (!axios.isAxiosError(error) && text(normalized?.message) && (normalized?.status !== undefined || normalized?.code !== undefined)) return error as AppApiError;
  if (!axios.isAxiosError(error)) return { message: 'Une erreur inattendue est survenue.' };
  const status = error.response?.status;
  const body = object(error.response?.data);
  const code = text(body?.code) ?? text(body?.errorCode) ?? text(body?.scanResult) ?? text(body?.title);
  const correlationId = text(body?.correlationId) ?? text(error.response?.headers?.['x-correlation-id']);
  const backendMessage = text(body?.message) ?? text(body?.detail);
  const message = !status
    ? 'Connexion au serveur impossible. Vérifiez votre réseau.'
    : status >= 500
      ? 'Une erreur serveur est survenue. Réessayez plus tard.'
      : backendMessage && !unsafe.test(backendMessage) ? backendMessage : defaults[status] ?? 'La demande a échoué.';
  return { status, code, message, fieldErrors: status === 422 || status === 400 ? fields(body) : undefined, correlationId };
}
