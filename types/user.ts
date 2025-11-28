export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  isVetted: boolean;
  walksPerWeek: number;
  firstFreeWalkBookingId: string | null; // Booking ID for their free walk (only set for unvetted users)
}