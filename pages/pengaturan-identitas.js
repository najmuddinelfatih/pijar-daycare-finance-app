import React, { useEffect, useRef, useState } from "react";
import { fetchIdentitas, updateIdentitas } from "../lib/apiIdentitas"; // sesuaikan path

export default function PengaturanIdentitas() {
  const [identitas, setIdentitas] = useState({ nama: "", logo: "" });
  const [loading, setLoading] = useState(true);
  const [formNama, setFormNama] = useState("");
  const [formLogo, setFormLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    loadIdentitas();
  }, []);

  async function loadIdentitas() {
    setLoading(true);
    try {
      const data = await fetchIdentitas();
      setIdentitas(data);
      setFormNama(data.nama || "");
      setPreviewLogo(data.logo ? (data.logo.startsWith("http") ? data.logo : "/" + data.logo) : "");
      setErrorMsg("");
    } catch (e) {
      setErrorMsg("Gagal mengambil data identitas.");
    }
    setLoading(false);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFormLogo(file);
    setPreviewLogo(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await updateIdentitas({ nama: formNama, logoFile: formLogo });
      setSuccessMsg("Data berhasil disimpan!");
      setFormLogo(null);
      await loadIdentitas();
    } catch (e) {
      setErrorMsg("Gagal menyimpan data.");
    }
  }


  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-4 my-8">
      <div className="font-bold text-lg mb-2">Identitas Daycare</div>
      {loading ? (
        <div>Memuat data...</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-semibold mb-1">Nama Daycare</label>
            <input
              type="text"
              className="w-full rounded-lg border px-3 py-2"
              value={formNama}
              onChange={e => setFormNama(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Logo Daycare</label>
            <div className="flex gap-3 items-center">
              <img
                src={previewLogo || "/pijar-daycare-logo.png"}
                alt="Logo"
                className="h-20 w-20 object-contain border rounded-xl bg-gray-100"
              />
              <button
                className="px-3 py-2 rounded-xl bg-blue-500 text-white font-bold shadow hover:bg-blue-600 text-sm"
                onClick={e => { e.preventDefault(); fileInputRef.current.click(); }}
                type="button"
              >
                Pilih Logo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="flex-1 bg-blue-500 text-white py-2 rounded-xl font-bold"
              type="submit"
            >
              Simpan
            </button>
          </div>
          {successMsg && <div className="text-green-700 font-semibold">{successMsg}</div>}
          {errorMsg && <div className="text-red-600">{errorMsg}</div>}
        </form>
      )}
    </div>
  );
}
