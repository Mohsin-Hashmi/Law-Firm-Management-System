import { useAppSelector } from "@/app/store/hooks";

export const usePermission = () => {
  const permissions = useAppSelector((state) => state.user.user?.permissions);

  const hasPermission = (perm: string | string[]) => {
    if (!permissions) return false;

    if (Array.isArray(perm)) {
      return perm.some((p) => permissions.includes(p));
    }
    return permissions.includes(perm);
  };

  return { hasPermission };
};

