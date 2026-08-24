import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar user={user} />
      <div className="flex-1 px-4 py-8 sm:px-6 md:px-10">{children}</div>
    </div>
  );
}
