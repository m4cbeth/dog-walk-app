export type VettingStatus = "pending" | "approved";

export interface DogProfile {
  name: string;
  breed: string;
  age: number;
}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  vettingStatus: VettingStatus;
  walkTokens: number;
  dogs: DogProfile[];
}

