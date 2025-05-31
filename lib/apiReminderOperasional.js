const API_URL = "https://pijarmontessoriislam.id/api/pengingat_operasional.php";

export async function fetchReminderOperasional(bulan_tahun) {
  const res = await fetch(`${API_URL}?aksi=list&bulan_tahun=${bulan_tahun}`);
  if (!res.ok) throw new Error("Gagal mengambil data reminder operasional");
  return await res.json();
}
export async function tambahReminderOperasional(data) {
  const form = new FormData();
  form.append("nama", data.nama);
  form.append("nominal", data.nominal);
  form.append("tanggal_rutin", data.tanggal_rutin);
  form.append("keterangan", data.keterangan);
  form.append("bulan_tahun", data.bulan_tahun);
  const res = await fetch(`${API_URL}?aksi=tambah`, { method: "POST", body: form });
  return await res.json();
}
export async function editReminderOperasional(data) {
  const form = new FormData();
  form.append("id", data.id);
  form.append("nama", data.nama);
  form.append("nominal", data.nominal);
  form.append("tanggal_rutin", data.tanggal_rutin);
  form.append("keterangan", data.keterangan);
  form.append("bulan_tahun", data.bulan_tahun);
  const res = await fetch(`${API_URL}?aksi=edit`, { method: "POST", body: form });
  return await res.json();
}
export async function hapusReminderOperasional(id) {
  const form = new FormData();
  form.append("id", id);
  const res = await fetch(`${API_URL}?aksi=hapus`, { method: "POST", body: form });
  return await res.json();
}
export async function doneReminderOperasional(id) {
  const form = new FormData();
  form.append("id", id);
  const res = await fetch(`${API_URL}?aksi=done`, { method: "POST", body: form });
  return await res.json();
}
export async function repeatReminderOperasional(bulan_lama, bulan_baru) {
  const form = new FormData();
  form.append("bulan_lama", bulan_lama);
  form.append("bulan_baru", bulan_baru);
  const res = await fetch(`${API_URL}?aksi=repeat`, { method: "POST", body: form });
  return await res.json();
}
export async function uncheckReminderOperasional(id) {
  const form = new FormData();
  form.append("id", id);
  const res = await fetch(
    "https://pijarmontessoriislam.id/api/pengingat_operasional.php?aksi=uncheck",
    { method: "POST", body: form }
  );
  return await res.json();
}
