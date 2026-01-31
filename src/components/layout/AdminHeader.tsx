import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useIsTablet } from "@/hooks/use-tablet";
import AdminMobileMenu from "./AdminMobileMenu";
import { NavItem } from "./types/NavItem.types";

interface AdminHeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filteredNavItems: NavItem[];
}

export function AdminHeader({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  filteredNavItems,
}: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const isTablet = useIsTablet();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 pointer-events-auto">
      <div className="flex justify-start items-center gap-2">
        {isTablet && (
          <AdminMobileMenu
            filteredNavItems={filteredNavItems}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        )}
        <div className="flex flex-1 items-center">
          <h1 className="text-xl font-semibold text-blue-700 hidden sm:inline-block">
            EdTech Admin Dashboard
          </h1>
        </div>{" "}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 rounded-full"
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-700" />
              </div>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.role}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
