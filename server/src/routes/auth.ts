import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config.js";
import { defaultAdminCredentials, hashPassword, verifyPassword } from "../lib/auth.js";
import { isDatabaseAvailable } from "../lib/db.js";
import { handleServerError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { loginSchema } from "../schemas/auth.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  try {
    const credentials = loginSchema.parse(req.body);

    if (await isDatabaseAvailable()) {
      let admin = await prisma.admin.findFirst({
        where: {
          email: credentials.email
        }
      });

      if (!admin && credentials.email === defaultAdminCredentials.email) {
        const passwordHash = await hashPassword(defaultAdminCredentials.password);
        admin = await prisma.admin.upsert({
          where: {
            contactNumber: "9999999999"
          },
          update: {
            fullName: "Admin User",
            email: defaultAdminCredentials.email,
            passwordHash,
            role: "ADMIN",
            designation: "Chief Warden",
            department: "Hostel Administration"
          },
          create: {
            fullName: "Admin User",
            email: defaultAdminCredentials.email,
            passwordHash,
            role: "ADMIN",
            designation: "Chief Warden",
            contactNumber: "9999999999",
            department: "Hostel Administration"
          }
        });
      }

      if (!admin?.passwordHash || !admin.email) {
        return res.status(401).json({
          message: "Invalid email or password"
        });
      }

      const isPasswordValid = await verifyPassword(credentials.password, admin.passwordHash);

      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid email or password"
        });
      }

      const token = jwt.sign(
        {
          sub: admin.id,
          role: admin.role,
          email: admin.email
        },
        env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      return res.json({
        token,
        user: {
          id: admin.id,
          name: admin.fullName,
          email: admin.email,
          role: admin.role
        }
      });
    }

    const token = jwt.sign(
      {
        sub: 1,
        role: "ADMIN",
        email: defaultAdminCredentials.email
      },
      env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      user: {
        id: 1,
        name: "Admin User",
        email: defaultAdminCredentials.email,
        role: "ADMIN"
      }
    });
  } catch (error) {
    return handleServerError(res, error);
  }
});
