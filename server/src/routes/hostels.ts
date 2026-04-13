import { Router } from "express";
import { isDatabaseAvailable } from "../lib/db.js";
import { demoHostels, demoRooms, getNextId } from "../lib/demo-store.js";
import { handleServerError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { hostelSchema } from "../schemas/hostel.js";

export const hostelsRouter = Router();

hostelsRouter.get("/", async (_req, res) => {
  if (!(await isDatabaseAvailable())) {
    return res.json({
      mode: "demo",
      data: demoHostels.map((hostel) => ({
        ...hostel,
        roomCount: demoRooms.filter((room) => room.hostelId === hostel.id).length
      }))
    });
  }

  const hostels = await prisma.hostel.findMany({
    include: {
      rooms: true
    },
    orderBy: {
      hostelName: "asc"
    }
  });

  return res.json({
    mode: "database",
    data: hostels.map((hostel: (typeof hostels)[number]) => ({
      id: hostel.id,
      hostelName: hostel.hostelName,
      block: hostel.block,
      capacity: hostel.capacity,
      address: hostel.address,
      roomCount: hostel.rooms.length
    }))
  });
});

hostelsRouter.post("/", async (req, res) => {
  try {
    const payload = hostelSchema.parse(req.body);

    if (!(await isDatabaseAvailable())) {
      const hostel = {
        id: getNextId(demoHostels),
        ...payload
      };
      demoHostels.push(hostel);
      return res.status(201).json(hostel);
    }

    const hostel = await prisma.hostel.create({
      data: payload
    });

    return res.status(201).json(hostel);
  } catch (error) {
    return handleServerError(res, error);
  }
});

hostelsRouter.delete("/:id", async (req, res) => {
  try {
    const hostelId = Number(req.params.id);

    if (Number.isNaN(hostelId)) {
      return res.status(400).json({
        message: "Invalid hostel id"
      });
    }

    if (!(await isDatabaseAvailable())) {
      const hostelIndex = demoHostels.findIndex((hostel) => hostel.id === hostelId);

      if (hostelIndex === -1) {
        return res.status(404).json({
          message: "Hostel not found"
        });
      }

      demoHostels.splice(hostelIndex, 1);
      return res.status(204).send();
    }

    await prisma.hostel.delete({
      where: { id: hostelId }
    });

    return res.status(204).send();
  } catch (error) {
    return handleServerError(res, error);
  }
});
