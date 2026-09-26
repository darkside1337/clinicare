export interface Patient {
  id: string;
  name: string;
  dob: string; // DD/MM/YYYY
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

export interface Allergy {
  id: string;
  substance: string;
  severity: "severe" | "moderate" | "mild";
  reaction: string;
  recordedDate: string;
}

export interface Problem {
  id: string;
  condition: string;
  status: "active" | "resolved";
  onsetDate: string;
  resolvedDate?: string;
  notes?: string;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  doctorName: string;
  date: string; // DD/MM/YYYY
  time: string;
  type: "Scheduled" | "Walk-in";
  chiefComplaint: string;
  symptoms: string;
  observations: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  prescriptionId?: string;
}

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
  doctorName: string;
  date: string;
  items: PrescriptionItem[];
}

export interface Appointment {
  id: string;
  doctorName: string;
  scheduledAt: string; // DD/MM/YYYY HH:mm
  status: "scheduled" | "checked-in" | "completed" | "no-show" | "cancelled";
  isWalkIn: boolean;
  reason?: string;
}

export interface PatientRecord {
  patient: Patient;
  allergies: Allergy[];
  problems: Problem[];
  consultations: Consultation[];
  prescriptions: Prescription[];
  appointments: Appointment[];
}

export const MOCK_PATIENT_RECORD: PatientRecord = {
  patient: {
    id: "pat-84920",
    name: "Eleanor Vance-Croft",
    dob: "14/05/1972",
    age: 54,
    sex: "Female",
    phone: "+44 7700 900481",
    email: "e.vancecroft@domain.co.uk",
    address: "42 Highbury Terrace, London N5 1UP",
    registeredDate: "12/03/2019",
    emergencyContact: {
      name: "Marcus Vance",
      relationship: "Spouse",
      phone: "+44 7700 900892",
    },
  },
  allergies: [
    {
      id: "alg-1",
      substance: "Amoxicillin / Penicillins",
      severity: "severe",
      reaction: "Anaphylaxis, severe bronchospasm, urticaria (2016)",
      recordedDate: "12/03/2019",
    },
    {
      id: "alg-2",
      substance: "Bee Venom",
      severity: "severe",
      reaction: "Facial angioedema, carries EpiPen auto-injector 0.3mg",
      recordedDate: "04/09/2021",
    },
    {
      id: "alg-3",
      substance: "NSAIDs (Ibuprofen)",
      severity: "moderate",
      reaction: "Moderate epigastric pain, mild dyspnoea",
      recordedDate: "18/11/2022",
    },
  ],
  problems: [
    {
      id: "prb-1",
      condition: "Hypertension (Primary)",
      status: "active",
      onsetDate: "22/01/2021",
      notes: "Target BP < 135/85 mmHg. Monitored biannually.",
    },
    {
      id: "prb-2",
      condition: "Type 2 Diabetes Mellitus",
      status: "active",
      onsetDate: "15/09/2023",
      notes: "HbA1c last 48 mmol/mol (Nov 2025). Diet controlled with Metformin.",
    },
    {
      id: "prb-3",
      condition: "Mild Osteoarthritis (Right Knee)",
      status: "active",
      onsetDate: "03/06/2024",
      notes: "Physiotherapy completed. Topical treatments preferred over oral NSAIDs.",
    },
    {
      id: "prb-4",
      condition: "Acute Otitis Externa",
      status: "resolved",
      onsetDate: "10/08/2025",
      resolvedDate: "28/08/2025",
      notes: "Resolved post 7-day topical gentisone course.",
    },
  ],
  consultations: [
    {
      id: "cns-2026-03",
      appointmentId: "apt-2026-09",
      doctorName: "Dr. Alistair Finch",
      date: "18/09/2026",
      time: "10:15",
      type: "Scheduled",
      chiefComplaint: "Routine 6-month diabetic review & BP monitoring.",
      symptoms: "Patient reports feeling well generally. Mild fatigue in late afternoons. No polyuria or polydipsia.",
      observations: "BP 132/82 mmHg (Sitting, right arm). Pulse 72 bpm regular. BMI 26.4 kg/m². Feet sensation intact with 10g monofilament. Peripheral pulses palpable.",
      diagnosis: "Well-managed Type 2 Diabetes with controlled primary hypertension.",
      treatment: "Continue Metformin 500mg BD. Recheck HbA1c in 6 months. Maintain home blood pressure log.",
      prescriptionId: "rx-9841",
    },
    {
      id: "cns-2026-02",
      appointmentId: "apt-2026-04",
      doctorName: "Dr. Helen Rostova",
      date: "04/05/2026",
      time: "14:40",
      type: "Walk-in",
      chiefComplaint: "Acute productive cough and low-grade pyrexia for 4 days.",
      symptoms: "Thick yellow-green sputum, mild retrosternal chest soreness on deep inspiration. Temperature 37.8°C at home.",
      observations: "Chest: Bilateral coarse crackles at right lung base. SpO2 97% on room air. Resp rate 18/min. Throat clear, no cervical lymphadenopathy.",
      diagnosis: "Acute lower respiratory tract infection (Right basal bronchitis).",
      treatment: "Prescribed Doxycycline 100mg (Penicillin-allergic). Advised strict hydration, paracetamol for fever, return if dyspnoea increases.",
      prescriptionId: "rx-8412",
    },
    {
      id: "cns-2025-01",
      appointmentId: "apt-2025-11",
      doctorName: "Dr. Alistair Finch",
      date: "14/11/2025",
      time: "09:30",
      type: "Scheduled",
      chiefComplaint: "Annual cardiovascular review & right knee stiffness.",
      symptoms: "Knee stiffness in mornings lasting ~15 minutes, eases with gentle walking. No night pain.",
      observations: "BP 136/84 mmHg. Knee exam: Mild crepitus, no active joint effusion, range of movement 0-125°. Stability tests intact.",
      diagnosis: "Mild medial compartment right knee osteoarthritis; stable primary hypertension.",
      treatment: "Referral to Musculoskeletal Physiotherapy. Advised paracetamol 1g PRN; oral NSAIDs contraindicated given sensitivity history.",
    },
  ],
  prescriptions: [
    {
      id: "rx-9841",
      consultationId: "cns-2026-03",
      doctorName: "Dr. Alistair Finch",
      date: "18/09/2026",
      items: [
        {
          id: "rxi-1",
          medication: "Metformin Hydrochloride",
          dosage: "500 mg tablets",
          frequency: "Twice daily (with meals)",
          duration: "56 days (112 tablets)",
          instructions: "Take with or immediately after food to minimise gastrointestinal disturbance.",
        },
        {
          id: "rxi-2",
          medication: "Ramipril",
          dosage: "5 mg capsules",
          frequency: "Once daily (morning)",
          duration: "28 days (28 capsules)",
          instructions: "Take each morning. Report persistent dry cough if developed.",
        },
      ],
    },
    {
      id: "rx-8412",
      consultationId: "cns-2026-02",
      doctorName: "Dr. Helen Rostova",
      date: "04/05/2026",
      items: [
        {
          id: "rxi-3",
          medication: "Doxycycline",
          dosage: "100 mg capsules",
          frequency: "200 mg on day 1, then 100 mg daily",
          duration: "7 days (8 capsules)",
          instructions: "Take with a full glass of water whilst sitting or standing. Avoid taking at bedtime.",
        },
      ],
    },
  ],
  appointments: [
    {
      id: "apt-2026-10",
      doctorName: "Dr. Alistair Finch",
      scheduledAt: "15/10/2026 11:30",
      status: "scheduled",
      isWalkIn: false,
      reason: "Follow-up blood pressure check and blood test results",
    },
    {
      id: "apt-2026-09",
      doctorName: "Dr. Alistair Finch",
      scheduledAt: "18/09/2026 10:15",
      status: "completed",
      isWalkIn: false,
      reason: "6-month diabetic review & BP monitoring",
    },
    {
      id: "apt-2026-04",
      doctorName: "Dr. Helen Rostova",
      scheduledAt: "04/05/2026 14:40",
      status: "completed",
      isWalkIn: true,
      reason: "Walk-in: Acute chest cough & fever",
    },
  ],
};
