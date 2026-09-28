import { client, db } from "./client";
import { DEMO_CLINIC_ID } from "../auth/demo-personas";
import {
  clinics,
  user,
  patients,
  allergies,
  problems,
  appointments,
} from "./schema";

export async function seed() {
  console.log("🌱 Starting database seed...");

  // 1. Clinic
  console.log("Inserting clinic 'clinic-dev'...");
  await db
    .insert(clinics)
    .values({
      id: DEMO_CLINIC_ID,
      name: "Apex Family Medicine",
      logoUrl: null,
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: clinics.id,
      set: { name: "Apex Family Medicine" },
    });

  // 2. Staff Users (Doctors & Receptionist)
  console.log("Inserting staff users...");
  const staffMembers = [
    {
      id: "user-doctor-1",
      name: "Dr. Sarah Mitchell, MD",
      email: "doctor@clinicare.dev",
      role: "doctor",
    },
    {
      id: "user-receptionist-1",
      name: "Alex Rivera",
      email: "receptionist@clinicare.dev",
      role: "receptionist",
    },
    {
      id: "doc-finch",
      name: "Dr. Alistair Finch",
      email: "finch@clinicare.dev",
      role: "doctor",
    },
    {
      id: "doc-rostova",
      name: "Dr. Helen Rostova",
      email: "rostova@clinicare.dev",
      role: "doctor",
    },
    {
      id: "doc-brody",
      name: "Dr. Marcus Brody",
      email: "brody@clinicare.dev",
      role: "doctor",
    },
  ];

  for (const staff of staffMembers) {
    await db
      .insert(user)
      .values({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        emailVerified: true,
        clinicId: DEMO_CLINIC_ID,
        role: staff.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: user.id,
        set: {
          name: staff.name,
          role: staff.role,
          clinicId: DEMO_CLINIC_ID,
        },
      });
  }

  // 3. Patients
  console.log("Inserting patients...");
  const patientList = [
    // Baseline test patients
    {
      id: "patient-1",
      clinicId: DEMO_CLINIC_ID,
      name: "Eleanor Vance",
      dob: "1988-04-12",
      sex: "Female",
      phone: "+1 (555) 234-5678",
      email: "eleanor.vance@example.com",
      address: "742 Evergreen Terrace, Springfield",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "patient-2",
      clinicId: DEMO_CLINIC_ID,
      name: "Marcus Holloway",
      dob: "1975-09-28",
      sex: "Male",
      phone: "+1 (555) 876-5432",
      email: "marcus.holloway@example.com",
      address: "10880 Wilshire Blvd, Los Angeles, CA",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "patient-3",
      clinicId: DEMO_CLINIC_ID,
      name: "Chloe Zhao",
      dob: "2001-12-05",
      sex: "Female",
      phone: "+1 (555) 345-6789",
      email: "chloe.zhao@example.com",
      address: "245 Market St, San Francisco, CA",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Mock patient directory records
    {
      id: "pat-84920",
      clinicId: DEMO_CLINIC_ID,
      name: "Eleanor Vance-Croft",
      dob: "1972-08-14",
      sex: "Female",
      phone: "+44 7700 900142",
      email: "e.vancecroft@domain.co.uk",
      address: "42 Highbury Terrace, London N5 1UP",
      createdAt: new Date("2019-03-12"),
      updatedAt: new Date(),
    },
    {
      id: "pat-93821",
      clinicId: DEMO_CLINIC_ID,
      name: "Arthur Pendelton",
      dob: "1959-11-03",
      sex: "Male",
      phone: "+44 7700 900289",
      email: "a.pendelton@domain.co.uk",
      address: "12 Oxford Gardens, London W10 5UA",
      createdAt: new Date("2020-01-10"),
      updatedAt: new Date(),
    },
    {
      id: "pat-91024",
      clinicId: DEMO_CLINIC_ID,
      name: "Arthur Pendelton",
      dob: "1958-11-22",
      sex: "Male",
      phone: "+44 7700 900289",
      email: "a.pendelton@domain.co.uk",
      address: "12 Oxford Gardens, London W10 5UA",
      createdAt: new Date("2020-01-10"),
      updatedAt: new Date(),
    },
    {
      id: "pat-48201",
      clinicId: DEMO_CLINIC_ID,
      name: "Chloe Sterling",
      dob: "1995-05-22",
      sex: "Female",
      phone: "+44 7700 900512",
      email: "c.sterling@domain.co.uk",
      address: "78 Kensington Church St, London W8 4DB",
      createdAt: new Date("2021-06-15"),
      updatedAt: new Date(),
    },
    {
      id: "pat-38291",
      clinicId: DEMO_CLINIC_ID,
      name: "Chloe Sterling",
      dob: "1995-08-03",
      sex: "Female",
      phone: "+44 7700 900512",
      email: "c.sterling@domain.co.uk",
      address: "78 Kensington Church St, London W8 4DB",
      createdAt: new Date("2021-06-15"),
      updatedAt: new Date(),
    },
    {
      id: "pat-77402",
      clinicId: DEMO_CLINIC_ID,
      name: "David O'Connor",
      dob: "1983-02-19",
      sex: "Male",
      phone: "+44 7700 900673",
      email: "d.oconnor@domain.co.uk",
      address: "15 Camden High St, London NW1 7JE",
      createdAt: new Date("2022-04-20"),
      updatedAt: new Date(),
    },
    {
      id: "pat-19842",
      clinicId: DEMO_CLINIC_ID,
      name: "Grace Holloway",
      dob: "2001-07-30",
      sex: "Female",
      phone: "+44 7700 900891",
      email: "g.holloway@domain.co.uk",
      address: "33 Richmond Hill, Richmond TW10 6RE",
      createdAt: new Date("2022-08-01"),
      updatedAt: new Date(),
    },
    {
      id: "pat-50291",
      clinicId: DEMO_CLINIC_ID,
      name: "Benjamin Miller",
      dob: "1964-04-12",
      sex: "Male",
      phone: "+44 7700 900334",
      email: "b.miller@domain.co.uk",
      address: "9 Islington Green, London N1 2XH",
      createdAt: new Date("2023-02-14"),
      updatedAt: new Date(),
    },
    {
      id: "pat-66382",
      clinicId: DEMO_CLINIC_ID,
      name: "Sophia Zhang",
      dob: "1990-10-09",
      sex: "Female",
      phone: "+44 7700 900445",
      email: "s.zhang@domain.co.uk",
      address: "50 Greenwich South St, London SE10 8UN",
      createdAt: new Date("2023-05-18"),
      updatedAt: new Date(),
    },
    {
      id: "pat-39281",
      clinicId: DEMO_CLINIC_ID,
      name: "George MacIntyre",
      dob: "1949-03-18",
      sex: "Male",
      phone: "+44 7700 900982",
      email: "g.macintyre@domain.co.uk",
      address: "8 Hampstead High St, London NW3 1PR",
      createdAt: new Date("2023-09-09"),
      updatedAt: new Date(),
    },
    {
      id: "pat-44910",
      clinicId: DEMO_CLINIC_ID,
      name: "George MacIntyre",
      dob: "1949-01-05",
      sex: "Male",
      phone: "+44 7700 900982",
      email: "g.macintyre@domain.co.uk",
      address: "8 Hampstead High St, London NW3 1PR",
      createdAt: new Date("2023-09-09"),
      updatedAt: new Date(),
    },
    {
      id: "pat-92841",
      clinicId: DEMO_CLINIC_ID,
      name: "Fiona Gallagher",
      dob: "1988-12-05",
      sex: "Female",
      phone: "+44 7700 900721",
      email: "f.gallagher@domain.co.uk",
      address: "22 Battersea Park Rd, London SW11 4HY",
      createdAt: new Date("2024-01-11"),
      updatedAt: new Date(),
    },
    {
      id: "pat-12093",
      clinicId: DEMO_CLINIC_ID,
      name: "Fatima Al-Mansoor",
      dob: "1988-06-18",
      sex: "Female",
      phone: "+44 7700 900999",
      email: "f.almansoor@domain.co.uk",
      address: "14 Queensway, London W2 3RX",
      createdAt: new Date("2024-03-01"),
      updatedAt: new Date(),
    },
  ];

  for (const p of patientList) {
    await db
      .insert(patients)
      .values(p)
      .onConflictDoUpdate({
        target: patients.id,
        set: {
          name: p.name,
          dob: p.dob,
          sex: p.sex,
          phone: p.phone,
          email: p.email,
          address: p.address,
        },
      });
  }

  // 4. Allergies
  console.log("Inserting allergies...");
  const allergyList: (typeof allergies.$inferInsert)[] = [
    {
      id: "allergy-1",
      patientId: "patient-1",
      substance: "Penicillin",
      severity: "severe",
      reaction: "Anaphylaxis, diffuse hives, wheezing",
    },
    {
      id: "allergy-2",
      patientId: "patient-1",
      substance: "Latex",
      severity: "mild",
      reaction: "Localized contact dermatitis and erythema",
    },
    {
      id: "allergy-3",
      patientId: "patient-2",
      substance: "Sulfa drugs",
      severity: "moderate",
      reaction: "Maculopapular rash, pruritus",
    },
    // Allergies for mock directory patients
    {
      id: "alg-1",
      patientId: "pat-84920",
      substance: "Amoxicillin / Penicillins",
      severity: "severe",
      reaction: "Anaphylaxis, severe bronchospasm, urticaria (2016)",
    },
    {
      id: "alg-2",
      patientId: "pat-84920",
      substance: "Bee Venom",
      severity: "severe",
      reaction: "Facial angioedema, carries EpiPen auto-injector 0.3mg",
    },
    {
      id: "alg-3",
      patientId: "pat-84920",
      substance: "NSAIDs (Ibuprofen)",
      severity: "moderate",
      reaction: "Moderate epigastric pain, mild dyspnoea",
    },
    {
      id: "alg-4",
      patientId: "pat-77402",
      substance: "Aspirin & NSAIDs",
      severity: "severe",
      reaction: "Bronchospasm",
    },
    {
      id: "alg-5",
      patientId: "pat-66382",
      substance: "Latex",
      severity: "moderate",
      reaction: "Contact Dermatitis",
    },
    {
      id: "alg-6",
      patientId: "pat-39281",
      substance: "Codeine Phosphate",
      severity: "severe",
      reaction: "Nausea & Rash",
    },
    {
      id: "alg-7",
      patientId: "pat-44910",
      substance: "Codeine Phosphate",
      severity: "severe",
      reaction: "Nausea & Rash",
    },
  ];

  for (const a of allergyList) {
    await db
      .insert(allergies)
      .values(a)
      .onConflictDoUpdate({
        target: allergies.id,
        set: {
          substance: a.substance,
          severity: a.severity,
          reaction: a.reaction,
        },
      });
  }

  // 5. Problems
  console.log("Inserting problems...");
  const problemList: (typeof problems.$inferInsert)[] = [
    {
      id: "problem-1",
      patientId: "patient-1",
      condition: "Essential Hypertension (Stage 1)",
      status: "active",
      onsetDate: "2022-01-15",
    },
    {
      id: "problem-2",
      patientId: "patient-1",
      condition: "Acute Sinusitis",
      status: "resolved",
      onsetDate: "2023-11-02",
    },
    {
      id: "problem-3",
      patientId: "patient-2",
      condition: "Type 2 Diabetes Mellitus",
      status: "active",
      onsetDate: "2019-06-10",
    },
    {
      id: "problem-4",
      patientId: "patient-2",
      condition: "Dyslipidemia",
      status: "active",
      onsetDate: "2020-03-22",
    },
    {
      id: "problem-5",
      patientId: "patient-3",
      condition: "Exercise-Induced Asthma",
      status: "active",
      onsetDate: "2015-08-14",
    },
    // Problems for mock directory patients
    {
      id: "prb-1",
      patientId: "pat-84920",
      condition: "Hypertension (Primary)",
      status: "active",
      onsetDate: "2021-01-22",
    },
    {
      id: "prb-2",
      patientId: "pat-84920",
      condition: "Type 2 Diabetes Mellitus",
      status: "active",
      onsetDate: "2023-09-15",
    },
    {
      id: "prb-3",
      patientId: "pat-84920",
      condition: "Mild Osteoarthritis (Right Knee)",
      status: "active",
      onsetDate: "2024-06-03",
    },
    {
      id: "prb-4",
      patientId: "pat-84920",
      condition: "Acute Otitis Externa",
      status: "resolved",
      onsetDate: "2025-08-10",
    },
    {
      id: "prb-5",
      patientId: "pat-93821",
      condition: "Post-Op Knee Recovery",
      status: "active",
      onsetDate: "2026-08-15",
    },
    {
      id: "prb-6",
      patientId: "pat-93821",
      condition: "Osteoarthritis",
      status: "active",
      onsetDate: "2020-04-10",
    },
    {
      id: "prb-7",
      patientId: "pat-48201",
      condition: "Acute Right Wrist Sprain",
      status: "active",
      onsetDate: "2026-09-20",
    },
    {
      id: "prb-8",
      patientId: "pat-77402",
      condition: "Chronic Asthma",
      status: "active",
      onsetDate: "2010-05-12",
    },
    {
      id: "prb-9",
      patientId: "pat-77402",
      condition: "Eczema",
      status: "active",
      onsetDate: "2015-02-18",
    },
    {
      id: "prb-10",
      patientId: "pat-19842",
      condition: "Migraine with Aura",
      status: "active",
      onsetDate: "2022-11-04",
    },
    {
      id: "prb-11",
      patientId: "pat-50291",
      condition: "Hypercholesterolemia",
      status: "active",
      onsetDate: "2018-07-29",
    },
    {
      id: "prb-12",
      patientId: "pat-66382",
      condition: "Benign Skin Lesion",
      status: "active",
      onsetDate: "2026-08-01",
    },
    {
      id: "prb-13",
      patientId: "pat-39281",
      condition: "Osteoarthritis",
      status: "active",
      onsetDate: "2014-03-10",
    },
    {
      id: "prb-14",
      patientId: "pat-39281",
      condition: "Chronic Back Pain",
      status: "active",
      onsetDate: "2016-09-18",
    },
    {
      id: "prb-15",
      patientId: "pat-92841",
      condition: "Type 2 Diabetes Mellitus",
      status: "active",
      onsetDate: "2021-05-14",
    },
  ];

  for (const pr of problemList) {
    await db
      .insert(problems)
      .values(pr)
      .onConflictDoUpdate({
        target: problems.id,
        set: {
          condition: pr.condition,
          status: pr.status,
          onsetDate: pr.onsetDate,
        },
      });
  }

  // 6. Appointments
  console.log("Inserting appointments...");
  const now = Date.now();
  const today = new Date();
  const atToday = (hours: number, minutes: number) => {
    const d = new Date(today);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const appointmentList: (typeof appointments.$inferInsert)[] = [
    // Baseline test appointments
    {
      id: "appt-1",
      clinicId: DEMO_CLINIC_ID,
      patientId: "patient-1",
      doctorId: "user-doctor-1",
      scheduledAt: new Date(now + 2 * 3600 * 1000), // in 2 hours
      status: "scheduled",
      isWalkIn: false,
      reason: "Routine hypertension follow-up and blood pressure check",
    },
    {
      id: "appt-2",
      clinicId: DEMO_CLINIC_ID,
      patientId: "patient-2",
      doctorId: "user-doctor-1",
      scheduledAt: new Date(now - 30 * 60 * 1000), // 30 mins ago
      status: "checked-in",
      isWalkIn: false,
      reason: "Quarterly HbA1c review and medication renewal",
    },
    {
      id: "appt-3",
      clinicId: DEMO_CLINIC_ID,
      patientId: "patient-3",
      doctorId: "user-doctor-1",
      scheduledAt: new Date(now), // current walk-in
      status: "checked-in",
      isWalkIn: true,
      reason: "Acute shortness of breath following exercise (walk-in)",
    },
    {
      id: "appt-4",
      clinicId: DEMO_CLINIC_ID,
      patientId: "patient-1",
      doctorId: "user-doctor-1",
      scheduledAt: new Date(now - 7 * 24 * 3600 * 1000), // 7 days ago
      status: "completed",
      isWalkIn: false,
      reason: "Initial consultation for elevated home blood pressure readings",
    },
    {
      id: "appt-5",
      clinicId: DEMO_CLINIC_ID,
      patientId: "patient-2",
      doctorId: "user-doctor-1",
      scheduledAt: new Date(now - 14 * 24 * 3600 * 1000), // 14 days ago
      status: "no-show",
      isWalkIn: false,
      reason: "Follow-up foot exam",
    },

    // Today's clinic schedule appointments
    {
      id: "apt-today-01",
      clinicId: DEMO_CLINIC_ID,
      patientId: "pat-84920",
      doctorId: "doc-finch",
      scheduledAt: atToday(9, 0),
      status: "checked-in",
      isWalkIn: false,
      reason: "Hypertension 6-month blood pressure review",
    },
    {
      id: "apt-today-02",
      clinicId: DEMO_CLINIC_ID,
      patientId: "pat-48201",
      doctorId: "doc-finch",
      scheduledAt: atToday(9, 30),
      status: "checked-in",
      isWalkIn: true,
      reason: "Walk-in: Acute right wrist sprain post-fall",
    },
    {
      id: "apt-today-03",
      clinicId: DEMO_CLINIC_ID,
      patientId: "pat-93821",
      doctorId: "doc-rostova",
      scheduledAt: atToday(9, 0),
      status: "completed",
      isWalkIn: false,
      reason: "Post-operative knee suture removal & wound check",
    },
    {
      id: "apt-today-04",
      clinicId: DEMO_CLINIC_ID,
      patientId: "pat-77402",
      doctorId: "doc-finch",
      scheduledAt: atToday(10, 30),
      status: "scheduled",
      isWalkIn: false,
      reason: "Asthma annual management plan & inhaler review",
    },
    {
      id: "apt-today-05",
      clinicId: DEMO_CLINIC_ID,
      patientId: "pat-19842",
      doctorId: "doc-rostova",
      scheduledAt: atToday(10, 0),
      status: "scheduled",
      isWalkIn: false,
      reason: "Recurrent migraine symptoms review",
    },
    {
      id: "apt-today-06",
      clinicId: DEMO_CLINIC_ID,
      patientId: "pat-50291",
      doctorId: "doc-brody",
      scheduledAt: atToday(9, 30),
      status: "no-show",
      isWalkIn: false,
      reason: "Routine cholesterol blood test follow-up",
    },
    {
      id: "apt-today-07",
      clinicId: DEMO_CLINIC_ID,
      patientId: "pat-66382",
      doctorId: "doc-finch",
      scheduledAt: atToday(11, 30),
      status: "scheduled",
      isWalkIn: false,
      reason: "Skin lesion check (right forearm)",
    },
    {
      id: "apt-today-08",
      clinicId: DEMO_CLINIC_ID,
      patientId: "pat-39281",
      doctorId: "doc-rostova",
      scheduledAt: atToday(11, 0),
      status: "scheduled",
      isWalkIn: false,
      reason: "Chronic osteoarthritis analgesia review",
    },
    {
      id: "apt-today-09",
      clinicId: DEMO_CLINIC_ID,
      patientId: "pat-92841",
      doctorId: "doc-brody",
      scheduledAt: atToday(10, 30),
      status: "scheduled",
      isWalkIn: false,
      reason: "Type 2 Diabetes HbA1c routine review",
    },
    {
      id: "apt-today-10",
      clinicId: DEMO_CLINIC_ID,
      patientId: "pat-84920",
      doctorId: "doc-finch",
      scheduledAt: atToday(14, 30),
      status: "scheduled",
      isWalkIn: false,
      reason: "Follow-up blood test interpretation",
    },
  ];

  for (const apt of appointmentList) {
    await db
      .insert(appointments)
      .values(apt)
      .onConflictDoUpdate({
        target: appointments.id,
        set: {
          doctorId: apt.doctorId,
          scheduledAt: apt.scheduledAt,
          status: apt.status,
          isWalkIn: apt.isWalkIn,
          reason: apt.reason,
        },
      });
  }

  console.log("✅ Seed completed successfully!");
}

if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  seed()
    .then(async () => {
      await client.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("❌ Seed failed:", err);
      await client.end();
      process.exit(1);
    });
}
