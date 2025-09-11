import { hasPermission, hasAnyPermission } from './../utils/permissionUtils';
import { useAppSelector } from "@/app/store/hooks";
import { RootState } from "../store/store";
import { useMemo } from "react";
export const usePermission = () => {
  const user = useAppSelector((state) => state.user.user);
  const userPermissions = useMemo(() => {
    if (!user) return [];
    if (user.role === "Super Admin") {
      return [
        "create_firm",
        "update_firm",
        "delete_firm",
        "view_stats",
        "create_lawyer",
        "read_lawyer",
        "update_lawyer",
        "delete_lawyer",
        "create_client",
        "read_client",
        "update_client",
        "delete_client",
        "create_role",
        "assign_role",
        "create_case",
        "read_case",
        "update_case",
        "delete_case",
        "view_case_status",
        "update_case_status",
        "assign_lawyer_to_case",
        "view_case_documents",
        "upload_case_document",
        "delete_case_document",
      ];
    }
    return user.permissions || [];
  }, [user]);

  const hasPermission = (permission: string | string[]): boolean => {
    if (!user) return false;
    
    // Super Admin bypasses all permission checks
    if (user.role === "Super Admin") return true;
    
    if (Array.isArray(permission)) {
      // User needs ALL permissions in the array (AND logic)
      return permission.every(perm => userPermissions.includes(perm));
    }
    
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    
    // Super Admin bypasses all permission checks
    if (user.role === "Super Admin") return true;
    
    // User needs ANY permission in the array (OR logic)
    return permissions.some(perm => userPermissions.includes(perm));
  };

  const canAccessRoute = (requiredPermissions?: string[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return hasAnyPermission(requiredPermissions);
  };
   return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    canAccessRoute,
    userRole: user?.role,
    isAdmin: user?.role === "Super Admin",
    isFirmAdmin: user?.role === "Firm Admin",
    isLawyer: user?.role === "Lawyer"
  };
};
