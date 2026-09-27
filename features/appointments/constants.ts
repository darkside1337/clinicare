export const CLINIC_HOURS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
] as const;

export const DEFAULT_SLOT_DURATION_MINUTES = 30;

export interface FormDoctor {
  id: string;
  name: string;
  room?: string;
  specialty?: string;
}

export interface FormPatient {
  id: string;
  name: string;
  dob: string;
  hasSevereAllergy?: boolean;
}

export const DOCTORS: FormDoctor[] = [
  {
    id: "doc-finch",
    name: "Dr. Alistair Finch",
    room: "Consulting Room 1",
    specialty: "General Practice / Lead GP",
  },
  {
    id: "doc-rostova",
    name: "Dr. Helen Rostova",
    room: "Consulting Room 2",
    specialty: "General Practice / Minor Procedures",
  },
  {
    id: "doc-brody",
    name: "Dr. Marcus Brody",
    room: "Consulting Room 3",
    specialty: "GP / Chronic Disease",
  },
];
