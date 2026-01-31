
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LogOut, Menu, User, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NavItem } from "./types/NavItem.types";

interface AdminMobileMenuProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filteredNavItems: NavItem[];
}

export default function AdminMobileMenu({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  filteredNavItems,
}: AdminMobileMenuProps) {
  const { user, logout } = useAuth();
  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[280px]">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-700">EdTech Admin</span>
          </div>
        </div>

        <ScrollArea className="flex-1 p-2 h-[calc(100vh-8rem)]">
          <nav className="grid gap-1 px-2">
            {filteredNavItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t border-sidebar-border p-4">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium">{user.name || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
