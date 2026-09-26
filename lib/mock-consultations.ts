export interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  consultationId: string;
  prescriptionNumber: string; // e.g. "RX-2026-9841"
  issuedAt: string;
  items: PrescriptionItem[];
}

export interface ClinicalConsultationDetail {
  id: string;
  reference: string; // e.g. "CNS-2026-03"
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
  observations: string; // free text per PRD §8.6
  diagnosis: string;
  treatment: string; // free text per PRD §8.6
  notes: string; // free text per PRD §8.6
  prescriptions: Prescription[]; // multiple prescriptions per consultation per PRD §8.7
}

export const MOCK_CONSULTATION_DETAILS: Record<string, ClinicalConsultationDetail> = {
  "cns-2026-03": {
    id: "cns-2026-03",
    reference: "CNS-2026-03",
    patientId: "pat-84920",
    patientName: "Eleanor Vance-Croft",
    patientDob: "14/08/1972",
    patientAge: 54,
    patientSex: "Female",
    patientContact: {
      phone: "+44 7700 900481",
      email: "e.vancecroft@domain.co.uk",
      address: "42 Highbury Terrace, London N5 1UP",
    },
    doctorName: "Dr. Alistair Finch",
    clinicName: "CliniCare Medical Practice",
    clinicAddress: "18-20 Highbury Park, London N5 2AB • Tel: 020 7946 0192",
    consultationDate: "12/09/2026",
    time: "10:15",
    encounterType: "Scheduled",
    chiefComplaint: "Routine follow-up blood pressure review and mild exertional breathlessness.",
    symptoms:
      "Patient reports feeling generally well but notes occasional mild shortness of breath when climbing two flights of stairs at work. Denies chest pain, orthopnea, or paroxysmal nocturnal dyspnea. Adherence to Ramipril 5mg daily confirmed.",
    observations:
      "Blood pressure 132/84 mmHg, sitting right arm. Heart rate 68 bpm regular. SpO2 98% on room air. Temp 36.6 C. BMI 24.8 kg/m2. Chest clear to auscultation bilaterally with good vesicular air entry, no wheezes or crackles. Heart sounds dual, no murmurs. No peripheral edema.",
    diagnosis: "Primary essential hypertension (well controlled) and mild exercise-induced bronchospasm.",
    treatment:
      "Continue Ramipril 5mg once daily in the morning. Initiate trial of Salbutamol 100mcg inhaler (1-2 puffs PRN before strenuous exertion). Advised on warning signs and when to seek urgent care. Routine renal function tests scheduled in 6 months.",
    notes:
      "Patient counseled on inhaler technique and lifestyle measures. Follow-up consultation scheduled in 6 months or sooner if symptoms escalate.",
    prescriptions: [
      {
        id: "rx-9841",
        consultationId: "cns-2026-03",
        prescriptionNumber: "RX-2026-9841",
        issuedAt: "12/09/2026",
        items: [
          {
            id: "item-01",
            medication: "Ramipril 5mg Tablets",
            dosage: "5mg",
            frequency: "Once daily in the morning",
            duration: "28 days",
            instructions: "Take one tablet each morning with water. Regular renal monitoring applies.",
          },
        ],
      },
      {
        id: "rx-9842",
        consultationId: "cns-2026-03",
        prescriptionNumber: "RX-2026-9842",
        issuedAt: "12/09/2026",
        items: [
          {
            id: "item-02",
            medication: "Salbutamol 100mcg Inhaler",
            dosage: "100 micrograms/puff",
            frequency: "1-2 puffs as needed",
            duration: "As directed (PRN)",
            instructions: "Inhale 1 or 2 puffs before strenuous exertion. Rinse mouth after use.",
          },
        ],
      },
    ],
  },
};
