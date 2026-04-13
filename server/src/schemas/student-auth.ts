import { z } from "zod";
import { genderValues } from "./enums.js";

export const studentRegistrationSchema = z.object({
  fullName: z.string().min(2),
  age: z.coerce.number().int().min(16).max(60),
  gender: z.enum(genderValues),
  course: z.string().min(2),
  academicYear: z.coerce.number().int().min(1).max(8),
  contactNumber: z.string().min(10).max(15),
  email: z.string().email(),
  password: z.string().min(6)
});
