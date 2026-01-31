
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LogOut,
  Menu,
  User,
} from "lucide-react";
import { useIsTablet } from "@/hooks/use-tablet";
import { NavItem } from "./types/NavItem.types";

interface AdminSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed: boolean;
  filteredNavItems: NavItem[]
}

export function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  filteredNavItems
}: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const isMobileOrTablet = useIsTablet();

  // Desktop/large screen sidebar
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-700">EdTech Admin</span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 p-2 overflow-auto">
        <nav className="grid gap-1 px-2">
          {filteredNavItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  isCollapsed && "justify-center px-0"
                )
              }
            >
              <item.icon className={cn("h-5 w-5", isCollapsed && "h-5 w-5")} />
              {!isCollapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      <div className="mt-auto border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-md">
          {!isCollapsed && user ? (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium">{user.name || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
          ) : (
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-700" />
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          className={cn(
            "mt-3 w-full justify-start",
            isCollapsed && "justify-center px-0"
          )}
          onClick={() => logout()}
        >
          <LogOut className="h-5 w-5 mr-2" />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </div>
  );

  // Return mobile or desktop sidebar based on screen size
  if (isMobileOrTablet) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar shadow-lg transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent />
    </div>
  );
}
