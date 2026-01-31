
export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: Array<"admin" | "superadmin">;
};
