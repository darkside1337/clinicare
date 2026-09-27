import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    color: "#141618",
  },
  headerBox: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#141618",
    paddingBottom: 10,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  clinicHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "70%",
  },
  clinicLogo: {
    width: 36,
    height: 36,
    marginRight: 10,
    objectFit: "contain",
  },
  clinicTitle: {
    fontSize: 13,
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
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 6,
    paddingRight: 6,
    alignItems: "center",
  },
  rxText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  patientBox: {
    borderWidth: 1,
    borderColor: "#141618",
    padding: 8,
    marginBottom: 14,
    backgroundColor: "#FAFAF7",
  },
  patientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  patientName: {
    fontSize: 11,
    fontWeight: "bold",
  },
  patientMeta: {
    fontSize: 8.5,
    color: "#5A5D61",
  },
  prescriptionBody: {
    borderWidth: 1,
    borderColor: "#141618",
    padding: 12,
    minHeight: 250,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 8.5,
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
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EFECE6",
  },
  medName: {
    fontSize: 10,
    fontWeight: "bold",
  },
  medDosage: {
    fontSize: 8.5,
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
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signBlock: {
    width: "48%",
  },
  signTitle: {
    fontSize: 7.5,
    color: "#5A5D61",
    textTransform: "uppercase",
    marginBottom: 18,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#141618",
    marginBottom: 4,
  },
  doctorText: {
    fontSize: 8.5,
    fontWeight: "bold",
  },
});

export interface PrescriptionPdfItem {
  id?: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
}

export interface PrescriptionPdfData {
  id: string;
  prescriptionNumber?: string;
  createdAt?: Date | string;
  issuedAt?: string;
  items?: PrescriptionPdfItem[];
}

export interface PrescriptionPdfProps {
  prescription: PrescriptionPdfData;
  patientName: string;
  patientDob: string;
  patientAge: number;
  patientAddress?: string | null;
  doctorName: string;
  clinicName: string;
  clinicAddress?: string | null;
  clinicLogoUrl?: string | null;
}

function formatDate(dateVal?: Date | string, fallback?: string): string {
  if (fallback) return fallback;
  if (!dateVal) return "";
  const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
  if (isNaN(d.getTime())) return String(dateVal);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function PrescriptionPdfDocument({
  prescription,
  patientName,
  patientDob,
  patientAge,
  patientAddress,
  doctorName,
  clinicName,
  clinicAddress,
  clinicLogoUrl,
}: PrescriptionPdfProps) {
  const items = prescription.items || [];
  const rxNumber =
    prescription.prescriptionNumber ||
    `RX-${prescription.id.slice(0, 8).toUpperCase()}`;
  const issueDate = formatDate(prescription.createdAt, prescription.issuedAt);

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* Practice Header */}
        <View style={styles.headerBox}>
          <View style={styles.clinicHeaderLeft}>
            {clinicLogoUrl && (
              /* eslint-disable-next-line jsx-a11y/alt-text */
              <Image src={clinicLogoUrl} style={styles.clinicLogo} />
            )}
            <View>
              <Text style={styles.clinicTitle}>{clinicName}</Text>
              {clinicAddress && (
                <Text style={styles.clinicSubtitle}>{clinicAddress}</Text>
              )}
              <Text style={styles.clinicSubtitle}>OUTPATIENT PRESCRIPTION ORDER</Text>
            </View>
          </View>
          <View style={styles.rxLabelBox}>
            <Text style={styles.rxText}>RX</Text>
            <Text style={{ fontSize: 7, color: "#5A5D61", marginTop: 1 }}>
              {rxNumber}
            </Text>
          </View>
        </View>

        {/* Patient Details */}
        <View style={styles.patientBox}>
          <View style={styles.patientRow}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientMeta}>Date: {issueDate}</Text>
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
              {item.instructions && (
                <Text style={styles.medInstructions}>
                  Instructions: {item.instructions}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Prescriber Signature & Date */}
        <View style={styles.footerSignBox}>
          <View style={styles.signBlock}>
            <Text style={styles.signTitle}>Prescriber Signature</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.doctorText}>{doctorName}</Text>
          </View>

          <View style={styles.signBlock}>
            <Text style={styles.signTitle}>Date</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.doctorText}>{issueDate}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default PrescriptionPdfDocument;
