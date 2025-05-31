// URL endpoint PHP API
const API_URL = "https://pijarmontessoriislam.id/api/akun_kas.php";

// Ambil semua data akun kas
export async function fetchAkunKas() {
  const res = await fetch(`${API_URL}?aksi=list`);
  if (!res.ok) throw new Error("Gagal mengambil data akun kas");
  return await res.json();
}

// Tambah akun kas
export async function tambahAkunKas(dataBaru) {
  const form = new FormData();
  form.append("nama", dataBaru.nama);
  form.append("tipe", dataBaru.tipe);
  form.append("norek", dataBaru.norek);
  form.append("ket", dataBaru.ket);
  const res = await fetch(`${API_URL}?aksi=tambah`, {
    method: "POST",
    body: form,
  });
  return await res.json();
}

// Edit akun kas
export async function editAkunKas(dataEdit) {
  const form = new FormData();
  form.append("id", dataEdit.id);
  form.append("nama", dataEdit.nama);
  form.append("tipe", dataEdit.tipe);
  form.append("norek", dataEdit.norek);
  form.append("ket", dataEdit.ket);
  const res = await fetch(`${API_URL}?aksi=edit`, {
    method: "POST",
    body: form,
  });
  return await res.json();
}

// Hapus akun kas
export async function hapusAkunKas(id) {
  const form = new FormData();
  form.append("id", id);
  const res = await fetch(`${API_URL}?aksi=hapus`, {
    method: "POST",
    body: form,
  });
  return await res.json();
}
