import { Router } from "express";
import { isDatabaseAvailable } from "../lib/db.js";
import { demoSummary } from "../lib/demo-store.js";
import { prisma } from "../lib/prisma.js";

export const dashboardRouter = Router();

dashboardRouter.get("/health", async (_req, res) => {
  const database = (await isDatabaseAvailable()) ? "connected" : "demo-fallback";

  return res.json({
    api: "running",
    database
  });
});

dashboardRouter.get("/summary", async (_req, res) => {
  if (!(await isDatabaseAvailable())) {
    return res.json({
      ...demoSummary,
      mode: "demo"
    });
  }

  const [students, hostels, rooms, openComplaints] = await Promise.all([
    prisma.student.count(),
    prisma.hostel.count(),
    prisma.room.count(),
    prisma.complaint.count({
      where: {
        status: {
          in: ["OPEN", "IN_PROGRESS"]
        }
      }
    })
  ]);

  return res.json({
    students,
    hostels,
    rooms,
    openComplaints,
    mode: "database"
  });
});
