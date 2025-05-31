const API_URL = "https://pijarmontessoriislam.id/api/notifikasi.php";

// Ambil semua notifikasi
export async function fetchNotifikasi() {
  const res = await fetch(`${API_URL}?aksi=list`);
  if (!res.ok) throw new Error("Gagal mengambil data notifikasi");
  return await res.json();
}

// Tambah notifikasi
export async function tambahNotifikasi(dataBaru) {
  const form = new FormData();
  form.append("tipe", dataBaru.tipe);
  form.append("aktif", dataBaru.aktif);
  form.append("hari_reminder", dataBaru.hari_reminder);
  form.append("jam_reminder", dataBaru.jam_reminder);
  form.append("pesan", dataBaru.pesan);
  const res = await fetch(`${API_URL}?aksi=tambah`, { method: "POST", body: form });
  return await res.json();
}

// Edit notifikasi
export async function editNotifikasi(dataEdit) {
  const form = new FormData();
  form.append("id", dataEdit.id);
  form.append("tipe", dataEdit.tipe);
  form.append("aktif", dataEdit.aktif);
  form.append("hari_reminder", dataEdit.hari_reminder);
  form.append("jam_reminder", dataEdit.jam_reminder);
  form.append("pesan", dataEdit.pesan);
  const res = await fetch(`${API_URL}?aksi=edit`, { method: "POST", body: form });
  return await res.json();
}

// Hapus notifikasi
export async function hapusNotifikasi(id) {
  const form = new FormData();
  form.append("id", id);
  const res = await fetch(`${API_URL}?aksi=hapus`, { method: "POST", body: form });
  return await res.json();
}
