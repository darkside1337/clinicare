import React, { Suspense } from "react";
import type { Metadata } from "next";
import LoginView from "@/components/login-view";

export const metadata: Metadata = {
  title: "Sign In | CliniCare Practice Management",
  description: "Secure OAuth sign-in gateway for clinic staff",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginView />
    </Suspense>
  );
}

