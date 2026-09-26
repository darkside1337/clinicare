import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Prescription } from "@/lib/mock-consultations";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    color: "#141618",
  },
  headerBox: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#141618",
    paddingBottom: 10,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  clinicTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  clinicSubtitle: {
    fontSize: 8,
    color: "#5A5D61",
    marginTop: 2,
  },
  rxLabelBox: {
    borderWidth: 1,
    borderColor: "#141618",
    padding: "4 8",
    alignItems: "center",
  },
  rxText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  patientBox: {
    borderWidth: 1,
    borderColor: "#141618",
    padding: 10,
    marginBottom: 16,
    backgroundColor: "#FAFAF7",
  },
  patientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  patientName: {
    fontSize: 12,
    fontWeight: "bold",
  },
  patientMeta: {
    fontSize: 9,
    color: "#5A5D61",
  },
  prescriptionBody: {
    borderWidth: 1,
    borderColor: "#141618",
    padding: 14,
    minHeight: 260,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#5A5D61",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#D8D4CC",
    paddingBottom: 4,
  },
  medicationRow: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EFECE6",
  },
  medName: {
    fontSize: 11,
    fontWeight: "bold",
  },
  medDosage: {
    fontSize: 9,
    marginTop: 2,
  },
  medInstructions: {
    fontSize: 8,
    color: "#5A5D61",
    marginTop: 2,
    fontStyle: "italic",
  },
  footerSignBox: {
    borderTopWidth: 1.5,
    borderTopColor: "#141618",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signBlock: {
    width: "48%",
  },
  signTitle: {
    fontSize: 8,
    color: "#5A5D61",
    textTransform: "uppercase",
    marginBottom: 20,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#141618",
    marginBottom: 4,
  },
  doctorText: {
    fontSize: 9,
    fontWeight: "bold",
  },
});

export interface PrescriptionPdfProps {
  prescription: Prescription;
  patientName: string;
  patientDob: string;
  patientAge: number;
  patientAddress?: string;
  doctorName: string;
  clinicName: string;
  clinicAddress?: string;
}

export default function PrescriptionPdfDocument({
  prescription,
  patientName,
  patientDob,
  patientAge,
  patientAddress,
  doctorName,
  clinicName,
  clinicAddress,
}: PrescriptionPdfProps) {
  const items = prescription.items || [];

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* Practice Header */}
        <View style={styles.headerBox}>
          <View>
            <Text style={styles.clinicTitle}>{clinicName}</Text>
            {clinicAddress && <Text style={styles.clinicSubtitle}>{clinicAddress}</Text>}
            <Text style={styles.clinicSubtitle}>OUTPATIENT PRESCRIPTION ORDER</Text>
          </View>
          <View style={styles.rxLabelBox}>
            <Text style={styles.rxText}>RX</Text>
            <Text style={{ fontSize: 7, color: "#5A5D61", marginTop: 1 }}>
              {prescription.prescriptionNumber || "RECORD"}
            </Text>
          </View>
        </View>

        {/* Patient Details */}
        <View style={styles.patientBox}>
          <View style={styles.patientRow}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientMeta}>Date: {prescription.issuedAt}</Text>
          </View>
          <View style={styles.patientRow}>
            <Text style={styles.patientMeta}>
              DOB: {patientDob} ({patientAge} years)
            </Text>
            <Text style={styles.patientMeta}>Ref: {prescription.id}</Text>
          </View>
          {patientAddress && (
            <Text style={{ fontSize: 8, color: "#5A5D61", marginTop: 2 }}>
              Address: {patientAddress}
            </Text>
          )}
        </View>

        {/* Prescription Items Body */}
        <View style={styles.prescriptionBody}>
          <Text style={styles.sectionTitle}>Prescribed Items (Dispense as Directed)</Text>

          {items.map((item, idx) => (
            <View key={item.id || idx} style={styles.medicationRow}>
              <Text style={styles.medName}>
                {idx + 1}. {item.medication}
              </Text>
              <Text style={styles.medDosage}>
                Dosage: {item.dosage} • Frequency: {item.frequency} • Duration: {item.duration}
              </Text>
              <Text style={styles.medInstructions}>Instructions: {item.instructions}</Text>
            </View>
          ))}
        </View>

        {/* Doctor Signature & Dispensing Stamp */}
        <View style={styles.footerSignBox}>
          <View style={styles.signBlock}>
            <Text style={styles.signTitle}>Prescriber Signature</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.doctorText}>{doctorName}</Text>
            <Text style={{ fontSize: 8, color: "#5A5D61" }}>Authorized Medical Practitioner</Text>
          </View>

          <View style={styles.signBlock}>
            <Text style={styles.signTitle}>Dispensing Pharmacy Verification</Text>
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 8, color: "#5A5D61", marginTop: 2 }}>
              Date &amp; Signature
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
