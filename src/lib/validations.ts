import { z } from 'zod'

export const createReservationSchema = z.object({
  name: z.string().min(2, 'Името трябва да е поне 2 символа'),
  email: z.string().email('Невалиден имейл').optional().or(z.literal('')),
  date: z.string().date('Невалидна дата'),
  containerSize: z.enum(['TUBE_5L', 'TUBE_10L', 'BAG']),
})

export const cancellationRequestSchema = z.object({
  name: z.string().min(2, 'Името трябва да е поне 2 символа'),
  date: z.string().date('Невалидна дата').optional().or(z.literal('')),
  message: z.string().min(5, 'Моля, опишете причината'),
})

export const dayConfigSchema = z.object({
  date: z.string().date(),
  isBlocked: z.boolean(),
  blockReason: z.string().optional(),
  maxCapacity: z.number().positive().optional(),
})

export const globalSettingsSchema = z.object({
  defaultCapacity: z.number().positive('Капацитетът трябва да е положително число'),
})

export type CreateReservationInput = z.infer<typeof createReservationSchema>
export type CancellationRequestInput = z.infer<typeof cancellationRequestSchema>
export type DayConfigInput = z.infer<typeof dayConfigSchema>
export type GlobalSettingsInput = z.infer<typeof globalSettingsSchema>
