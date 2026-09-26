export interface PatientProfileData {
  id: string;
  name: string;
  dob: string;
  age: number;
  sex: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  address: string;
  registeredDate: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface AllergyProfileItem {
  id: string;
  substance: string;
  severity: "severe" | "moderate" | "mild";
  reaction: string;
  recordedDate: string;
}

export interface ProblemProfileItem {
  id: string;
  condition: string;
  status: "active" | "resolved";
  onsetDate: string;
  resolvedDate?: string;
  notes?: string;
}

export interface ConsultationProfileItem {
  id: string;
  appointmentId: string;
  doctorName: string;
  date: string;
  time: string;
  type: "Scheduled" | "Walk-in";
  chiefComplaint: string;
  symptoms: string;
  observations: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  prescriptionId?: string;
  hasPrescription?: boolean;
  prescriptionCount?: number;
}

export interface PrescriptionProfileItem {
  id: string;
  consultationId: string;
  doctorName: string;
  date: string;
  items: Array<{
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
}

export interface AppointmentProfileItem {
  id: string;
  doctorName: string;
  scheduledAt: string;
  status: "scheduled" | "checked-in" | "completed" | "no-show" | "cancelled";
  isWalkIn: boolean;
  reason?: string;
}

export interface PatientRecord {
  patient: PatientProfileData;
  allergies: AllergyProfileItem[];
  problems: ProblemProfileItem[];
  consultations: ConsultationProfileItem[];
  prescriptions: PrescriptionProfileItem[];
  appointments: AppointmentProfileItem[];
}
