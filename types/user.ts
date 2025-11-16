export type VettingStatus = "pending" | "approved";

export interface DogProfile {
  name: string;
  breed: string;
  age: number;
  notes: string;
}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  vettingStatus: VettingStatus;
  walkTokens: number;
  dogs: DogProfile[];
  paysMonthly: boolean;
  mondayWalkTime: number | null; // 24 hour time
  tuesdayWalkTime: number | null; // 24 hour time
  wednesdayWalkTime: number | null; // 24 hour time
  thursdayWalkTime: number | null; // 24 hour time
  fridayWalkTime: number | null; // 24 hour time
  saturdayWalkTime: number | null; // 24 hour time
  sundayWalkTime: number | null; // 24 hour time
}