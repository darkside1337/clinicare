import { Appointment } from "./mock-patient";

export interface DashboardAppointment extends Appointment {
  patientId: string;
  patientName: string;
  patientDob: string;
  patientAge: number;
  allergyFlag: boolean;
  timeSlot: string; // e.g. "09:00"
}

export interface RecentPatient {
  id: string;
  name: string;
  dob: string;
  age: number;
  lastSeen: string;
  allergyCount: number;
  hasSevereAllergy: boolean;
  activeProblemsCount: number;
}

export const MOCK_DOCTORS = [
  "All Clinicians",
  "Dr. Alistair Finch",
  "Dr. Helen Rostova",
  "Dr. Marcus Brody",
] as const;

export const MOCK_TODAY_APPOINTMENTS: DashboardAppointment[] = [
  {
    id: "apt-today-01",
    patientId: "pat-84920",
    patientName: "Eleanor Vance-Croft",
    patientDob: "14/05/1972",
    patientAge: 54,
    doctorName: "Dr. Alistair Finch",
    scheduledAt: "24/09/2026 09:00",
    timeSlot: "09:00",
    status: "checked-in",
    isWalkIn: false,
    reason: "Hypertension 6-month blood pressure review",
    allergyFlag: true,
  },
  {
    id: "apt-today-02",
    patientId: "pat-91024",
    patientName: "Arthur Pendelton",
    patientDob: "22/11/1958",
    patientAge: 67,
    doctorName: "Dr. Helen Rostova",
    scheduledAt: "24/09/2026 09:20",
    timeSlot: "09:20",
    status: "completed",
    isWalkIn: false,
    reason: "Post-operative knee suture removal & wound check",
    allergyFlag: false,
  },
  {
    id: "apt-today-03",
    patientId: "pat-38291",
    patientName: "Chloe Sterling",
    patientDob: "03/08/1995",
    patientAge: 31,
    doctorName: "Dr. Alistair Finch",
    scheduledAt: "24/09/2026 09:40",
    timeSlot: "09:40",
    status: "checked-in",
    isWalkIn: true,
    reason: "Walk-in: Acute right wrist sprain post-fall",
    allergyFlag: false,
  },
  {
    id: "apt-today-04",
    patientId: "pat-77402",
    patientName: "David O'Connor",
    patientDob: "19/02/1983",
    patientAge: 43,
    doctorName: "Dr. Alistair Finch",
    scheduledAt: "24/09/2026 10:15",
    timeSlot: "10:15",
    status: "scheduled",
    isWalkIn: false,
    reason: "Asthma annual management plan & inhaler review",
    allergyFlag: true,
  },
  {
    id: "apt-today-05",
    patientId: "pat-19842",
    patientName: "Grace Holloway",
    patientDob: "30/07/2001",
    patientAge: 25,
    doctorName: "Dr. Helen Rostova",
    scheduledAt: "24/09/2026 10:45",
    timeSlot: "10:45",
    status: "scheduled",
    isWalkIn: false,
    reason: "Recurrent migraine symptoms review",
    allergyFlag: false,
  },
  {
    id: "apt-today-06",
    patientId: "pat-50291",
    patientName: "Benjamin Miller",
    patientDob: "12/04/1964",
    patientAge: 62,
    doctorName: "Dr. Marcus Brody",
    scheduledAt: "24/09/2026 11:10",
    timeSlot: "11:10",
    status: "no-show",
    isWalkIn: false,
    reason: "Routine cholesterol blood test follow-up",
    allergyFlag: false,
  },
  {
    id: "apt-today-07",
    patientId: "pat-66382",
    patientName: "Sophia Zhang",
    patientDob: "09/10/1990",
    patientAge: 35,
    doctorName: "Dr. Alistair Finch",
    scheduledAt: "24/09/2026 11:30",
    timeSlot: "11:30",
    status: "scheduled",
    isWalkIn: false,
    reason: "Skin lesion check (right forearm)",
    allergyFlag: true,
  },
];

export const MOCK_RECENT_PATIENTS: RecentPatient[] = [
  {
    id: "pat-84920",
    name: "Eleanor Vance-Croft",
    dob: "14/05/1972",
    age: 54,
    lastSeen: "Today, 09:00",
    allergyCount: 3,
    hasSevereAllergy: true,
    activeProblemsCount: 3,
  },
  {
    id: "pat-91024",
    name: "Arthur Pendelton",
    dob: "22/11/1958",
    age: 67,
    lastSeen: "Today, 09:20",
    allergyCount: 0,
    hasSevereAllergy: false,
    activeProblemsCount: 1,
  },
  {
    id: "pat-38291",
    name: "Chloe Sterling",
    dob: "03/08/1995",
    age: 31,
    lastSeen: "Today, 09:40",
    allergyCount: 1,
    hasSevereAllergy: false,
    activeProblemsCount: 1,
  },
  {
    id: "pat-44910",
    name: "George MacIntyre",
    dob: "05/01/1949",
    age: 77,
    lastSeen: "Yesterday, 16:15",
    allergyCount: 2,
    hasSevereAllergy: true,
    activeProblemsCount: 4,
  },
  {
    id: "pat-12093",
    name: "Fatima Al-Mansoor",
    dob: "18/06/1988",
    age: 38,
    lastSeen: "22/09/2026",
    allergyCount: 0,
    hasSevereAllergy: false,
    activeProblemsCount: 2,
  },
];
