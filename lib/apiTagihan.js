const API_URL = "https://pijarmontessoriislam.id/api/tagihan.php";

// Ambil semua tagihan
export async function fetchTagihan() {
  const res = await fetch(`${API_URL}?aksi=list`);
  if (!res.ok) throw new Error("Gagal ambil data tagihan");
  return await res.json();
}

// Tambah tagihan (handle file upload)
export async function tambahTagihan(data) {
  const form = new FormData();
  Object.keys(data).forEach(key => form.append(key, data[key]));
  if (data.bukti_bayar) form.append("bukti_bayar", data.bukti_bayar);
  const res = await fetch(`${API_URL}?aksi=tambah`, { method: "POST", body: form });
  return await res.json();
}

// Edit tagihan
export async function editTagihan(data) {
  const form = new FormData();
  Object.keys(data).forEach(key => form.append(key, data[key]));
  if (data.bukti_bayar) form.append("bukti_bayar", data.bukti_bayar);
  const res = await fetch(`${API_URL}?aksi=edit`, { method: "POST", body: form });
  return await res.json();
}

// Hapus tagihan
export async function hapusTagihan(id) {
  const form = new FormData();
  form.append("id", id);
  const res = await fetch(`${API_URL}?aksi=hapus`, { method: "POST", body: form });
  return await res.json();
}
