import { Router } from "express";
import { isDatabaseAvailable } from "../lib/db.js";
import { demoAllocations, demoComplaints, demoFees, demoHostels, demoRooms, demoStudents } from "../lib/demo-store.js";
import { prisma } from "../lib/prisma.js";

export const reportsRouter = Router();

reportsRouter.get("/overview", async (_req, res) => {
  if (!(await isDatabaseAvailable())) {
    const occupancyRate = demoRooms.length
      ? Math.round((demoAllocations.filter((allocation) => allocation.status === "ACTIVE").length / demoRooms.length) * 100)
      : 0;

    return res.json({
      mode: "demo",
      totalStudents: demoStudents.length,
      totalHostels: demoHostels.length,
      totalRooms: demoRooms.length,
      activeAllocations: demoAllocations.filter((allocation) => allocation.status === "ACTIVE").length,
      openComplaints: demoComplaints.filter((complaint) => complaint.status !== "RESOLVED").length,
      pendingFees: demoFees.filter((fee) => fee.paymentStatus !== "PAID").length,
      occupancyRate
    });
  }

  const [totalStudents, totalHostels, totalRooms, activeAllocations, openComplaints, pendingFees] =
    await Promise.all([
      prisma.student.count(),
      prisma.hostel.count(),
      prisma.room.count(),
      prisma.allocation.count({ where: { status: "ACTIVE" } }),
      prisma.complaint.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      prisma.fee.count({ where: { paymentStatus: { in: ["PENDING", "OVERDUE"] } } })
    ]);

  const occupancyRate = totalRooms ? Math.round((activeAllocations / totalRooms) * 100) : 0;

  return res.json({
    mode: "database",
    totalStudents,
    totalHostels,
    totalRooms,
    activeAllocations,
    openComplaints,
    pendingFees,
    occupancyRate
  });
});

