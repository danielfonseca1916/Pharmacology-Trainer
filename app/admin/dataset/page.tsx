"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { FileValidationResult, LintIssue } from "@/lib/dataset/types";

export default function AdminDatasetPage() {
  const [validationResults, setValidationResults] = useState<FileValidationResult[]>([]);
  const [lintResults, setLintResults] = useState<{ issues: LintIssue[]; summary: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(false);
  const [importName, setImportName] = useState("");
  const [importDescription, setImportDescription] = useState("");
  const [overrides, setOverrides] = useState<Array<{ id: number; name: string; description: string; isActive: boolean; createdAt: string; createdBy: { email: string } }>>([]);

  const handleValidateFiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setValidationResults([]);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch("/api/admin/validate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setValidationResults(data.results || []);
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLintDataset = async () => {
    setLoading(true);
    setLintResults(null);

    try {
      const res = await fetch("/api/admin/lint");
      const data = await res.json();
      setLintResults(data);
    } catch (error) {
      console.error("Lint error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/admin/export");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pharmacology-dataset-${Date.now()}.json`;
      a.click();
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("name", importName);
    formData.append("description", importDescription);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        alert("Dataset imported successfully!");
        loadOverrides();
        setImportName("");
        setImportDescription("");
        e.currentTarget.reset();
      } else {
        alert(`Import failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Import failed");
    } finally {
      setLoading(false);
    }
  };

  const loadOverrides = async () => {
    try {
      const res = await fetch("/api/admin/import");
      const data = await res.json();
      setOverrides(data.overrides || []);
    } catch (error) {
      console.error("Load overrides error:", error);
    }
  };

  const handleActivateOverride = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/overrides/${id}`, {
        method: "POST",
      });

      if (res.ok) {
        alert("Override activated!");
        loadOverrides();
      }
    } catch (error) {
      console.error("Activate error:", error);
    }
  };

  const handleDeleteOverride = async (id: number) => {
    if (!confirm("Delete this override?")) return;

    try {
      const res = await fetch(`/api/admin/overrides/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Override deleted!");
        loadOverrides();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Dataset Management</h1>
      <p className="text-gray-600 mb-6">Validate, lint, import, and export pharmacology datasets</p>

      <Tabs defaultValue="schemas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schemas">Schemas</TabsTrigger>
          <TabsTrigger value="validate">Validate Files</TabsTrigger>
          <TabsTrigger value="lint">Lint Dataset</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        {/* SCHEMAS TAB */}
        <TabsContent value="schemas">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Schemas</CardTitle>
              <CardDescription>Overview of required fields for each entity type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">courseBlocks</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Course blocks organize content into subject areas (ANS, Cardiovascular, etc.)
                </p>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
{`{
  "id": "string",
  "title": { "en": "string", "cs": "string" },
  "description": { "en": "string", "cs": "string" }
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">drugs</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Individual drugs with bilingual pharmacological information
                </p>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
{`{
  "id": "string",
  "name": { "en": "string", "cs": "string" },
  "class": { "en": "string", "cs": "string" },
  "indications": { "en": "string", "cs": "string" },
  "mechanism": { "en": "string", "cs": "string" },
  "adverseEffects": { "en": "string", "cs": "string" },
  "contraindications": { "en": "string", "cs": "string" },
  "monitoring": { "en": "string", "cs": "string" },
  "interactionsSummary": { "en": "string", "cs": "string" },
  "typicalDoseText": { "en": "string", "cs": "string" },
  "tags": ["string"],
  "courseBlockId": "string"
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">questions</h3>
                <p className="text-sm text-gray-600 mb-2">
                  MCQ/SBA questions with multiple choice options
                </p>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
{`{
  "id": "string",
  "stem": { "en": "string", "cs": "string" },
  "options": [
    {
      "id": "string",
      "text": { "en": "string", "cs": "string" },
      "correct": boolean
    }
  ],
  "explanation": { "en": "string", "cs": "string" },
  "tags": ["string"],
  "courseBlockId": "string"
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">cases</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Clinical case scenarios with scoring rubric
                </p>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
{`{
  "id": "string",
  "stem": { "en": "string", "cs": "string" },
  "patient": { "age": number, "sex": "string", "weightKg": number },
  "vitals": { "HR": "string|number", "BP": "string|number" },
  "labs": { "creatinine": number },
  "choices": [
    {
      "id": "string",
      "option": { "en": "string", "cs": "string" },
      "explanation": { "en": "string", "cs": "string" }
    }
  ],
  "rubric": {
    "correctChoiceId": "string",
    "contraindicationsMissed": ["string"],
    "interactionsMissed": ["string"],
    "monitoringMissing": ["string"],
    "scoring": { "correct": number, "safety": number, "monitoring": number }
  },
  "courseBlockId": "string",
  "tags": ["string"]
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">interactions</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Drug interaction rules for the sandbox module
                </p>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
{`{
  "id": "string",
  "appliesWhen": {
    "drugIds": ["string"],
    "classes": ["string"],
    "tags": ["string"]
  },
  "severity": "low" | "moderate" | "high",
  "mechanism": { "en": "string", "cs": "string" },
  "recommendation": { "en": "string", "cs": "string" },
  "rationale": { "en": "string", "cs": "string" }
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">doseTemplates</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Dose calculation templates with safe formula implementations
                </p>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
{`{
  "id": "string",
  "title": { "en": "string", "cs": "string" },
  "inputs": [
    {
      &quot;name&quot;: &quot;string&quot;,
      &quot;label&quot;: { &quot;en&quot;: &quot;string&quot;, &quot;cs&quot;: &quot;string&quot; },
      &quot;type&quot;: &quot;number&quot; | &quot;text&quot;
    }
  ],
  "formula": { "en": "string", "cs": "string" },
  "example": { "en": "string", "cs": "string" },
  "tags": ["string"]
}`}
                </pre>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Note:</strong> All i18n fields require both &quot;en&quot; and &quot;cs&quot; translations.
                  IDs must be unique within each collection and stable across versions.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VALIDATE TAB */}
        <TabsContent value="validate">
          <Card>
            <CardHeader>
              <CardTitle>Validate Files</CardTitle>
              <CardDescription>
                Upload JSON files to validate against schemas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleValidateFiles} className="space-y-4">
                <div>
                  <Label htmlFor="files">JSON Files</Label>
                  <Input
                    id="files"
                    name="files"
                    type="file"
                    accept=".json"
                    multiple
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Validating..." : "Validate"}
                </Button>
              </form>

              {validationResults.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Validation Results</h3>
                  {validationResults.map((result, idx) => (
                    <Card key={idx} className={result.valid ? "border-green-500" : "border-red-500"}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          {result.file}
                          <Badge variant={result.valid ? "default" : "destructive"}>
                            {result.valid ? "Valid" : "Invalid"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      {(result.errors.length > 0 || result.warnings.length > 0) && (
                        <CardContent>
                          {result.errors.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-red-600 mb-2">
                                Errors ({result.errors.length})
                              </h4>
                              <ul className="space-y-1 text-sm">
                                {result.errors.map((err, i) => (
                                  <li key={i} className="text-red-600">
                                    [{err.type}] {err.message}
                                    {err.path && <span className="ml-2 text-gray-600">at {err.path}</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {result.warnings.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-yellow-600 mb-2">
                                Warnings ({result.warnings.length})
                              </h4>
                              <ul className="space-y-1 text-sm">
                                {result.warnings.map((warn, i) => (
                                  <li key={i} className="text-yellow-600">
                                    [{warn.type}] {warn.message}
                                    {warn.path && <span className="ml-2 text-gray-600">at {warn.path}</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* LINT TAB */}
        <TabsContent value="lint">
          <Card>
            <CardHeader>
              <CardTitle>Lint Dataset</CardTitle>
              <CardDescription>
                Run comprehensive linting checks on the current seed dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLintDataset} disabled={loading}>
                {loading ? "Linting..." : "Run Lint Checks"}
              </Button>

              {lintResults && (
                <div className="mt-6">
                  <Alert className={lintResults.summary.errors === 0 ? "border-green-500" : "border-red-500"}>
                    <AlertDescription>
                      <strong>Summary:</strong> {lintResults.summary.total} issue(s) found
                      ({lintResults.summary.errors} error(s), {lintResults.summary.warnings} warning(s))
                    </AlertDescription>
                  </Alert>

                  {lintResults.issues.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {lintResults.issues.map((issue, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded border ${
                            issue.severity === "error"
                              ? "bg-red-50 border-red-200"
                              : "bg-yellow-50 border-yellow-200"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Badge variant={issue.severity === "error" ? "destructive" : "secondary"}>
                              {issue.type}
                            </Badge>
                            <div className="flex-1 text-sm">
                              <p className="font-medium">{issue.message}</p>
                              {issue.path && <p className="text-gray-600">Path: {issue.path}</p>}
                              {issue.id && <p className="text-gray-600">ID: {issue.id}</p>}
                              {issue.file && <p className="text-gray-600">File: {issue.file}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EXPORT TAB */}
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Dataset</CardTitle>
              <CardDescription>
                Download the current seed dataset as a single JSON bundle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExport}>
                Export Dataset
              </Button>
              <p className="text-sm text-gray-600 mt-4">
                This will download a JSON file containing all courseBlocks, drugs, questions,
                cases, interactions, and doseTemplates from data/seed/*.json
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IMPORT TAB */}
        <TabsContent value="import">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Dataset Override</CardTitle>
                <CardDescription>
                  Upload and activate a custom dataset bundle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleImport} className="space-y-4">
                  <div>
                    <Label htmlFor="import-name">Name</Label>
                    <Input
                      id="import-name"
                      value={importName}
                      onChange={(e) => setImportName(e.target.value)}
                      placeholder="e.g., 2026-Spring-Update"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="import-description">Description (optional)</Label>
                    <Input
                      id="import-description"
                      value={importDescription}
                      onChange={(e) => setImportDescription(e.target.value)}
                      placeholder="Brief description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="import-file">Dataset JSON</Label>
                    <Input
                      id="import-file"
                      name="file"
                      type="file"
                      accept=".json"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Importing..." : "Import"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stored Overrides</CardTitle>
                <CardDescription>
                  Manage imported dataset overrides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={loadOverrides} size="sm" className="mb-4">
                  Refresh List
                </Button>

                {overrides.length === 0 && (
                  <p className="text-sm text-gray-600">No overrides stored yet.</p>
                )}

                <div className="space-y-3">
                  {overrides.map((override) => (
                    <Card key={override.id} className={override.isActive ? "border-blue-500" : ""}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{override.name}</h4>
                              {override.isActive && (
                                <Badge variant="default">Active</Badge>
                              )}
                            </div>
                            {override.description && (
                              <p className="text-sm text-gray-600 mb-2">{override.description}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              Created by {override.createdBy.email} on{" "}
                              {new Date(override.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!override.isActive && (
                              <Button
                                size="sm"
                                onClick={() => handleActivateOverride(override.id)}
                              >
                                Activate
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteOverride(override.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
