import React, { useEffect, useState } from "react";
import {
  fetchNotifikasi,
  tambahNotifikasi,
  editNotifikasi,
  hapusNotifikasi
} from "../lib/apiNotifikasi";

export default function PengaturanNotifikasi() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    tipe: "Tagihan",
    aktif: 1,
    hari_reminder: 3,
    jam_reminder: "08:00:00",
    pesan: "Assalamualaikum, ini reminder pembayaran tagihan daycare. Mohon segera dilunasi."
  });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => { loadData(); }, []);
  async function loadData() {
    try {
      const res = await fetchNotifikasi();
      setData(res);
      setErrorMsg("");
    } catch { setErrorMsg("Gagal ambil data."); }
  }
  function openModal(isEdit = false, row = null) {
    setShowModal(true);
    if (isEdit && row) {
      setEditId(row.id);
      setForm({
        tipe: row.tipe,
        aktif: Number(row.aktif),
        hari_reminder: row.hari_reminder,
        jam_reminder: row.jam_reminder,
        pesan: row.pesan
      });
    } else {
      setEditId(null);
      setForm({
        tipe: "Tagihan",
        aktif: 1,
        hari_reminder: 3,
        jam_reminder: "08:00:00",
        pesan: "Assalamualaikum, ini reminder pembayaran tagihan daycare. Mohon segera dilunasi."
      });
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editId) await editNotifikasi({ ...form, id: editId });
      else await tambahNotifikasi(form);
      setShowModal(false); setEditId(null); setSuccessMsg("Berhasil disimpan!"); await loadData();
    } catch { setErrorMsg("Gagal simpan."); }
  }
  async function handleDelete(id) {
    if (!window.confirm("Hapus notifikasi ini?")) return;
    await hapusNotifikasi(id); await loadData();
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6 my-8">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-lg">Notifikasi & Reminder</div>
        <button className="px-3 py-2 rounded-xl bg-blue-500 text-white text-sm font-bold"
          onClick={() => openModal(false)}>+ Tambah</button>
      </div>
      <table className="w-full text-sm rounded-xl shadow border">
        <thead>
          <tr className="bg-blue-50 text-blue-700">
            <th>Tipe</th>
            <th>Aktif</th>
            <th>Hari Sebelum</th>
            <th>Jam</th>
            <th>Pesan</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0
            ? <tr><td colSpan={6} className="text-center p-3 text-gray-400">Belum ada data.</td></tr>
            : data.map(row =>
              <tr key={row.id} className="border-t">
                <td>{row.tipe}</td>
                <td>{row.aktif === "1" || row.aktif === 1 ? "Ya" : "Tidak"}</td>
                <td>{row.hari_reminder} hari</td>
                <td>{row.jam_reminder?.slice(0,5)}</td>
                <td className="whitespace-pre-wrap max-w-xs">{row.pesan}</td>
                <td>
                  <button className="text-blue-600 mx-1 underline" onClick={() => openModal(true, row)}>Edit</button>
                  <button className="text-red-600 mx-1 underline" onClick={() => handleDelete(row.id)}>Hapus</button>
                </td>
              </tr>)}
        </tbody>
      </table>
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[99999]">
          <form className="bg-white rounded-xl p-6 w-[420px] flex flex-col gap-3 shadow-xl"
            onSubmit={handleSubmit}>
            <div className="text-xl font-bold mb-2">{editId ? "Edit Notifikasi" : "Tambah Notifikasi"}</div>
            <div>
              <label className="block font-semibold mb-1">Tipe Notifikasi</label>
              <select className="w-full rounded-lg border px-3 py-2"
                value={form.tipe}
                onChange={e => setForm(f => ({ ...f, tipe: e.target.value }))}
                required>
                <option value="Tagihan">Tagihan</option>
                <option value="Pengumuman">Pengumuman</option>
                {/* Tambah tipe lain jika butuh */}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Aktif?</label>
              <select className="w-full rounded-lg border px-3 py-2"
                value={form.aktif}
                onChange={e => setForm(f => ({ ...f, aktif: e.target.value }))}
                required>
                <option value={1}>Ya</option>
                <option value={0}>Tidak</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Berapa hari sebelum jatuh tempo?</label>
              <input type="number" min="1" className="w-full rounded-lg border px-3 py-2"
                value={form.hari_reminder}
                onChange={e => setForm(f => ({ ...f, hari_reminder: e.target.value }))}
                required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Jam Reminder</label>
              <input type="time" className="w-full rounded-lg border px-3 py-2"
                value={form.jam_reminder}
                onChange={e => setForm(f => ({ ...f, jam_reminder: e.target.value }))}
                required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Pesan Notifikasi</label>
              <textarea className="w-full rounded-lg border px-3 py-2 min-h-[70px]"
                value={form.pesan}
                onChange={e => setForm(f => ({ ...f, pesan: e.target.value }))}
                required />
            </div>
            <div className="flex gap-2 mt-3">
              <button type="submit" className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-bold">{editId ? "Simpan" : "Tambah"}</button>
              <button type="button" className="flex-1 py-2 rounded-xl bg-gray-200" onClick={() => setShowModal(false)}>Batal</button>
            </div>
          </form>
        </div>
      )}
      {successMsg && <div className="text-green-700">{successMsg}</div>}
      {errorMsg && <div className="text-red-600">{errorMsg}</div>}
    </div>
  );
}
