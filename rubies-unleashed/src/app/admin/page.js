import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "404: This page could not be found", // 🥸 Stealth
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}