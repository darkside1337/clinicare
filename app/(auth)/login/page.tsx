import React, { Suspense } from "react";
import type { Metadata } from "next";
import LoginView from "@/components/auth/login-view";
import { isDemoLoginEnabled } from "@/lib/auth/demo-mode";

export const metadata: Metadata = {
  title: "Sign In | CliniCare Practice Management",
  description: "Secure OAuth sign-in gateway for clinic staff",
};

export default function LoginPage() {
  const demoEnabled = isDemoLoginEnabled();
  return (
    <Suspense fallback={null}>
      <LoginView
        demoEnabled={demoEnabled}
        showDemoBanner={demoEnabled && process.env.NODE_ENV === "production"}
      />
    </Suspense>
  );
}

