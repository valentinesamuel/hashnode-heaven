import { z } from 'zod';

export const userSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
}).strict();
