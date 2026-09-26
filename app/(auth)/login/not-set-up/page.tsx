import React from "react";
import type { Metadata } from "next";
import LoginNotSetUpView from "@/components/login-not-set-up-view";

export const metadata: Metadata = {
  title: "Account Pending Clinic Assignment | CliniCare",
  description: "Account provisioning and clinic assignment support notice",
};

export default function LoginNotSetUpPage() {
  return <LoginNotSetUpView />;
}
