
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z
  .object({
    display_name: z.string().min(2, 'Name must be at least 2 characters'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30)
      .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers and underscores'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
    city: z.string().min(2, 'Please enter your city'),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export const partnerRegisterSchema = z
  .object({
    company_name: z.string().min(2, 'Company name must be at least 2 characters'),
    category: z.string().min(1, 'Please select a category'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(8, 'Please enter a valid phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
    accept_terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export const verifyCodeSchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type PartnerRegisterForm = z.infer<typeof partnerRegisterSchema>;
export type VerifyCodeForm = z.infer<typeof verifyCodeSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
