export const hasPermission = (permissions: string[], required: string): boolean => {
  return permissions.includes(required);
};

export const hasAnyPermission = (permissions: string[], required: string[]): boolean => {
  return required.some((perm) => permissions.includes(perm));
};
