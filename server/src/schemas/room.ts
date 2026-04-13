import { z } from "zod";
import { roomAvailabilityValues } from "./enums.js";

export const roomSchema = z.object({
  roomNumber: z.string().min(1),
  floor: z.coerce.number().int().min(0),
  capacity: z.coerce.number().int().min(1).max(8),
  availability: z.enum(roomAvailabilityValues),
  hostelId: z.coerce.number().int().min(1)
});
