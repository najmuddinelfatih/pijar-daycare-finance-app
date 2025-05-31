const API_URL = "https://pijarmontessoriislam.id/api/backup.php";

export async function getBackupInfo() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Gagal ambil info backup");
  return await res.json();
}

export function downloadBackup() {
  window.open(`${API_URL}?aksi=download`, "_blank");
}

export async function uploadBackup(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}?aksi=restore`, { method: "POST", body: form });
  return await res.json();
}
