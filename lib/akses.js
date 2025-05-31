// lib/akses.js

// Aturan hak akses per role
const rolePermissions = {
  Viewer: ["view"],
  Editor: ["view", "add", "edit"],
  Admin: ["view", "add", "edit", "delete"],
};

// Fungsi utama
export function hasAccess(role, action) {
  if (!role || !action) return false;
  return rolePermissions[role]?.includes(action) || false;
}
