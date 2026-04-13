import bcrypt from "bcryptjs";

export const defaultAdminCredentials = {
  email: "admin@hostel.local",
  password: "admin123"
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
