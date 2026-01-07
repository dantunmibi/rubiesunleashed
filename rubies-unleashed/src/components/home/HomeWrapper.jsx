"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import LandingPage from "./LandingPage";
import UserDashboard from "./UserDashboard";
import { Loader2 } from "lucide-react";

export default function HomeWrapper({ games }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-500" size={48} />
      </div>
    );
  }

  if (user) {
    return <UserDashboard initialGames={games} />;
  }

  return <LandingPage />;
}