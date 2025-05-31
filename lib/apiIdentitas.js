const API_URL = "https://pijarmontessoriislam.id/api/identitas.php";

// Ambil data identitas
export async function fetchIdentitas() {
  const res = await fetch(`${API_URL}?aksi=get`);
  if (!res.ok) throw new Error("Gagal mengambil data identitas");
  return await res.json();
}

// Update nama dan/atau logo daycare
export async function updateIdentitas({ nama, logoFile }) {
  const form = new FormData();
  if (nama) form.append("nama", nama);
  if (logoFile) form.append("logo", logoFile); // logoFile: file input
  const res = await fetch(`${API_URL}?aksi=update`, {
    method: "POST",
    body: form,
  });
  return await res.json();
}
