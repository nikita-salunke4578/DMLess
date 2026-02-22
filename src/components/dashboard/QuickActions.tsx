import { motion } from "framer-motion";
import { FileText, Calendar, MoreVertical, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: "SHORTLISTED" | "KNOCKED_OUT";
  resume_url?: string | null;
}

interface QuickActionsProps {
  candidates: Candidate[];
  onViewResume?: (candidate: Candidate) => void;
  onScheduleInterview?: (candidate: Candidate) => void;
  onMoveStage?: (candidate: Candidate) => void;
  onAddNote?: (candidate: Candidate) => void;
  onReject?: (candidate: Candidate) => void;
}

export function QuickActions({
  candidates,
  onViewResume,
  onScheduleInterview,
  onMoveStage,
  onAddNote,
  onReject,
}: QuickActionsProps) {
  const shortlistedCandidates = candidates.filter(c => c.status === "SHORTLISTED");

  if (shortlistedCandidates.length === 0) {
    return (
      <div className="stat-card">
        <h3 className="text-lg font-semibold font-display text-foreground mb-4">Quick Actions</h3>
        <p className="text-sm text-muted-foreground text-center py-12">No shortlisted candidates yet</p>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold font-display text-foreground mb-6">Quick Actions</h3>
      <p className="text-xs text-muted-foreground mb-6">Actions available for each candidate</p>

      <div className="space-y-2">
        {shortlistedCandidates.slice(0, 5).map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/60 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{candidate.name}</p>
              <p className="text-xs text-muted-foreground truncate">{candidate.email}</p>
            </div>

            <div className="flex items-center gap-1 ml-2">
              {candidate.resume_url && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => onViewResume?.(candidate)}
                  title="View Resume"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => onScheduleInterview?.(candidate)}
                title="Schedule Interview"
              >
                <Calendar className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onMoveStage?.(candidate)}>
                    Move Stage
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddNote?.(candidate)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onReject?.(candidate)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reject
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
