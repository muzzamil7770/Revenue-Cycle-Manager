import { useState } from "react";
import { useGetCodingSuggestions, useListCodingAudits, getGetCodingSuggestionsQueryKey } from "@workspace/api-client-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { Search, Sparkles, AlertTriangle } from "lucide-react";

export default function Coding() {
  const [query, setQuery] = useState("");
  const [codeType, setCodeType] = useState("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data: suggestions, isLoading: suggestionsLoading } = useGetCodingSuggestions(
    { query: debouncedQuery, type: codeType },
    { query: { enabled: !!debouncedQuery, queryKey: getGetCodingSuggestionsQueryKey({ query: debouncedQuery, type: codeType }) } }
  );
  const { data: audits, isLoading: auditsLoading } = useListCodingAudits();

  const handleSearch = (v: string) => {
    setQuery(v);
    clearTimeout((window as any)._codeTimer);
    (window as any)._codeTimer = setTimeout(() => setDebouncedQuery(v), 400);
  };

  const severityColor: Record<string, string> = {
    high: "text-red-600 dark:text-red-400",
    medium: "text-amber-600 dark:text-amber-400",
    low: "text-blue-600 dark:text-blue-400",
  };

  return (
    <div>
      <PageHeader
        title="Medical Coding"
        subtitle="ICD-10/CPT code lookup, AI suggestions, and audit management"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Code Search */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Code Search & AI Suggestions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search ICD-10 or CPT codes..."
                  value={query}
                  onChange={e => handleSearch(e.target.value)}
                  className="pl-8"
                  data-testid="input-code-search"
                />
              </div>
              <Select value={codeType} onValueChange={setCodeType}>
                <SelectTrigger className="w-28" data-testid="select-code-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="icd">ICD-10</SelectItem>
                  <SelectItem value="cpt">CPT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!debouncedQuery ? (
              <p className="text-sm text-muted-foreground text-center py-8">Enter a search term to find codes</p>
            ) : suggestionsLoading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : (suggestions ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No codes found</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {(suggestions ?? []).map(s => (
                  <div
                    key={s.code}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    data-testid={`code-suggestion-${s.code}`}
                  >
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${s.type === "ICD-10" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"}`}>
                        {s.code}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{s.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{s.type}</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                          {(s.confidence * 100).toFixed(0)}% confidence
                        </span>
                        {s.billable && <span className="text-xs text-blue-600 dark:text-blue-400">Billable</span>}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs h-7 px-2">Use</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Flags */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <CardTitle className="text-sm">Coding Audit Flags</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {auditsLoading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {(audits ?? []).map(audit => (
                  <div key={audit.id} className="p-3 rounded-lg border border-border" data-testid={`audit-flag-${audit.id}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold uppercase ${severityColor[audit.severity] ?? ""}`}>
                          {audit.severity}
                        </span>
                        <span className="text-xs font-medium">{audit.flag}</span>
                      </div>
                      <StatusBadge status={audit.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{audit.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {audit.claimNumber} · {audit.patientName} · {formatDate(audit.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
