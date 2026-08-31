import {
  BarChart3,
  Beaker,
  BookOpen,
  FileText,
  FlaskConical,
  Home,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import type { ViewKey } from "../types";

const navItems: Array<{ key: ViewKey; label: string; icon: typeof Home }> = [
  { key: "overview", label: "Overview", icon: Home },
  { key: "experiments", label: "Experiments", icon: FlaskConical },
  { key: "benchmarks", label: "Benchmarks", icon: BarChart3 },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "methods", label: "Method Library", icon: BookOpen },
];

interface AppShellProps {
  currentView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  onShowAbout: () => void;
  children: ReactNode;
}

export function AppShell({ currentView, onNavigate, onShowAbout, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (view: ViewKey) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  return (
    <div className="app-shell">
      <button
        className="mobile-menu-button"
        type="button"
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        onClick={() => setMobileOpen((value) => !value)}
      >
        {mobileOpen ? <X /> : <Menu />}
      </button>
      <aside className={`sidebar${mobileOpen ? " sidebar-open" : ""}`} aria-label="Primary navigation">
        <button className="brand" type="button" onClick={() => navigate("overview")}>
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>CausalPilot AI</span>
        </button>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.key}
                className={currentView === item.key ? "nav-item nav-item-active" : "nav-item"}
                aria-current={currentView === item.key ? "page" : undefined}
                onClick={() => navigate(item.key)}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-research-note">
          <Beaker aria-hidden="true" />
          <p>Evidence first. AI never changes statistical results.</p>
        </div>
        <button className="author-link" type="button" onClick={onShowAbout}>
          <UserRound aria-hidden="true" />
          <span>
            <small>Built by</small>
            LAI ZEYU · 来泽宇
          </span>
        </button>
      </aside>
      <main className="app-main">{children}</main>
      {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    </div>
  );
}
