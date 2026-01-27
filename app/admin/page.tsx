import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Manage datasets and application settings</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/admin/dataset">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Dataset Management</CardTitle>
              <CardDescription>
                Validate, lint, import, and export pharmacology datasets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• View entity schemas</li>
                <li>• Validate JSON files</li>
                <li>• Run comprehensive linting</li>
                <li>• Export/import dataset bundles</li>
                <li>• Manage dataset overrides</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Coming soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View and manage user accounts, roles, and permissions
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Coming soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View usage statistics, popular content, and learning trends
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle>Content Reports</CardTitle>
            <CardDescription>
              Coming soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Review user-reported issues and suggested improvements
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
