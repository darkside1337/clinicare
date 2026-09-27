import { useState, useCallback } from "react";
import type { AppointmentDetails } from "../queries";
import type { AppointmentStatus } from "../schema";
import { updateAppointmentStatusAction } from "@/app/(app)/appointments/actions";

interface UseOptimisticAppointmentsOptions {
  initialAppointments: AppointmentDetails[];
  onStatusChangeError?: (error: string) => void;
}

export function useOptimisticAppointments({
  initialAppointments,
  onStatusChangeError,
}: UseOptimisticAppointmentsOptions) {
  const [appointments, setAppointments] = useState<AppointmentDetails[]>(initialAppointments);
  const [prevInitial, setPrevInitial] = useState(initialAppointments);

  // Sync state if initialAppointments updates from server without cascading effects
  if (initialAppointments !== prevInitial) {
    setPrevInitial(initialAppointments);
    setAppointments(initialAppointments);
  }

  const updateStatus = useCallback(
    async (id: string, newStatus: AppointmentStatus) => {
      const target = appointments.find((a) => a.id === id);
      const previousStatus = target?.status;

      // Optimistic update
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );

      try {
        const result = await updateAppointmentStatusAction(id, newStatus);
        if (!result.success) {
          // Roll back on failure
          if (previousStatus) {
            setAppointments((prev) =>
              prev.map((a) => (a.id === id ? { ...a, status: previousStatus } : a))
            );
          }
          onStatusChangeError?.(result.error);
        }
      } catch (err) {
        if (previousStatus) {
          setAppointments((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status: previousStatus } : a))
          );
        }
        const msg = err instanceof Error ? err.message : "Failed to update appointment status.";
        onStatusChangeError?.(msg);
      }
    },
    [appointments, onStatusChangeError]
  );

  return {
    appointments,
    setAppointments,
    updateStatus,
  };
}
