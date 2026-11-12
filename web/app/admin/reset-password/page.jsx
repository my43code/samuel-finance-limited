import Login from "../../../components/login";
import { configuration } from "../../../lib/supabase";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Reset administrator password",
  robots: { index: false, follow: false },
};
export default function ResetPassword() {
  return <Login configured={!!configuration()} reset />;
}
