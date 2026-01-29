"use client";

import { useEffect, useState } from "react";
import AgeGate from "@/components/AgeGate";
import TopBar from "@/components/TopBar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accepted, setAccepted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const value = localStorage.getItem("ageAccepted");
    setAccepted(value === "true");
    setReady(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("ageAccepted", "true");
    setAccepted(true);
  };

  if (!ready) return null;

  if (!accepted) {
    return <AgeGate onAccept={handleAccept} />;
  }

  return (
    <>
      <TopBar />
      {children}
    </>
  );
}
