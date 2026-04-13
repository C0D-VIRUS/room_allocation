import { z } from "zod";

export const allocationSchema = z.object({
  studentId: z.coerce.number().int().min(1),
  roomId: z.coerce.number().int().min(1),
  hostelId: z.coerce.number().int().min(1),
  startDate: z.string().min(1),
  endDate: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).default("ACTIVE")
});

