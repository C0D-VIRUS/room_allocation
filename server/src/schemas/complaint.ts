import { z } from "zod";

export const complaintSchema = z.object({
  studentId: z.coerce.number().int().min(1),
  roomId: z.coerce.number().int().min(1),
  complaintType: z.string().min(2),
  description: z.string().min(5),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).default("OPEN")
});

