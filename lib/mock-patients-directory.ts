export interface SearchPatient {
  id: string;
  name: string;
  dob: string;
  age: number;
  sex: "Female" | "Male" | "Other";
  phone: string;
  email?: string;
  hasSevereAllergy: boolean;
  allergySummary?: string;
  activeConditions: string[];
  lastSeen: string;
}

export const MOCK_SEARCH_PATIENTS: SearchPatient[] = [
  {
    id: "pat-84920",
    name: "Eleanor Vance-Croft",
    dob: "14/08/1972",
    age: 54,
    sex: "Female",
    phone: "+44 7700 900142",
    email: "e.vancecroft@domain.co.uk",
    hasSevereAllergy: true,
    allergySummary: "Penicillin V (Anaphylaxis)",
    activeConditions: ["Essential Hypertension", "Mild Asthma"],
    lastSeen: "Today, 09:00",
  },
  {
    id: "pat-93821",
    name: "Arthur Pendelton",
    dob: "03/11/1959",
    age: 67,
    sex: "Male",
    phone: "+44 7700 900289",
    email: "a.pendelton@domain.co.uk",
    hasSevereAllergy: false,
    activeConditions: ["Post-Op Knee Recovery", "Osteoarthritis"],
    lastSeen: "Today, 09:20",
  },
  {
    id: "pat-48201",
    name: "Chloe Sterling",
    dob: "22/05/1995",
    age: 31,
    sex: "Female",
    phone: "+44 7700 900512",
    email: "c.sterling@domain.co.uk",
    hasSevereAllergy: false,
    activeConditions: ["Acute Right Wrist Sprain"],
    lastSeen: "Today, 09:40",
  },
  {
    id: "pat-77402",
    name: "David O'Connor",
    dob: "19/02/1983",
    age: 43,
    sex: "Male",
    phone: "+44 7700 900673",
    email: "d.oconnor@domain.co.uk",
    hasSevereAllergy: true,
    allergySummary: "Aspirin & NSAIDs (Bronchospasm)",
    activeConditions: ["Chronic Asthma", "Eczema"],
    lastSeen: "Today, 10:15",
  },
  {
    id: "pat-19842",
    name: "Grace Holloway",
    dob: "30/07/2001",
    age: 25,
    sex: "Female",
    phone: "+44 7700 900891",
    email: "g.holloway@domain.co.uk",
    hasSevereAllergy: false,
    activeConditions: ["Migraine with Aura"],
    lastSeen: "Today, 10:45",
  },
  {
    id: "pat-50291",
    name: "Benjamin Miller",
    dob: "12/04/1964",
    age: 62,
    sex: "Male",
    phone: "+44 7700 900334",
    email: "b.miller@domain.co.uk",
    hasSevereAllergy: false,
    activeConditions: ["Hypercholesterolemia"],
    lastSeen: "18/09/2026",
  },
  {
    id: "pat-66382",
    name: "Sophia Zhang",
    dob: "09/10/1990",
    age: 35,
    sex: "Female",
    phone: "+44 7700 900445",
    email: "s.zhang@domain.co.uk",
    hasSevereAllergy: true,
    allergySummary: "Latex (Contact Dermatitis)",
    activeConditions: ["Benign Skin Lesion"],
    lastSeen: "12/09/2026",
  },
  {
    id: "pat-39281",
    name: "George MacIntyre",
    dob: "18/03/1949",
    age: 77,
    sex: "Male",
    phone: "+44 7700 900982",
    email: "g.macintyre@domain.co.uk",
    hasSevereAllergy: true,
    allergySummary: "Codeine Phosphate (Nausea & Rash)",
    activeConditions: ["Osteoarthritis", "Chronic Back Pain"],
    lastSeen: "Yesterday, 16:15",
  },
  {
    id: "pat-92841",
    name: "Fiona Gallagher",
    dob: "05/12/1988",
    age: 38,
    sex: "Female",
    phone: "+44 7700 900721",
    email: "f.gallagher@domain.co.uk",
    hasSevereAllergy: false,
    activeConditions: ["Type 2 Diabetes Mellitus"],
    lastSeen: "21/09/2026",
  },
];
