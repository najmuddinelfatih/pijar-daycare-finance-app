const API_URL = "https://pijarmontessoriislam.id/api/transaksi.php";

// List transaksi
export async function fetchTransaksi() {
  const res = await fetch(`${API_URL}?aksi=list`);
  if (!res.ok) throw new Error("Gagal mengambil data transaksi");
  return await res.json();
}

// Tambah transaksi
export async function tambahTransaksi(dataBaru) {
  const form = new FormData();
  for (const key in dataBaru) {
    if (dataBaru[key] !== undefined && dataBaru[key] !== null) {
      form.append(key, dataBaru[key]);
    }
  }
  const res = await fetch(`${API_URL}?aksi=tambah`, {
    method: "POST",
    body: form,
  });
  return await res.json();
}

// Edit transaksi
export async function editTransaksi(dataEdit) {
  const form = new FormData();
  Object.keys(dataEdit).forEach(key => {
    if (key !== "bukti" && dataEdit[key] !== undefined && dataEdit[key] !== null) {
      form.append(key, dataEdit[key]);
    }
  });

  if (dataEdit.bukti instanceof File) {
    form.append("bukti", dataEdit.bukti);
  }

  const res = await fetch(`${API_URL}?aksi=edit`, {
    method: "POST",
    body: form,
  });

  try {
    const json = await res.json();
    console.log("✅ Response JSON:", json);
    return json;
  } catch (err) {
    console.error("❌ Gagal parsing JSON:", err);
    return { success: false, error: "Response bukan JSON" };
  }
}

// Hapus transaksi
export async function hapusTransaksi(id) {
  const form = new FormData();
  form.append("id", id);
  const res = await fetch(`${API_URL}?aksi=hapus`, {
    method: "POST",
    body: form,
  });
  return await res.json();
}
