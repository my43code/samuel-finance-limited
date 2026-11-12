import { redirect } from "next/navigation";
import { administrator, configuration } from "../../../lib/supabase";
import Login from "../../../components/login";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administrator sign-in",
  robots: { index: false, follow: false },
};
export default async function LoginPage({ searchParams }) {
  if (await administrator()) redirect("/admin");
  const params = await searchParams;
  return (
    <Login
      configured={!!configuration()}
      expired={params.recovery === "expired"}
    />
  );
}
