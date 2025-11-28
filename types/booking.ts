export type BookingStatus = "booked" | "cancelled";

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  startTime: string;
  status: BookingStatus;
}

