import { Router } from "express";
import { isDatabaseAvailable } from "../lib/db.js";
import { demoFees, demoStudents, getNextId } from "../lib/demo-store.js";
import { handleServerError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { feeSchema } from "../schemas/fee.js";

export const feesRouter = Router();

feesRouter.get("/", async (_req, res) => {
  if (!(await isDatabaseAvailable())) {
    return res.json({
      mode: "demo",
      data: demoFees.map((fee) => ({
        ...fee,
        studentName: demoStudents.find((student) => student.id === fee.studentId)?.fullName ?? "Unknown"
      }))
    });
  }

  const fees = await prisma.fee.findMany({
    include: {
      student: true
    },
    orderBy: {
      dueDate: "asc"
    }
  });

  return res.json({
    mode: "database",
    data: fees.map((fee) => ({
      id: fee.id,
      studentId: fee.studentId,
      amount: Number(fee.amount),
      dueDate: fee.dueDate,
      paymentDate: fee.paymentDate,
      paymentStatus: fee.paymentStatus,
      studentName: fee.student.fullName
    }))
  });
});

feesRouter.post("/", async (req, res) => {
  try {
    const payload = feeSchema.parse(req.body);

    if (payload.paymentDate && new Date(payload.paymentDate) > new Date()) {
      return res.status(400).json({
        message: "Payment date cannot be in the future"
      });
    }

    if (!(await isDatabaseAvailable())) {
      const student = demoStudents.find((item) => item.id === payload.studentId);
      if (!student) {
        return res.status(404).json({
          message: "Selected student was not found"
        });
      }

      const fee = {
        id: getNextId(demoFees),
        studentId: payload.studentId,
        amount: payload.amount,
        dueDate: new Date(payload.dueDate),
        paymentDate: payload.paymentDate ? new Date(payload.paymentDate) : null,
        paymentStatus: payload.paymentStatus
      };
      demoFees.unshift(fee);
      return res.status(201).json(fee);
    }

    const student = await prisma.student.findUnique({
      where: { id: payload.studentId }
    });

    if (!student) {
      return res.status(404).json({
        message: "Selected student was not found"
      });
    }

    const fee = await prisma.fee.create({
      data: {
        studentId: payload.studentId,
        amount: payload.amount,
        dueDate: new Date(payload.dueDate),
        paymentDate: payload.paymentDate ? new Date(payload.paymentDate) : null,
        paymentStatus: payload.paymentStatus
      }
    });

    return res.status(201).json(fee);
  } catch (error) {
    return handleServerError(res, error);
  }
});

feesRouter.delete("/:id", async (req, res) => {
  try {
    const feeId = Number(req.params.id);

    if (Number.isNaN(feeId)) {
      return res.status(400).json({
        message: "Invalid fee id"
      });
    }

    if (!(await isDatabaseAvailable())) {
      const feeIndex = demoFees.findIndex((fee) => fee.id === feeId);

      if (feeIndex === -1) {
        return res.status(404).json({
          message: "Fee record not found"
        });
      }

      demoFees.splice(feeIndex, 1);
      return res.status(204).send();
    }

    await prisma.fee.delete({
      where: { id: feeId }
    });

    return res.status(204).send();
  } catch (error) {
    return handleServerError(res, error);
  }
});
