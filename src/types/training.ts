export interface FormData {
  fullName: string;
  birthDate: number | undefined;
  gender: string;
  location: string;
  locationObject: object | null;
  age: number;
  experienceLevel: string;
  raceDistance: string;
  hasRaceDate: boolean;
  raceDate: Date | undefined;
  planLength: string;
  measurementUnit: string;
  desiredRaceTime: string;
  email: string;
  marketingConsent: boolean;
  termsAccepted: boolean;
}
