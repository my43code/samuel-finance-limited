import { redirect } from "next/navigation";
import { administrator } from "../../lib/supabase";
import Dashboard from "../../components/dashboard";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administration workspace",
  robots: { index: false, follow: false },
};
export default async function Admin() {
  const admin = await administrator();
  if (!admin) redirect("/admin/login");
  return (
    <Dashboard
      user={{
        email: admin.user.email,
        name: admin.profile.display_name || admin.user.email.split("@")[0],
        role: admin.profile.role,
      }}
    />
  );
}
