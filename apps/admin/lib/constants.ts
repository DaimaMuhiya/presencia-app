import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  QrCode,
  Users,
  ClipboardList,
  FileText,
  Settings,
  Download,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "QR Management", href: "/qr-management", icon: QrCode },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Attendance Logs", href: "/attendance", icon: ClipboardList },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Export", href: "/export", icon: Download },
];

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/qr-management": "QR Access Management",
  "/employees": "Employee Management",
  "/attendance": "Attendance Logs",
  "/reports": "Reports",
  "/settings": "System Settings",
  "/export": "Export Tool",
};

export const PAGE_BREADCRUMBS: Record<string, string[]> = {
  "/dashboard": ["Home", "Dashboard", "Analytics Overview"],
  "/qr-management": ["Home", "QR Management"],
  "/employees": ["Home", "Employees"],
  "/attendance": ["Home", "Attendance Logs"],
  "/reports": ["Home", "Reports"],
  "/settings": ["Home", "Settings"],
  "/export": ["Home", "Export"],
};

export const ADMIN_MAIN_PADDING_X = "px-4 md:px-8";

export const ADMIN_TOP_BAR_HEIGHT =
  "h-16 min-h-16 shrink-0 lg:h-16 lg:min-h-16";

export const DEMO_ADMIN_PROFILE = {
  name: "Alex Rivers",
  email: "admin@presencia.io",
  role: "Super Administrator",
  initials: "AR",
} as const;
