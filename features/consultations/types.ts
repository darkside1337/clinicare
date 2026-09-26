export interface ConsultationPrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ConsultationPrescription {
  id: string;
  consultationId: string;
  prescriptionNumber: string;
  issuedAt: string;
  items: ConsultationPrescriptionItem[];
}

export interface ClinicalConsultationDetail {
  id: string;
  reference: string;
  patientId: string;
  patientName: string;
  patientDob: string;
  patientAge: number;
  patientSex: "Male" | "Female" | "Other";
  patientContact: {
    phone: string;
    email: string;
    address: string;
  };
  doctorName: string;
  clinicName: string;
  clinicAddress: string;
  consultationDate: string;
  time: string;
  encounterType: "Scheduled" | "Walk-In";
  chiefComplaint: string;
  symptoms: string;
  observations: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  prescriptions: ConsultationPrescription[];
}
