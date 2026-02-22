import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Briefcase, Users, LogOut, Zap } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", path: "/dashboard/jobs", icon: Briefcase },
  { label: "Candidates", path: "/dashboard/candidates", icon: Users },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <aside className="w-60 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ background: "var(--gradient-warm)" }} />

        <div className="p-5 border-b border-sidebar-border relative z-10">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display text-sidebar-accent-foreground">Dmless</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 relative z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border relative z-10">
          <div className="px-3 py-2 text-xs text-sidebar-foreground truncate mb-2">
            {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-all duration-200 w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="p-8 max-w-6xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
