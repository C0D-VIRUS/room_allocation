import { z } from "zod";

export const feeSchema = z.object({
  studentId: z.coerce.number().int().min(1),
  amount: z.coerce.number().positive(),
  dueDate: z.string().min(1),
  paymentDate: z.string().nullable().optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "OVERDUE"]).default("PENDING")
});

