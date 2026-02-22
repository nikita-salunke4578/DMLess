import { useState } from "react";
import { Eye, Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getResumeDownloadUrl } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: "SHORTLISTED" | "KNOCKED_OUT";
  score: number;
  resume_url: string | null;
  created_at: string;
  jobs?: { title: string };
}

interface CandidateTableProps {
  candidates: Candidate[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export function CandidateTable({ candidates, loading, onDelete }: CandidateTableProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleViewResume = async (candidate: Candidate) => {
    if (!candidate.resume_url) {
      alert("No resume available");
      return;
    }
    try {
      const url = await getResumeDownloadUrl(candidate.resume_url);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error viewing resume:", error);
      alert("Failed to view resume");
    }
  };

  const handleDownloadResume = async (candidate: Candidate) => {
    if (!candidate.resume_url) {
      alert("No resume available");
      return;
    }
    try {
      setDownloading(candidate.id);
      const url = await getResumeDownloadUrl(candidate.resume_url);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${candidate.name}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading resume:", error);
      alert("Failed to download resume");
    } finally {
      setDownloading(null);
    }
  };

  const handleDeleteCandidate = async (candidate: Candidate) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${candidate.name}'s application? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(candidate.id);
      const { error } = await supabase
        .from("candidates")
        .delete()
        .eq("id", candidate.id);

      if (error) throw error;

      onDelete?.(candidate.id);
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Failed to delete candidate. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="stat-card">
        <h3 className="text-lg font-semibold font-display text-foreground mb-6">Candidate Table</h3>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="stat-card">
        <h3 className="text-lg font-semibold font-display text-foreground mb-6">Candidate Table</h3>
        <p className="text-muted-foreground text-sm text-center py-12">
          No candidates yet. Share your hiring link to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="stat-card overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold font-display text-foreground">
          Candidate Table
        </h3>
        <span className="text-sm text-muted-foreground">
          {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Score</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Applied</th>
              <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>

          <tbody>
            {candidates.map((candidate) => (
              <tr
                key={candidate.id}
                className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${deletingId === candidate.id ? "opacity-50 pointer-events-none" : ""
                  }`}
              >
                {/* Name */}
                <td className="py-3 px-4 font-medium text-foreground">
                  {candidate.name}
                </td>

                {/* Email */}
                <td className="py-3 px-4 text-muted-foreground">
                  {candidate.email}
                </td>

                {/* Score */}
                <td className="py-3 px-4 font-semibold">
                  {(candidate.score * 20).toFixed(0)}%
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <Badge
                    variant={candidate.status === "SHORTLISTED" ? "default" : "destructive"}
                    className={candidate.status === "SHORTLISTED" ? "bg-success text-success-foreground" : ""}
                  >
                    {candidate.status === "SHORTLISTED" ? "✓ Shortlisted" : "✗ Knocked Out"}
                  </Badge>
                </td>

                {/* Applied date */}
                <td className="py-3 px-4 text-muted-foreground text-xs">
                  {new Date(candidate.created_at).toLocaleDateString()}
                </td>

                {/* Actions */}
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1">

                    {/* View Resume */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:text-blue-500 hover:bg-blue-50"
                      onClick={() => handleViewResume(candidate)}
                      disabled={!candidate.resume_url}
                      title={candidate.resume_url ? "View resume" : "No resume uploaded"}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {/* Download Resume */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:text-green-500 hover:bg-green-50"
                      onClick={() => handleDownloadResume(candidate)}
                      disabled={!candidate.resume_url || downloading === candidate.id}
                      title={candidate.resume_url ? "Download resume" : "No resume uploaded"}
                    >
                      {downloading === candidate.id ? (
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Delete — always visible */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteCandidate(candidate)}
                      disabled={deletingId === candidate.id}
                      title="Delete candidate"
                    >
                      {deletingId === candidate.id ? (
                        <div className="h-4 w-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}