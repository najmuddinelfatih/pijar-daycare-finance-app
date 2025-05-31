import React, { useEffect, useRef, useState } from "react";
import { getBackupInfo, downloadBackup, uploadBackup } from "../lib/apiBackup";

export default function PengaturanBackup() {
  const [info, setInfo] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInput = useRef();

  useEffect(() => {
    loadInfo();
  }, []);
  async function loadInfo() {
    try {
      setInfo(await getBackupInfo());
    } catch {
      setInfo({ info: "Gagal ambil info backup" });
    }
  }

  async function handleUpload(e) {
    setSuccessMsg(""); setErrorMsg("");
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadBackup(file);
      setSuccessMsg("Backup berhasil direstore!");
      await loadInfo();
    } catch {
      setErrorMsg("Restore gagal. Cek file backup!");
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-4 my-8">
      <div className="font-bold text-lg mb-2">Backup & Restore Data</div>
      <div className="mb-2">
        <b>Backup terakhir:</b> <span className="text-gray-600">{info.time}</span>
      </div>
      <div className="flex gap-4">
        <button className="bg-green-500 text-white py-2 px-4 rounded-xl font-bold"
          onClick={downloadBackup}>Download Backup (.sql)</button>
        <button className="bg-blue-500 text-white py-2 px-4 rounded-xl font-bold"
          onClick={() => fileInput.current.click()}>Upload Restore</button>
        <input
          type="file"
          accept=".sql"
          className="hidden"
          ref={fileInput}
          onChange={handleUpload}
        />
      </div>
      {successMsg && <div className="text-green-700">{successMsg}</div>}
      {errorMsg && <div className="text-red-600">{errorMsg}</div>}
      <div className="text-gray-500 text-sm mt-2">
        Backup database akan men-download seluruh data (tabel finance).  
        Restore hanya boleh dilakukan oleh admin dengan file backup valid.
        <br />Rekomendasi: Backup & restore utama tetap gunakan fitur cPanel/phpMyAdmin untuk keamanan maksimal.
      </div>
    </div>
  );
}
