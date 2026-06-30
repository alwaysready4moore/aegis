"use client";

import {
  LayoutGrid,
  CircleDot,
  ShieldCheck,
  FolderOpen,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionId } from "@/lib/types";

interface NavItemConfig {
  id: SectionId;
  label: string;
  icon: typeof LayoutGrid;
  targetElementId: string | null; // null = not scrollable (Coming soon items)
  requiresResult: boolean;
  comingSoon: boolean;
}

const navItems: NavItemConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    targetElementId: "top",
    requiresResult: false,
    comingSoon: false,
  },
  {
    id: "spyglass",
    label: "Spyglass",
    icon: CircleDot,
    targetElementId: "spyglass-section",
    requiresResult: true,
    comingSoon: false,
  },
  {
    id: "shield",
    label: "Shield",
    icon: ShieldCheck,
    targetElementId: "shield-section",
    requiresResult: true,
    comingSoon: false,
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderOpen,
    targetElementId: null,
    requiresResult: false,
    comingSoon: true,
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    targetElementId: null,
    requiresResult: false,
    comingSoon: true,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    targetElementId: null,
    requiresResult: false,
    comingSoon: true,
  },
];

interface SidebarProps {
  activeSection: SectionId;
  hasResult: boolean;
  onNavigate: (section: SectionId, targetElementId: string) => void;
}

export function Sidebar({ activeSection, hasResult, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-aegis-border bg-aegis-black px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aegis-teal/10 border border-aegis-teal/30">
          <span className="font-display text-aegis-teal text-sm font-bold">A</span>
        </div>
        <div>
          <div className="font-display text-sm font-semibold text-aegis-silver leading-none">
            AEGIS
          </div>
          <div className="font-body text-[10px] text-aegis-gray leading-none mt-1">
            Creative Intelligence
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const { id, label, icon: Icon, targetElementId, requiresResult, comingSoon } = item;
          const isDisabled = comingSoon || (requiresResult && !hasResult);
          const isActive = activeSection === id && !isDisabled;

          return (
            <button
              key={id}
              type="button"
              disabled={isDisabled}
              title={
                comingSoon
                  ? "Coming soon"
                  : requiresResult && !hasResult
                  ? "Run an analysis first"
                  : undefined
              }
              onClick={() => {
                if (isDisabled || !targetElementId) return;
                onNavigate(id, targetElementId);
              }}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-body text-left transition-colors",
                isDisabled && "opacity-40 cursor-not-allowed",
                !isDisabled && isActive &&
                  "bg-aegis-teal/10 text-aegis-teal border border-aegis-teal/30",
                !isDisabled && !isActive &&
                  "text-aegis-gray hover:text-aegis-silver hover:bg-white/5 border border-transparent",
                isDisabled && "border border-transparent"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon size={16} />
                {label}
              </span>
              {comingSoon && (
                <span className="text-[10px] uppercase tracking-wide text-aegis-gray/70 whitespace-nowrap">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}