import { Router } from "express";
import { deriveRoomAvailability, getActiveAllocationCount, syncDemoRoomAvailability } from "../lib/allocation-logic.js";
import { isDatabaseAvailable } from "../lib/db.js";
import { demoAllocations, demoHostels, demoRooms, demoStudents, getNextId } from "../lib/demo-store.js";
import { handleServerError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { allocationSchema } from "../schemas/allocation.js";

export const allocationsRouter = Router();

allocationsRouter.get("/", async (_req, res) => {
  if (!(await isDatabaseAvailable())) {
    return res.json({
      mode: "demo",
      data: demoAllocations.map((allocation) => ({
        ...allocation,
        studentName: demoStudents.find((student) => student.id === allocation.studentId)?.fullName ?? "Unknown",
        roomNumber: demoRooms.find((room) => room.id === allocation.roomId)?.roomNumber ?? "Unknown",
        hostelName: demoHostels.find((hostel) => hostel.id === allocation.hostelId)?.hostelName ?? "Unknown",
        roomOccupancy:
          getActiveAllocationCount(demoAllocations, allocation.roomId) +
          "/" +
          (demoRooms.find((room) => room.id === allocation.roomId)?.capacity ?? 0)
      }))
    });
  }

  const allocations = await prisma.allocation.findMany({
    include: {
      student: true,
      room: {
        include: {
          allocations: {
            where: {
              status: "ACTIVE"
            }
          }
        }
      },
      hostel: true
    },
    orderBy: {
      allocationDate: "desc"
    }
  });

  return res.json({
    mode: "database",
    data: allocations.map((allocation) => ({
      id: allocation.id,
      studentId: allocation.studentId,
      roomId: allocation.roomId,
      hostelId: allocation.hostelId,
      allocationDate: allocation.allocationDate,
      startDate: allocation.startDate,
      endDate: allocation.endDate,
      status: allocation.status,
      studentName: allocation.student.fullName,
      roomNumber: allocation.room.roomNumber,
      hostelName: allocation.hostel.hostelName,
      roomOccupancy: `${allocation.room.allocations?.length ?? 0}/${allocation.room.capacity}`
    }))
  });
});

allocationsRouter.post("/", async (req, res) => {
  try {
    const payload = allocationSchema.parse(req.body);

    if (!(await isDatabaseAvailable())) {
      const room = demoRooms.find((item) => item.id === payload.roomId);
      const student = demoStudents.find((item) => item.id === payload.studentId);

      if (!room || !student) {
        return res.status(404).json({
          message: "Selected student or room was not found"
        });
      }

      const studentAlreadyAllocated = demoAllocations.some(
        (allocation) => allocation.studentId === payload.studentId && allocation.status === "ACTIVE"
      );

      if (studentAlreadyAllocated && payload.status === "ACTIVE") {
        return res.status(400).json({
          message: "This student already has an active room allocation"
        });
      }

      const activeCount = getActiveAllocationCount(demoAllocations, payload.roomId);
      if (payload.status === "ACTIVE" && activeCount >= room.capacity) {
        return res.status(400).json({
          message: "This room is already full"
        });
      }

      const allocation = {
        id: getNextId(demoAllocations),
        studentId: payload.studentId,
        roomId: payload.roomId,
        hostelId: payload.hostelId,
        allocationDate: new Date(),
        startDate: new Date(payload.startDate),
        endDate: payload.endDate ? new Date(payload.endDate) : null,
        status: payload.status
      };
      demoAllocations.unshift(allocation);
      syncDemoRoomAvailability(room, demoAllocations);
      return res.status(201).json(allocation);
    }

    const [student, room, existingAllocationCount, studentActiveAllocation] = await Promise.all([
      prisma.student.findUnique({ where: { id: payload.studentId } }),
      prisma.room.findUnique({
        where: { id: payload.roomId },
        include: {
          allocations: {
            where: {
              status: "ACTIVE"
            }
          }
        }
      }),
      prisma.allocation.count({
        where: {
          roomId: payload.roomId,
          status: "ACTIVE"
        }
      }),
      prisma.allocation.findFirst({
        where: {
          studentId: payload.studentId,
          status: "ACTIVE"
        }
      })
    ]);

    if (!student || !room) {
      return res.status(404).json({
        message: "Selected student or room was not found"
      });
    }

    if (studentActiveAllocation && payload.status === "ACTIVE") {
      return res.status(400).json({
        message: "This student already has an active room allocation"
      });
    }

    if (payload.status === "ACTIVE" && existingAllocationCount >= room.capacity) {
      return res.status(400).json({
        message: "This room is already full"
      });
    }

    const allocation = await prisma.$transaction(async (tx) => {
      const created = await tx.allocation.create({
        data: {
          studentId: payload.studentId,
          roomId: payload.roomId,
          hostelId: payload.hostelId,
          startDate: new Date(payload.startDate),
          endDate: payload.endDate ? new Date(payload.endDate) : null,
          status: payload.status
        }
      });

      const activeAfterCreate = await tx.allocation.count({
        where: {
          roomId: payload.roomId,
          status: "ACTIVE"
        }
      });

      await tx.room.update({
        where: { id: payload.roomId },
        data: {
          availability: deriveRoomAvailability(room.capacity, activeAfterCreate)
        }
      });

      return created;
    });

    return res.status(201).json(allocation);
  } catch (error) {
    return handleServerError(res, error);
  }
});

allocationsRouter.delete("/:id", async (req, res) => {
  try {
    const allocationId = Number(req.params.id);

    if (Number.isNaN(allocationId)) {
      return res.status(400).json({
        message: "Invalid allocation id"
      });
    }

    if (!(await isDatabaseAvailable())) {
      const allocationIndex = demoAllocations.findIndex((allocation) => allocation.id === allocationId);

      if (allocationIndex === -1) {
        return res.status(404).json({
          message: "Allocation not found"
        });
      }

      const allocation = demoAllocations[allocationIndex];
      const room = demoRooms.find((item) => item.id === allocation.roomId);
      demoAllocations.splice(allocationIndex, 1);
      if (room) {
        syncDemoRoomAvailability(room, demoAllocations);
      }
      return res.status(204).send();
    }

    const allocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
      include: { room: true }
    });

    if (!allocation) {
      return res.status(404).json({
        message: "Allocation not found"
      });
    }

    await prisma.allocation.delete({
      where: { id: allocationId }
    });

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

    return res.status(204).send();
  } catch (error) {
    return handleServerError(res, error);
  }
});
