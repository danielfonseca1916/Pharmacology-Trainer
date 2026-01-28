import { auth } from "@/auth";
import { DatasetErrorBoundary } from "@/components/DatasetErrorBoundary";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <DatasetErrorBoundary>{children}</DatasetErrorBoundary>;
}
