import { z } from "zod";

export const hostelSchema = z.object({
  hostelName: z.string().min(2),
  block: z.string().min(1),
  capacity: z.coerce.number().int().min(1),
  address: z.string().min(4)
});

