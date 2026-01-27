import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  if ((session.user as { role?: string }).role !== "ADMIN") {
    redirect("/dashboard");
  }
  
  return session;
}
