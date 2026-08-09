import { z } from 'zod';
export const countryCodeSchema = z.string().regex(/^[A-Z]{2}$/);
export const currencyCodeSchema = z.string().regex(/^[A-Z]{3}$/);
