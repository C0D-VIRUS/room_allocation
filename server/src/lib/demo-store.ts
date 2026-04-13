import type {
  ComplaintStatusValue,
  GenderValue,
  RoomAvailabilityValue
} from "../schemas/enums.js";

export type DemoStudent = {
  id: number;
  fullName: string;
  age: number;
  gender: GenderValue;
  course: string;
  academicYear: number;
  contactNumber: string;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DemoHostel = {
  id: number;
  hostelName: string;
  block: string;
  capacity: number;
  address: string;
};

export type DemoRoom = {
  id: number;
  roomNumber: string;
  floor: number;
  capacity: number;
  availability: RoomAvailabilityValue;
  hostelId: number;
};

export type DemoAllocation = {
  id: number;
  studentId: number;
  roomId: number;
  hostelId: number;
  allocationDate: Date;
  startDate: Date;
  endDate: Date | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
};

export type DemoComplaint = {
  id: number;
  studentId: number;
  roomId: number;
  complaintType: string;
  description: string;
  status: ComplaintStatusValue;
  raisedAt: Date;
};

export type DemoFee = {
  id: number;
  studentId: number;
  amount: number;
  dueDate: Date;
  paymentDate: Date | null;
  paymentStatus: "PENDING" | "PAID" | "OVERDUE";
};

export const demoUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@hostel.local",
    password: "admin123",
    role: "ADMIN"
  }
] as const;

export const demoStudents: DemoStudent[] = [
  {
    id: 1,
    fullName: "Aarav Sharma",
    age: 20,
    gender: "MALE",
    course: "B.Tech CSE",
    academicYear: 2,
    contactNumber: "9876543210",
    email: "aarav@example.com",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    fullName: "Riya Patel",
    age: 21,
    gender: "FEMALE",
    course: "BBA",
    academicYear: 3,
    contactNumber: "9876543211",
    email: "riya@example.com",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const demoHostels: DemoHostel[] = [
  {
    id: 1,
    hostelName: "Saraswati Hostel",
    block: "A",
    capacity: 120,
    address: "North Campus"
  },
  {
    id: 2,
    hostelName: "Narmada Hostel",
    block: "B",
    capacity: 90,
    address: "East Campus"
  }
];

export const demoRooms: DemoRoom[] = [
  {
    id: 1,
    roomNumber: "A-101",
    floor: 1,
    capacity: 2,
    availability: "PARTIALLY_OCCUPIED",
    hostelId: 1
  },
  {
    id: 2,
    roomNumber: "A-203",
    floor: 2,
    capacity: 3,
    availability: "AVAILABLE",
    hostelId: 1
  },
  {
    id: 3,
    roomNumber: "B-110",
    floor: 1,
    capacity: 2,
    availability: "FULL",
    hostelId: 2
  }
];

export const demoAllocations: DemoAllocation[] = [
  {
    id: 1,
    studentId: 1,
    roomId: 1,
    hostelId: 1,
    allocationDate: new Date("2026-04-01"),
    startDate: new Date("2026-04-01"),
    endDate: null,
    status: "ACTIVE"
  },
  {
    id: 2,
    studentId: 2,
    roomId: 3,
    hostelId: 2,
    allocationDate: new Date("2026-03-15"),
    startDate: new Date("2026-03-15"),
    endDate: null,
    status: "ACTIVE"
  }
];

export const demoComplaints: DemoComplaint[] = [
  {
    id: 1,
    studentId: 1,
    roomId: 1,
    complaintType: "Electrical",
    description: "Tube light not working",
    status: "OPEN",
    raisedAt: new Date("2026-04-05")
  },
  {
    id: 2,
    studentId: 2,
    roomId: 3,
    complaintType: "Water Supply",
    description: "Low water pressure in bathroom",
    status: "IN_PROGRESS",
    raisedAt: new Date("2026-04-06")
  }
];

export const demoFees: DemoFee[] = [
  {
    id: 1,
    studentId: 1,
    amount: 45000,
    dueDate: new Date("2026-04-20"),
    paymentDate: null,
    paymentStatus: "PENDING"
  },
  {
    id: 2,
    studentId: 2,
    amount: 45000,
    dueDate: new Date("2026-04-01"),
    paymentDate: new Date("2026-03-29"),
    paymentStatus: "PAID"
  }
];

export const demoSummary = {
  students: demoStudents.length,
  hostels: demoHostels.length,
  rooms: demoRooms.length,
  openComplaints: demoComplaints.filter((complaint) => complaint.status !== "RESOLVED").length,
  complaintStatus: "OPEN" as ComplaintStatusValue
};

export function getNextId(items: Array<{ id: number }>) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}
