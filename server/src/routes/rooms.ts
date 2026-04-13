import { Router } from "express";
import { deriveRoomAvailability, getActiveAllocationCount } from "../lib/allocation-logic.js";
import { isDatabaseAvailable } from "../lib/db.js";
import { demoAllocations, demoHostels, demoRooms, getNextId } from "../lib/demo-store.js";
import { handleServerError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { roomSchema } from "../schemas/room.js";

export const roomsRouter = Router();

roomsRouter.get("/", async (_req, res) => {
  if (!(await isDatabaseAvailable())) {
    return res.json({
      mode: "demo",
      data: demoRooms.map((room) => ({
        ...room,
        hostelName: demoHostels.find((hostel) => hostel.id === room.hostelId)?.hostelName ?? "Unknown",
        occupiedBeds: getActiveAllocationCount(demoAllocations, room.id)
      }))
    });
  }

  const rooms = await prisma.room.findMany({
    include: {
      hostel: true,
      allocations: {
        where: {
          status: "ACTIVE"
        }
      }
    },
    orderBy: [{ hostelId: "asc" }, { roomNumber: "asc" }]
  });

  return res.json({
    mode: "database",
    data: rooms.map((room: (typeof rooms)[number]) => ({
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      capacity: room.capacity,
      availability: deriveRoomAvailability(room.capacity, room.allocations.length),
      hostelId: room.hostelId,
      hostelName: room.hostel.hostelName,
      occupiedBeds: room.allocations.length
    }))
  });
});

roomsRouter.post("/", async (req, res) => {
  try {
    const payload = roomSchema.parse(req.body);

    if (!(await isDatabaseAvailable())) {
      const room = {
        id: getNextId(demoRooms),
        ...payload
      };
      demoRooms.push(room);
      return res.status(201).json(room);
    }

    const room = await prisma.room.create({
      data: payload
    });

    return res.status(201).json(room);
  } catch (error) {
    return handleServerError(res, error);
  }
});

roomsRouter.delete("/:id", async (req, res) => {
  try {
    const roomId = Number(req.params.id);

    if (Number.isNaN(roomId)) {
      return res.status(400).json({
        message: "Invalid room id"
      });
    }

    if (!(await isDatabaseAvailable())) {
      const roomIndex = demoRooms.findIndex((room) => room.id === roomId);

      if (roomIndex === -1) {
        return res.status(404).json({
          message: "Room not found"
        });
      }

      demoRooms.splice(roomIndex, 1);
      return res.status(204).send();
    }

    await prisma.room.delete({
      where: { id: roomId }
    });

    return res.status(204).send();
  } catch (error) {
    return handleServerError(res, error);
  }
});
