import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Share2, Linkedin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface JobLinkShareProps {
  jobId?: string;
  jobTitle?: string;
}

export function JobLinkShare({ jobId = "example-job-id", jobTitle = "Job Opening" }: JobLinkShareProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const baseUrl = window.location.origin;
  const jobLink = `${baseUrl}/apply/${jobId}`;

  const channelLinks = {
    linked: `${jobLink}?source=linkedin`,
    whatsapp: `https://wa.me/?text=Check%20out%20this%20job:%20${encodeURIComponent(jobLink)}`,
    instagram: `${jobLink}?source=instagram`,
  };

  const handleCopyToClipboard = (link: string, label: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Copied!",
      description: `${label} link copied to clipboard`,
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (channel: "linkedin" | "whatsapp" | "instagram") => {
    const link = channelLinks[channel];
    if (channel === "whatsapp") {
      window.open(link, "_blank");
    } else if (channel === "linkedin") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobLink)}`,
        "_blank"
      );
    } else {
      handleCopyToClipboard(link, "Instagram");
    }
  };

  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-6">
        <Share2 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold font-display text-foreground">Job Link Share</h3>
      </div>

      <p className="text-xs text-muted-foreground mb-4">One-click copy of hiring link + individual channel sub-links</p>

      <div className="space-y-4">
        {/* Main Job Link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-muted/50 rounded-lg p-4 border border-border/50"
        >
          <p className="text-xs text-muted-foreground font-semibold mb-2">Main Hiring Link</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={jobLink}
              readOnly
              className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm font-mono text-foreground outline-none"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopyToClipboard(jobLink, "Main")}
              className="gap-1"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Channel Links */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-semibold">Share on Channels</p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShare("linkedin")}
              className="gap-2 flex-1"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShare("whatsapp")}
              className="gap-2 flex-1 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShare("instagram")}
              className="gap-2 flex-1"
            >
              <Copy className="h-4 w-4" />
              Instagram
            </Button>
          </motion.div>
        </div>

        {/* Analytics Note */}
        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
          <p className="text-xs text-primary font-semibold mb-1">📊 Track Source</p>
          <p className="text-xs text-primary/80">Channel links include source tracking to measure which channel brings the most candidates</p>
        </div>
      </div>
    </div>
  );
}
