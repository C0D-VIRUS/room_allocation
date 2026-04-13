export const genderValues = ["MALE", "FEMALE", "OTHER"] as const;
export const roomAvailabilityValues = [
  "AVAILABLE",
  "PARTIALLY_OCCUPIED",
  "FULL",
  "MAINTENANCE"
] as const;
export const complaintStatusValues = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;

export type GenderValue = (typeof genderValues)[number];
export type RoomAvailabilityValue = (typeof roomAvailabilityValues)[number];
export type ComplaintStatusValue = (typeof complaintStatusValues)[number];

