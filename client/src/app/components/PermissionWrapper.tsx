// components/PermissionWrapper.tsx
"use client";
import { ReactNode } from "react";
import { usePermission } from "@/app/hooks/usePermission";

interface PermissionWrapperProps {
  children: ReactNode;
  permissions?: string | string[]; // Required permissions
  anyPermission?: string[]; // User needs ANY of these permissions
  allPermissions?: string[]; // User needs ALL of these permissions
  roles?: string[]; // Allowed roles
  fallback?: ReactNode; // What to show if no permission
  showFallback?: boolean; // Whether to show fallback or hide completely
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  permissions,
  anyPermission,
  allPermissions,
  roles,
  fallback = null,
  showFallback = false,
}) => {
  const { hasPermission, hasAnyPermission, userRole } = usePermission();

  // Check role-based access first
  if (roles && roles.length > 0) {
    if (!userRole || !roles.includes(userRole)) {
      return showFallback ? <>{fallback}</> : null;
    }
  }

  // Check specific permission requirements
  let hasAccess = true;

  if (permissions) {
    hasAccess = hasPermission(permissions);
  }

  if (anyPermission && anyPermission.length > 0) {
    hasAccess = hasAccess && hasAnyPermission(anyPermission);
  }

  if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAccess && hasPermission(allPermissions);
  }

  if (!hasAccess) {
    return showFallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

// Higher-order component version
export const withPermission = <
  P extends object = object // generic type for component props
>(
  Component: React.ComponentType<P>,
  requiredPermissions?: string | string[],
  fallbackComponent?: React.ComponentType<P>
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { hasPermission } = usePermission();

    if (requiredPermissions && !hasPermission(requiredPermissions)) {
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent;
        return <FallbackComponent {...props} />;
      }
      return null;
    }

    return <Component {...props} />;
  };

  // Set display name for debugging & ESLint
  WrappedComponent.displayName = `withPermission(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
};

