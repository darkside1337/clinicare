export const DEMO_CLINIC_ID = "clinic-dev";

export const DEMO_PERSONAS = {
  doctor: {
    userId: "user-doctor-1",
    name: "Dr. Sarah Mitchell, MD",
    role: "doctor",
  },
  receptionist: {
    userId: "user-receptionist-1",
    name: "Alex Rivera",
    role: "receptionist",
  },
} as const;

export type DemoRole = keyof typeof DEMO_PERSONAS;
