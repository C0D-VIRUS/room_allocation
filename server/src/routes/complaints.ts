import { Router } from "express";
import { isDatabaseAvailable } from "../lib/db.js";
import { demoComplaints, demoRooms, demoStudents, getNextId } from "../lib/demo-store.js";
import { handleServerError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { complaintSchema } from "../schemas/complaint.js";

export const complaintsRouter = Router();

complaintsRouter.get("/", async (_req, res) => {
  if (!(await isDatabaseAvailable())) {
    return res.json({
      mode: "demo",
      data: demoComplaints.map((complaint) => ({
        ...complaint,
        studentName: demoStudents.find((student) => student.id === complaint.studentId)?.fullName ?? "Unknown",
        roomNumber: demoRooms.find((room) => room.id === complaint.roomId)?.roomNumber ?? "Unknown"
      }))
    });
  }

  const complaints = await prisma.complaint.findMany({
    include: {
      student: true,
      room: true
    },
    orderBy: {
      raisedAt: "desc"
    }
  });

  return res.json({
    mode: "database",
    data: complaints.map((complaint) => ({
      id: complaint.id,
      studentId: complaint.studentId,
      roomId: complaint.roomId,
      complaintType: complaint.complaintType,
      description: complaint.description,
      status: complaint.status,
      raisedAt: complaint.raisedAt,
      studentName: complaint.student.fullName,
      roomNumber: complaint.room.roomNumber
    }))
  });
});

complaintsRouter.post("/", async (req, res) => {
  try {
    const payload = complaintSchema.parse(req.body);

    if (!(await isDatabaseAvailable())) {
      const student = demoStudents.find((item) => item.id === payload.studentId);
      const room = demoRooms.find((item) => item.id === payload.roomId);

      if (!student || !room) {
        return res.status(404).json({
          message: "Selected student or room was not found"
        });
      }

      const complaint = {
        id: getNextId(demoComplaints),
        ...payload,
        raisedAt: new Date()
      };
      demoComplaints.unshift(complaint);
      return res.status(201).json(complaint);
    }

    const [student, room] = await Promise.all([
      prisma.student.findUnique({ where: { id: payload.studentId } }),
      prisma.room.findUnique({ where: { id: payload.roomId } })
    ]);

    if (!student || !room) {
      return res.status(404).json({
        message: "Selected student or room was not found"
      });
    }

    const complaint = await prisma.complaint.create({
      data: payload
    });

    return res.status(201).json(complaint);
  } catch (error) {
    return handleServerError(res, error);
  }
});

complaintsRouter.delete("/:id", async (req, res) => {
  try {
    const complaintId = Number(req.params.id);

    if (Number.isNaN(complaintId)) {
      return res.status(400).json({
        message: "Invalid complaint id"
      });
    }

    if (!(await isDatabaseAvailable())) {
      const complaintIndex = demoComplaints.findIndex((complaint) => complaint.id === complaintId);

      if (complaintIndex === -1) {
        return res.status(404).json({
          message: "Complaint not found"
        });
      }

      demoComplaints.splice(complaintIndex, 1);
      return res.status(204).send();
    }

    await prisma.complaint.delete({
      where: { id: complaintId }
    });

    return res.status(204).send();
  } catch (error) {
    return handleServerError(res, error);
  }
});
