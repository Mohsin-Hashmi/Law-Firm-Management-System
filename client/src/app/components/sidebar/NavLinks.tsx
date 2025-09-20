import { NavLink, navLinks } from "./NavLinksConfig";
import { superAdminNavLinks } from "./SuperAdminNavLinksConfig"; 
import { usePermission } from "@/app/hooks/usePermission";
import Link from "next/link";

interface NavLinksProps {
  collapsed?: boolean;
  onOpenRoleModal?: () => void;
  isSuperAdmin?: boolean;
  onOpenAssignRoleModal?: () => void;
}

export const NavLinks = ({
  collapsed,
  onOpenRoleModal,
  onOpenAssignRoleModal,
  isSuperAdmin,
}: NavLinksProps) => {
  const { hasPermission } = usePermission();

  // pick correct set of links
  const links = isSuperAdmin ? superAdminNavLinks : navLinks;

  // Filter by permission (only for non-super admin)
  const filteredLinks = isSuperAdmin
    ? links // super admin sees all
    : links.filter(
        (link) =>
          !link.requiredPermissions || hasPermission(link.requiredPermissions)
      );

  // Group by category
  const grouped = filteredLinks.reduce((acc, link) => { 
    const cat = link.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(link);
    return acc;
  }, {} as Record<string, typeof navLinks>);

  const handleClick = (link: NavLink) => {
    if (link.label === "Assign Role") {
      onOpenAssignRoleModal?.();
    } else if (link.label === "Add New Role") {
      onOpenRoleModal?.();
    } else if (link.onClick) {
      link.onClick();
    }
  };

  return (
    <nav className="flex-1 overflow-y-auto">
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, links]) => (
          <div key={category}>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">
                {category}
              </h3>
            )}
            <div className="space-y-1">
              {links.map((link) =>
                link.href ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`flex items-center ${
                      collapsed ? "justify-center px-3" : "px-3"
                    } py-3 text-slate-700 dark:text-slate-300 rounded-xl 
                      hover:bg-slate-50 dark:hover:bg-slate-800 
                      hover:text-slate-900 dark:hover:text-white 
                      transition-all duration-200 group relative`}
                    title={collapsed ? link.label : ""}
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                      {link.icon}
                    </span>
                    {!collapsed && (
                      <span className="ml-3 text-sm font-medium">
                        {link.label}
                      </span>
                    )}
                  </Link>
                ) : (
                  <button
                    key={link.label}
                    onClick={() => handleClick(link)}
                    className={`w-full flex items-center ${
                      collapsed ? "justify-center px-3" : "px-3"
                    } py-3 text-slate-700 dark:text-slate-300 rounded-xl 
                      hover:bg-slate-50 dark:hover:bg-slate-800 
                      hover:text-slate-900 dark:hover:text-white 
                      transition-all duration-200 group relative`}
                    title={collapsed ? link.label : ""}
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                      {link.icon}
                    </span>
                    {!collapsed && (
                      <span className="ml-3 text-sm font-medium">
                        {link.label}
                      </span>
                    )}
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
};
