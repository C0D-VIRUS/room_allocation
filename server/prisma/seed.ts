import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.complaint.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.lifestyle.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hostel.deleteMany();
  await prisma.student.deleteMany();
  await prisma.admin.deleteMany();

  const admin = await prisma.admin.create({
    data: {
      fullName: "Admin User",
      email: "admin@hostel.local",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      designation: "Chief Warden",
      contactNumber: "9999999999",
      department: "Hostel Administration"
    }
  });

  const hostelA = await prisma.hostel.create({
    data: {
      hostelName: "Saraswati Residency",
      block: "A",
      capacity: 120,
      address: "North Campus"
    }
  });

  const hostelB = await prisma.hostel.create({
    data: {
      hostelName: "Narmada Residency",
      block: "B",
      capacity: 90,
      address: "East Campus"
    }
  });

  await prisma.hostel.update({
    where: { id: hostelA.id },
    data: {
      admins: {
        connect: { id: admin.id }
      }
    }
  });

  await prisma.hostel.update({
    where: { id: hostelB.id },
    data: {
      admins: {
        connect: { id: admin.id }
      }
    }
  });

  const roomA101 = await prisma.room.create({
    data: {
      roomNumber: "A-101",
      floor: 1,
      capacity: 2,
      availability: "PARTIALLY_OCCUPIED",
      hostelId: hostelA.id
    }
  });

  const roomA203 = await prisma.room.create({
    data: {
      roomNumber: "A-203",
      floor: 2,
      capacity: 3,
      availability: "AVAILABLE",
      hostelId: hostelA.id
    }
  });

  const roomB110 = await prisma.room.create({
    data: {
      roomNumber: "B-110",
      floor: 1,
      capacity: 2,
      availability: "PARTIALLY_OCCUPIED",
      hostelId: hostelB.id
    }
  });

  const aarav = await prisma.student.create({
    data: {
      fullName: "Aarav Sharma",
      age: 20,
      gender: "MALE",
      course: "B.Tech CSE",
      academicYear: 2,
      contactNumber: "9876543210",
      email: "aarav@example.com"
    }
  });

  const riya = await prisma.student.create({
    data: {
      fullName: "Riya Patel",
      age: 21,
      gender: "FEMALE",
      course: "BBA",
      academicYear: 3,
      contactNumber: "9876543211",
      email: "riya@example.com"
    }
  });

  await prisma.preference.createMany({
    data: [
      {
        studentId: aarav.id,
        sleepTime: "11:00 PM",
        studyHabit: "Night Study",
        cleanlinessLevel: "High",
        foodPreference: "Vegetarian"
      },
      {
        studentId: riya.id,
        sleepTime: "10:30 PM",
        studyHabit: "Early Morning",
        cleanlinessLevel: "Medium",
        foodPreference: "Jain"
      }
    ]
  });

  await prisma.lifestyle.createMany({
    data: [
      {
        studentId: aarav.id,
        smoking: false,
        drinking: false,
        musicVolume: "Low",
        guestFrequency: "Rare"
      },
      {
        studentId: riya.id,
        smoking: false,
        drinking: false,
        musicVolume: "Moderate",
        guestFrequency: "Occasional"
      }
    ]
  });

  await prisma.allocation.createMany({
    data: [
      {
        studentId: aarav.id,
        roomId: roomA101.id,
        hostelId: hostelA.id,
        startDate: new Date("2026-04-01"),
        allocationDate: new Date("2026-04-01"),
        status: "ACTIVE"
      },
      {
        studentId: riya.id,
        roomId: roomB110.id,
        hostelId: hostelB.id,
        startDate: new Date("2026-04-03"),
        allocationDate: new Date("2026-04-03"),
        status: "ACTIVE"
      }
    ]
  });

  await prisma.complaint.createMany({
    data: [
      {
        studentId: aarav.id,
        roomId: roomA101.id,
        complaintType: "Electrical",
        description: "Tube light not working",
        status: "OPEN"
      },
      {
        studentId: riya.id,
        roomId: roomB110.id,
        complaintType: "Water Supply",
        description: "Low water pressure in bathroom",
        status: "IN_PROGRESS"
      }
    ]
  });

  await prisma.fee.createMany({
    data: [
      {
        studentId: aarav.id,
        amount: 45000,
        dueDate: new Date("2026-04-20"),
        paymentStatus: "PENDING"
      },
      {
        studentId: riya.id,
        amount: 45000,
        dueDate: new Date("2026-04-01"),
        paymentDate: new Date("2026-03-29"),
        paymentStatus: "PAID"
      }
    ]
  });

  console.log("Seed data inserted successfully.");
  console.log(`Admin: ${admin.fullName}`);
  console.log(`Hostels: ${hostelA.hostelName}, ${hostelB.hostelName}`);
  console.log(`Rooms: ${roomA101.roomNumber}, ${roomA203.roomNumber}, ${roomB110.roomNumber}`);
  console.log(`Students: ${aarav.fullName}, ${riya.fullName}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
