const API_URL = "https://pijarmontessoriislam.id/api/user.php";

// Ambil semua user
export async function fetchUsers() {
  const res = await fetch(`${API_URL}?aksi=list`);
  if (!res.ok) throw new Error("Gagal mengambil data user");
  return await res.json();
}

// Tambah user
export async function tambahUser(dataBaru) {
  const form = new FormData();
  form.append("nama", dataBaru.nama);
  form.append("email", dataBaru.email);
  form.append("role", dataBaru.role);
  form.append("status", dataBaru.status);
  const res = await fetch(`${API_URL}?aksi=tambah`, { method: "POST", body: form });
  return await res.json();
}

// Edit user
export async function editUser(dataEdit) {
  const form = new FormData();
  form.append("id", dataEdit.id);
  form.append("nama", dataEdit.nama);
  form.append("email", dataEdit.email);
  form.append("role", dataEdit.role);
  form.append("status", dataEdit.status);
  const res = await fetch(`${API_URL}?aksi=edit`, { method: "POST", body: form });
  return await res.json();
}

// Hapus user
export async function hapusUser(id) {
  const form = new FormData();
  form.append("id", id);
  const res = await fetch(`${API_URL}?aksi=hapus`, { method: "POST", body: form });
  return await res.json();
}

// Reset password user
export async function resetPassword(id) {
  const form = new FormData();
  form.append("id", id);
  const res = await fetch(`${API_URL}?aksi=resetpw`, { method: "POST", body: form });
  return await res.json();
}

// Toggle Aktif/Nonaktif User
export async function toggleStatus(id) {
  const form = new FormData();
  form.append("id", id);
  const res = await fetch(`${API_URL}?aksi=toggle`, { method: "POST", body: form });
  return await res.json();
}

export async function loginUser(email, password) {
  const form = new FormData();
  form.append("email", email);
  form.append("password", password);
  const res = await fetch("https://pijarmontessoriislam.id/api/user.php?aksi=login", {
    method: "POST",
    body: form
  });
  return await res.json();
}
