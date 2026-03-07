// Role-Based Access Control (RBAC) implementation
import type { UserRole, Permission } from '@/types/enhanced';

// Define role-permission mapping
export const rolePermissionMap: Record<UserRole, Permission[]> = {
  admin: [
    'view_all',
    'manage_users',
    'configure_system',
    'generate_reports',
    'manage_batteries',
  ],
  operator: [
    'view_all',
    'generate_reports',
    'manage_batteries',
  ],
  user: [
    'generate_reports',
  ],
};

// Permission checker utility
export const rbac = {
  // Check if user has permission
  hasPermission(userRole: UserRole, requiredPermission: Permission): boolean {
    return rolePermissionMap[userRole]?.includes(requiredPermission) ?? false;
  },

  // Check if user has any of the permissions
  hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.some((perm) => this.hasPermission(userRole, perm));
  },

  // Check if user has all permissions
  hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.every((perm) => this.hasPermission(userRole, perm));
  },

  // Get all permissions for role
  getPermissions(userRole: UserRole): Permission[] {
    return rolePermissionMap[userRole] ?? [];
  },

  // Validate access to resource
  canAccessResource(
    userRole: UserRole,
    resourceId: string,
    userId: string,
    ownerUserId: string
  ): boolean {
    // Admin can access everything
    if (userRole === 'admin') {
      return true;
    }
    // Other roles can only access their own resources
    return userId === ownerUserId;
  },

  // Check if user can perform action
  canPerformAction(
    userRole: UserRole,
    action: 'create' | 'read' | 'update' | 'delete',
    userId: string,
    ownerUserId?: string
  ): boolean {
    switch (action) {
      case 'create':
        return true; // All authenticated users can create

      case 'read':
        return userRole === 'admin' || (!ownerUserId || userId === ownerUserId);

      case 'update':
        return userRole === 'admin' || (!ownerUserId || userId === ownerUserId);

      case 'delete':
        return userRole === 'admin' || (!ownerUserId || userId === ownerUserId);

      default:
        return false;
    }
  },
};

// Feature-level access control
export const featureAccess = {
  canViewAnalytics: (userRole: UserRole): boolean => {
    return ['admin', 'operator'].includes(userRole);
  },

  canManageUsers: (userRole: UserRole): boolean => {
    return userRole === 'admin';
  },

  canConfigureSystem: (userRole: UserRole): boolean => {
    return userRole === 'admin';
  },

  canGenerateReports: (userRole: UserRole): boolean => {
    return ['admin', 'operator', 'user'].includes(userRole);
  },

  canAccessChatbot: (userRole: UserRole): boolean => {
    return true; // All users
  },

  canAccessNotifications: (userRole: UserRole): boolean => {
    return true; // All users
  },

  canAccessSettings: (userRole: UserRole): boolean => {
    return true; // All users
  },
};

// Protected component wrapper
export const checkAccess = {
  // Redirect if no permission
  requirePermission: (userRole: UserRole, requiredPermission: Permission) => {
    if (!rbac.hasPermission(userRole, requiredPermission)) {
      throw new Error(`Access Denied: Missing ${requiredPermission} permission`);
    }
  },

  // Redirect to settings if low permission
  requireRole: (userRole: UserRole, requiredRole: UserRole) => {
    const roleHierarchy: Record<UserRole, number> = {
      admin: 3,
      operator: 2,
      user: 1,
    };

    if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
      throw new Error(`Access Denied: Requires ${requiredRole} role`);
    }
  },
};
