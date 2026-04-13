import { Router } from "express";
import { deriveRoomAvailability } from "../lib/allocation-logic.js";
import { isDatabaseAvailable } from "../lib/db.js";
import { demoStudents, getNextId } from "../lib/demo-store.js";
import { handleServerError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { studentSchema } from "../schemas/student.js";

export const studentsRouter = Router();

studentsRouter.get("/", async (_req, res) => {
  if (!(await isDatabaseAvailable())) {
    return res.json({
      mode: "demo",
      data: demoStudents
    });
  }

  const students = await prisma.student.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return res.json({
    mode: "database",
    data: students
  });
});

studentsRouter.post("/", async (req, res) => {
  try {
    const payload = studentSchema.parse(req.body);

    if (!(await isDatabaseAvailable())) {
      const duplicateContact = demoStudents.some(
        (student) => student.contactNumber === payload.contactNumber
      );
      if (duplicateContact) {
        return res.status(400).json({
          message: "A student with this contact number already exists"
        });
      }

      const student = {
        id: getNextId(demoStudents),
        createdAt: new Date(),
        updatedAt: new Date(),
        email: payload.email ?? null,
        ...payload
      };
      demoStudents.unshift(student);
      return res.status(201).json(student);
    }

    const duplicateContact = await prisma.student.findUnique({
      where: {
        contactNumber: payload.contactNumber
      }
    });

    if (duplicateContact) {
      return res.status(400).json({
        message: "A student with this contact number already exists"
      });
    }

    const student = await prisma.student.create({
      data: {
        ...payload,
        email: payload.email ?? null
      }
    });

    return res.status(201).json(student);
  } catch (error) {
    return handleServerError(res, error);
  }
});

studentsRouter.delete("/:id", async (req, res) => {
  try {
    const studentId = Number(req.params.id);

    if (Number.isNaN(studentId)) {
      return res.status(400).json({
        message: "Invalid student id"
      });
    }

    if (!(await isDatabaseAvailable())) {
      const studentIndex = demoStudents.findIndex((student) => student.id === studentId);

      if (studentIndex === -1) {
        return res.status(404).json({
          message: "Student not found"
        });
      }

      demoStudents.splice(studentIndex, 1);
      return res.status(204).send();
    }

    const allocations = await prisma.allocation.findMany({
      where: { studentId, status: "ACTIVE" },
      include: { room: true }
    });

    await prisma.student.delete({
      where: { id: studentId }
    });

    for (const allocation of allocations) {
      const activeCount = await prisma.allocation.count({
        where: {
          roomId: allocation.roomId,
          status: "ACTIVE"
        }
      });

      await prisma.room.update({
        where: { id: allocation.roomId },
        data: {
          availability: deriveRoomAvailability(allocation.room.capacity, activeCount)
        }
      });
    }

    return res.status(204).send();
  } catch (error) {
    return handleServerError(res, error);
  }
});
