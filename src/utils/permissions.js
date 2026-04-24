export function hasPermission(user, requiredPermission) {
  if (!requiredPermission) return true;
  if (!user) return false;

  const roles = user.roles || [];
  const permissions = user.permissions || [];

  if (roles.includes('admin-full') || roles.includes('super_admin')) return true;

  const required = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
  return required.some((permission) => permissions.includes(permission));
}

export function canAccessAny(user, permissions = []) {
  return permissions.some((permission) => hasPermission(user, permission));
}
