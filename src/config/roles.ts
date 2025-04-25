const allRoles: Record<string, string[]> = {
    user: [],
    admin: ['getUsers', 'manageUsers'],
};

// Array of role names (e.g. ['user', 'admin'])
export const roles = Object.keys(allRoles) as Array<keyof typeof allRoles>;

// Map of role name to array of rights
export const roleRights: Map<string, string[]> = new Map(Object.entries(allRoles));