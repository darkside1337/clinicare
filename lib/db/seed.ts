import { client, db } from "./client";
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
      id: "clinic-dev",
      name: "Apex Family Medicine",
      logoUrl: null,
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: clinics.id,
      set: { name: "Apex Family Medicine" },
    });

  // 2. Users (Doctor & Receptionist)
  console.log("Inserting staff users...");
  await db
    .insert(user)
    .values({
      id: "user-doctor-1",
      name: "Dr. Sarah Mitchell, MD",
      email: "doctor@clinicare.dev",
      emailVerified: true,
      clinicId: "clinic-dev",
      role: "doctor",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: user.id,
      set: {
        name: "Dr. Sarah Mitchell, MD",
        role: "doctor",
        clinicId: "clinic-dev",
      },
    });

  await db
    .insert(user)
    .values({
      id: "user-receptionist-1",
      name: "Alex Rivera",
      email: "receptionist@clinicare.dev",
      emailVerified: true,
      clinicId: "clinic-dev",
      role: "receptionist",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: user.id,
      set: {
        name: "Alex Rivera",
        role: "receptionist",
        clinicId: "clinic-dev",
      },
    });

  // 3. Patients
  console.log("Inserting patients...");
  await db
    .insert(patients)
    .values([
      {
        id: "patient-1",
        clinicId: "clinic-dev",
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
        clinicId: "clinic-dev",
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
        clinicId: "clinic-dev",
        name: "Chloe Zhao",
        dob: "2001-12-05",
        sex: "Female",
        phone: "+1 (555) 345-6789",
        email: "chloe.zhao@example.com",
        address: "245 Market St, San Francisco, CA",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    .onConflictDoNothing({ target: patients.id });

  // 4. Allergies
  console.log("Inserting allergies...");
  await db
    .insert(allergies)
    .values([
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
    ])
    .onConflictDoNothing({ target: allergies.id });

  // 5. Problems
  console.log("Inserting problems...");
  await db
    .insert(problems)
    .values([
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
    ])
    .onConflictDoNothing({ target: problems.id });

  // 6. Appointments
  console.log("Inserting appointments...");
  const now = Date.now();
  await db
    .insert(appointments)
    .values([
      {
        id: "appt-1",
        clinicId: "clinic-dev",
        patientId: "patient-1",
        doctorId: "user-doctor-1",
        scheduledAt: new Date(now + 2 * 3600 * 1000), // in 2 hours
        status: "scheduled",
        isWalkIn: false,
        reason: "Routine hypertension follow-up and blood pressure check",
      },
      {
        id: "appt-2",
        clinicId: "clinic-dev",
        patientId: "patient-2",
        doctorId: "user-doctor-1",
        scheduledAt: new Date(now - 30 * 60 * 1000), // 30 mins ago
        status: "checked-in",
        isWalkIn: false,
        reason: "Quarterly HbA1c review and medication renewal",
      },
      {
        id: "appt-3",
        clinicId: "clinic-dev",
        patientId: "patient-3",
        doctorId: "user-doctor-1",
        scheduledAt: new Date(now), // current walk-in
        status: "checked-in",
        isWalkIn: true,
        reason: "Acute shortness of breath following exercise (walk-in)",
      },
      {
        id: "appt-4",
        clinicId: "clinic-dev",
        patientId: "patient-1",
        doctorId: "user-doctor-1",
        scheduledAt: new Date(now - 7 * 24 * 3600 * 1000), // 7 days ago
        status: "completed",
        isWalkIn: false,
        reason: "Initial consultation for elevated home blood pressure readings",
      },
      {
        id: "appt-5",
        clinicId: "clinic-dev",
        patientId: "patient-2",
        doctorId: "user-doctor-1",
        scheduledAt: new Date(now - 14 * 24 * 3600 * 1000), // 14 days ago
        status: "no-show",
        isWalkIn: false,
        reason: "Follow-up foot exam",
      },
    ])
    .onConflictDoNothing({ target: appointments.id });

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
