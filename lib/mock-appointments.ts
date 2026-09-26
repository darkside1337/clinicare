export type AppointmentStatus =
  | "scheduled"
  | "checked-in"
  | "completed"
  | "no-show"
  | "cancelled";

export interface ClinicAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientDob: string;
  doctorName: string;
  timeSlot: string; // e.g. "09:00"
  durationMinutes: number; // 15 or 30
  status: AppointmentStatus;
  reason: string;
  isWalkIn: boolean;
  allergyFlag: boolean;
}

export type SurgeryAppointment = ClinicAppointment;

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
];

export const SURGERY_HOURS = CLINIC_HOURS;

export const INITIAL_CALENDAR_APPOINTMENTS: ClinicAppointment[] = [
  // Dr. Alistair Finch
  {
    id: "apt-finch-01",
    patientId: "pat-84920",
    patientName: "Eleanor Vance-Croft",
    patientDob: "14/08/1972",
    doctorName: "Dr. Alistair Finch",
    timeSlot: "09:00",
    durationMinutes: 30,
    status: "checked-in",
    reason: "Hypertension 6-month blood pressure review",
    isWalkIn: false,
    allergyFlag: true,
  },
  {
    id: "apt-finch-02",
    patientId: "pat-48201",
    patientName: "Chloe Sterling",
    patientDob: "22/05/1995",
    doctorName: "Dr. Alistair Finch",
    timeSlot: "09:30",
    durationMinutes: 30,
    status: "checked-in",
    reason: "Acute right wrist sprain post-fall",
    isWalkIn: true,
    allergyFlag: false,
  },
  {
    id: "apt-finch-03",
    patientId: "pat-77402",
    patientName: "David O'Connor",
    patientDob: "19/02/1983",
    doctorName: "Dr. Alistair Finch",
    timeSlot: "10:30",
    durationMinutes: 30,
    status: "scheduled",
    reason: "Asthma annual management plan & inhaler review",
    isWalkIn: false,
    allergyFlag: true,
  },
  {
    id: "apt-finch-04",
    patientId: "pat-66382",
    patientName: "Sophia Zhang",
    patientDob: "09/10/1990",
    doctorName: "Dr. Alistair Finch",
    timeSlot: "11:30",
    durationMinutes: 30,
    status: "scheduled",
    reason: "Skin lesion check (right forearm)",
    isWalkIn: false,
    allergyFlag: true,
  },
  {
    id: "apt-finch-05",
    patientId: "pat-84920",
    patientName: "Eleanor Vance-Croft",
    patientDob: "14/08/1972",
    doctorName: "Dr. Alistair Finch",
    timeSlot: "14:30",
    durationMinutes: 30,
    status: "scheduled",
    reason: "Follow-up blood test interpretation",
    isWalkIn: false,
    allergyFlag: true,
  },

  // Dr. Helen Rostova
  {
    id: "apt-rostova-01",
    patientId: "pat-93821",
    patientName: "Arthur Pendelton",
    patientDob: "03/11/1959",
    doctorName: "Dr. Helen Rostova",
    timeSlot: "09:00",
    durationMinutes: 30,
    status: "completed",
    reason: "Post-operative knee suture removal & wound check",
    isWalkIn: false,
    allergyFlag: false,
  },
  {
    id: "apt-rostova-02",
    patientId: "pat-19842",
    patientName: "Grace Holloway",
    patientDob: "30/07/2001",
    doctorName: "Dr. Helen Rostova",
    timeSlot: "10:00",
    durationMinutes: 30,
    status: "scheduled",
    reason: "Recurrent migraine symptoms review",
    isWalkIn: false,
    allergyFlag: false,
  },
  {
    id: "apt-rostova-03",
    patientId: "pat-39281",
    patientName: "George MacIntyre",
    patientDob: "18/03/1949",
    doctorName: "Dr. Helen Rostova",
    timeSlot: "11:00",
    durationMinutes: 30,
    status: "scheduled",
    reason: "Chronic osteoarthritis analgesia review",
    isWalkIn: false,
    allergyFlag: true,
  },
  {
    id: "apt-rostova-04",
    patientId: "pat-93821",
    patientName: "Arthur Pendelton",
    patientDob: "03/11/1959",
    doctorName: "Dr. Helen Rostova",
    timeSlot: "15:00",
    durationMinutes: 30,
    status: "scheduled",
    reason: "Physiotherapy progress assessment",
    isWalkIn: false,
    allergyFlag: false,
  },

  // Dr. Marcus Brody
  {
    id: "apt-brody-01",
    patientId: "pat-50291",
    patientName: "Benjamin Miller",
    patientDob: "12/04/1964",
    doctorName: "Dr. Marcus Brody",
    timeSlot: "09:30",
    durationMinutes: 30,
    status: "no-show",
    reason: "Routine cholesterol blood test follow-up",
    isWalkIn: false,
    allergyFlag: false,
  },
  {
    id: "apt-brody-02",
    patientId: "pat-92841",
    patientName: "Fiona Gallagher",
    patientDob: "05/12/1988",
    doctorName: "Dr. Marcus Brody",
    timeSlot: "10:30",
    durationMinutes: 30,
    status: "scheduled",
    reason: "Type 2 Diabetes HbA1c routine review",
    isWalkIn: false,
    allergyFlag: false,
  },
  {
    id: "apt-brody-03",
    patientId: "pat-48201",
    patientName: "Chloe Sterling",
    patientDob: "22/05/1995",
    doctorName: "Dr. Marcus Brody",
    timeSlot: "14:00",
    durationMinutes: 30,
    status: "scheduled",
    reason: "Wrist support follow-up and notes review",
    isWalkIn: true,
    allergyFlag: false,
  },
];
