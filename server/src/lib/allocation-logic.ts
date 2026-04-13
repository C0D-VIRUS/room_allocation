import type { DemoAllocation, DemoRoom } from "./demo-store.js";

export function getActiveAllocationCount(
  allocations: Array<{ roomId: number; status: string }>,
  roomId: number
) {
  return allocations.filter(
    (allocation) => allocation.roomId === roomId && allocation.status === "ACTIVE"
  ).length;
}

export function deriveRoomAvailability(capacity: number, activeAllocations: number) {
  if (activeAllocations <= 0) {
    return "AVAILABLE" as const;
  }

  if (activeAllocations >= capacity) {
    return "FULL" as const;
  }

  return "PARTIALLY_OCCUPIED" as const;
}

export function syncDemoRoomAvailability(room: DemoRoom, allocations: DemoAllocation[]) {
  const activeCount = getActiveAllocationCount(allocations, room.id);
  room.availability = deriveRoomAvailability(room.capacity, activeCount);
  return room;
}

