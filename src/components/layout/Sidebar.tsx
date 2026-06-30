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

const navItems = [
  { label: "Dashboard", icon: LayoutGrid, active: true },
  { label: "Spyglass", icon: CircleDot, active: false },
  { label: "Shield", icon: ShieldCheck, active: false },
  { label: "Projects", icon: FolderOpen, active: false },
  { label: "Reports", icon: BarChart3, active: false },
  { label: "Settings", icon: Settings, active: false },
];

export function Sidebar() {
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
        {navItems.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-body text-left transition-colors",
              active
                ? "bg-aegis-teal/10 text-aegis-teal border border-aegis-teal/30"
                : "text-aegis-gray hover:text-aegis-silver hover:bg-white/5 border border-transparent"
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}