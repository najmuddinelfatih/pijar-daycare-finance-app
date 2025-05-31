const API_URL = "https://pijarmontessoriislam.id/api/preferensi.php";

export async function fetchPreferensi() {
  const res = await fetch(`${API_URL}?aksi=get`);
  if (!res.ok) throw new Error("Gagal mengambil data preferensi");
  return await res.json();
}

export async function savePreferensi(data) {
  const form = new FormData();
  form.append("date_format", data.date_format);
  form.append("bahasa", data.bahasa);
  form.append("currency", data.currency);
  form.append("reminder_auto", data.reminder_auto);
  form.append("theme", data.theme);
  const res = await fetch(`${API_URL}?aksi=save`, { method: "POST", body: form });
  return await res.json();
}
