import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: apiBaseUrl
});

export type DashboardSummary = {
  students: number;
  hostels: number;
  rooms: number;
  openComplaints: number;
  mode: "demo" | "database";
};

export type HealthStatus = {
  api: "running";
  database: "connected" | "demo-fallback";
};

export type Student = {
  id: number;
  fullName: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  course: string;
  academicYear: number;
  contactNumber: string;
  email: string | null;
};

export type Hostel = {
  id: number;
  hostelName: string;
  block: string;
  capacity: number;
  address: string;
  roomCount: number;
};

export type Room = {
  id: number;
  roomNumber: string;
  floor: number;
  capacity: number;
  availability: "AVAILABLE" | "PARTIALLY_OCCUPIED" | "FULL" | "MAINTENANCE";
  hostelId: number;
  hostelName: string;
  occupiedBeds: number;
};

export type CreateRoomPayload = {
  roomNumber: string;
  floor: number;
  capacity: number;
  availability: Room["availability"];
  hostelId: number;
};

export type Allocation = {
  id: number;
  studentId: number;
  roomId: number;
  hostelId: number;
  allocationDate: string;
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  studentName: string;
  roomNumber: string;
  hostelName: string;
  roomOccupancy: string;
};

export type CreateAllocationPayload = {
  studentId: number;
  roomId: number;
  hostelId: number;
  startDate: string;
  endDate: string | null;
  status: Allocation["status"];
};

export type Complaint = {
  id: number;
  studentId: number;
  roomId: number;
  complaintType: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  raisedAt: string;
  studentName: string;
  roomNumber: string;
};

export type Fee = {
  id: number;
  studentId: number;
  amount: number;
  dueDate: string;
  paymentDate: string | null;
  paymentStatus: "PENDING" | "PAID" | "OVERDUE";
  studentName: string;
};

export type ReportOverview = {
  mode: "demo" | "database";
  totalStudents: number;
  totalHostels: number;
  totalRooms: number;
  activeAllocations: number;
  openComplaints: number;
  pendingFees: number;
  occupancyRate: number;
};

export async function fetchSummary() {
  const { data } = await api.get<DashboardSummary>("/dashboard/summary");
  return data;
}

export async function fetchHealth() {
  const { data } = await api.get<HealthStatus>("/dashboard/health");
  return data;
}

export async function fetchStudents() {
  const { data } = await api.get<{ data: Student[]; mode: string }>("/students");
  return data;
}

export async function createStudent(payload: Omit<Student, "id">) {
  const { data } = await api.post<Student>("/students", payload);
  return data;
}

export async function deleteStudent(studentId: number) {
  await api.delete(`/students/${studentId}`);
}

export async function fetchHostels() {
  const { data } = await api.get<{ data: Hostel[]; mode: string }>("/hostels");
  return data;
}

export async function createHostel(payload: Omit<Hostel, "id" | "roomCount">) {
  const { data } = await api.post<Hostel>("/hostels", payload);
  return data;
}

export async function deleteHostel(hostelId: number) {
  await api.delete(`/hostels/${hostelId}`);
}

export async function fetchRooms() {
  const { data } = await api.get<{ data: Room[]; mode: string }>("/rooms");
  return data;
}

export async function createRoom(payload: CreateRoomPayload) {
  const { data } = await api.post<Room>("/rooms", payload);
  return data;
}

export async function deleteRoom(roomId: number) {
  await api.delete(`/rooms/${roomId}`);
}

export async function fetchAllocations() {
  const { data } = await api.get<{ data: Allocation[]; mode: string }>("/allocations");
  return data;
}

export async function createAllocation(
  payload: CreateAllocationPayload
) {
  const { data } = await api.post<Allocation>("/allocations", payload);
  return data;
}

export async function deleteAllocation(allocationId: number) {
  await api.delete(`/allocations/${allocationId}`);
}

export async function fetchComplaints() {
  const { data } = await api.get<{ data: Complaint[]; mode: string }>("/complaints");
  return data;
}

export async function createComplaint(
  payload: Omit<Complaint, "id" | "raisedAt" | "studentName" | "roomNumber">
) {
  const { data } = await api.post<Complaint>("/complaints", payload);
  return data;
}

export async function deleteComplaint(complaintId: number) {
  await api.delete(`/complaints/${complaintId}`);
}

export async function fetchFees() {
  const { data } = await api.get<{ data: Fee[]; mode: string }>("/fees");
  return data;
}

export async function createFee(payload: Omit<Fee, "id" | "studentName">) {
  const { data } = await api.post<Fee>("/fees", payload);
  return data;
}

export async function deleteFee(feeId: number) {
  await api.delete(`/fees/${feeId}`);
}

export async function fetchReportOverview() {
  const { data } = await api.get<ReportOverview>("/reports/overview");
  return data;
}
