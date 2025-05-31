// URL endpoint PHP API
const API_URL = "https://pijarmontessoriislam.id/api/kategori.php";

// Ambil semua data kategori
export async function fetchKategori() {
  const res = await fetch(`${API_URL}?aksi=list`);
  if (!res.ok) throw new Error("Gagal mengambil data kategori");
  return await res.json();
}

// Tambah kategori
export async function tambahKategori(dataBaru) {
  const form = new FormData();
  form.append("nama", dataBaru.nama);
  form.append("jenis", dataBaru.jenis);
  const res = await fetch(`${API_URL}?aksi=tambah`, {
    method: "POST",
    body: form,
  });
  return await res.json();
}

// Edit kategori
export async function editKategori(dataEdit) {
  const form = new FormData();
  form.append("id", dataEdit.id);
  form.append("nama", dataEdit.nama);
  form.append("jenis", dataEdit.jenis);
  const res = await fetch(`${API_URL}?aksi=edit`, {
    method: "POST",
    body: form,
  });
  return await res.json();
}

// Hapus kategori
export async function hapusKategori(id) {
  const form = new FormData();
  form.append("id", id);
  const res = await fetch(`${API_URL}?aksi=hapus`, {
    method: "POST",
    body: form,
  });
  return await res.json();
}
