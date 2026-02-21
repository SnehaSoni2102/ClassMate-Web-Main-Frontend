import { ReactNode, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  LayoutDashboard,
  BookOpen,
  FileText,
  BookText,
  CreditCard,
  MessagesSquare,
  TriangleAlert,
  User,
  Folder,
  School,
  Atom,
  SquareChartGantt,
  Megaphone,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem } from "./types/NavItem.types";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Users",
    href: "/users",
    icon: User,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Groups",
    href: "/groups",
    icon: Users,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Tests",
    href: "/tests",
    icon: FileText,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Quizzes",
    href: "/quizzes",
    icon: ClipboardList,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Questions",
    href: "/questions",
    icon: BookText,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Reported Questions",
    href: "/reported-questions",
    icon: TriangleAlert,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Exam Categories",
    href: "/categories",
    icon: Folder,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Exams",
    href: "/exams",
    icon: BookOpen,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Subjects",
    href: "/subjects",
    icon: SquareChartGantt,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Topics",
    href: "/topics",
    icon: Atom,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Classes",
    href: "/classes",
    icon: School,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: CreditCard,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Student Support",
    href: "/support",
    icon: MessagesSquare,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Notice Board",
    href: "/notice-board",
    icon: Megaphone,
    roles: ["admin", "superadmin"],
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        filteredNavItems={filteredNavItems}
      />
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 max-lg:w-full relative",
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <div className="relative z-50">
          <AdminHeader
            filteredNavItems={filteredNavItems}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </div>
        <ScrollArea className={cn("flex-1 p-4 md:p-6 lg:p-8")}>
          <div className="mx-auto w-full space-y-6">{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
}
