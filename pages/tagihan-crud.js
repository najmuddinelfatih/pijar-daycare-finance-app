import React, { useEffect, useRef, useState } from "react";
import { fetchTagihan, tambahTagihan, editTagihan, hapusTagihan } from "../lib/apiTagihan";
import { Paperclip, CheckCircle, XCircle, Send } from "lucide-react";

export default function Tagihan() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nama_siswa: "",
    wali_wa: "",
    bulan: "",
    keterangan: "",
    nominal: "",
    status: "Belum Lunas",
    tgl_tagihan: "",
    bukti_bayar: null,
    bukti_bayar_old: ""
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const fileRef = useRef();

  useEffect(() => { loadData(); }, []);
  async function loadData() { setData(await fetchTagihan()); }

  function openModal(isEdit = false, row = null) {
    setShowModal(true);
    setEditId(isEdit ? row.id : null);
    setForm(isEdit && row ? {
      ...row,
      bukti_bayar: null,
      bukti_bayar_old: row.bukti_bayar || "",
    } : {
      nama_siswa: "", wali_wa: "", bulan: "", keterangan: "",
      nominal: "", status: "Belum Lunas", tgl_tagihan: "", bukti_bayar: null, bukti_bayar_old: ""
    });
  }

  function handleFile(e) {
    setForm(f => ({ ...f, bukti_bayar: e.target.files[0] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let res;
    if (editId) res = await editTagihan({ ...form, id: editId });
    else res = await tambahTagihan(form);
    if (res.success) setShowModal(false);
    loadData();
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus tagihan ini?")) return;
    await hapusTagihan(id);
    loadData();
  }

  function genWALink(row) {
    const pesan = `Assalamualaikum, berikut info tagihan daycare:
Nama: ${row.nama_siswa}
Bulan: ${row.bulan}
Nominal: Rp${parseInt(row.nominal).toLocaleString("id-ID")}
Keterangan: ${row.keterangan}
Status: ${row.status}

Mohon segera melakukan pembayaran. Terima kasih.`;
    return `https://wa.me/${row.wali_wa.replace(/^0/, "62")}?text=${encodeURIComponent(pesan)}`;
  }

  // Filter search
  const filtered = data.filter(row =>
    row.nama_siswa.toLowerCase().includes(search.toLowerCase()) ||
    row.bulan.toLowerCase().includes(search.toLowerCase()) ||
    row.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* <Sidebar /> */}
      <main className="flex-1 px-2 sm:px-6 py-6 max-w-9/10 mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <h1 className="text-2xl font-bold text-blue-500">Tagihan Siswa</h1>
          <button className="px-4 py-2 rounded-full bg-blue-500 text-white font-bold shadow hover:bg-blue-600"
            onClick={() => openModal(false)}>
            + Tambah Tagihan
          </button>
        </div>
        <div className="mb-3 flex gap-2">
          <input className="border rounded px-3 py-2 w-60" placeholder="Cari nama/bulan/status" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow overflow-hidden text-xs sm:text-sm">
            <thead>
              <tr className="bg-blue-100 text-blue-700">
                <th className="py-2 px-2">Nama Siswa</th>
                <th>No WA</th>
                <th>Bulan</th>
                <th>Keterangan</th>
                <th>Nominal</th>
                <th>Status</th>
                <th>Bukti</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row =>
                <tr key={row.id} className="border-t">
                  <td className="py-1 px-2">{row.nama_siswa}</td>
                  <td>{row.wali_wa}</td>
                  <td>{row.bulan}</td>
                  <td>{row.keterangan}</td>
                  <td>Rp{parseInt(row.nominal).toLocaleString("id-ID")}</td>
                  <td>
                    {row.status === "Lunas"
                      ? <span className="inline-flex items-center gap-1 text-green-600 font-bold"><CheckCircle size={16}/> Lunas</span>
                      : <span className="inline-flex items-center gap-1 text-red-500 font-bold"><XCircle size={16}/> Belum Lunas</span>}
                  </td>
                  <td>
                    {row.bukti_bayar
                      ? <a href={`/${row.bukti_bayar}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
                          <Paperclip size={16}/> Lihat
                        </a>
                      : "-"}
                  </td>
                  <td className="flex gap-1">
                    <button className="text-blue-600 underline" onClick={() => openModal(true, row)}>Edit</button>
                    <button className="text-red-600 underline" onClick={() => handleDelete(row.id)}>Hapus</button>
                    {row.status !== "Lunas" &&
                      <a href={genWALink(row)} target="_blank" rel="noopener noreferrer"
                        className="text-green-600 underline flex items-center gap-1" title="Kirim Reminder WA">
                        <Send size={16}/> WA
                      </a>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[99999]">
            <form className="bg-white rounded-xl p-6 w-96 flex flex-col gap-3 shadow-xl"
              onSubmit={handleSubmit}>
              <div className="text-xl font-bold mb-2">{editId ? "Edit Tagihan" : "Tambah Tagihan"}</div>
              <input type="text" required placeholder="Nama Siswa" className="w-full rounded-lg border px-3 py-2"
                value={form.nama_siswa} onChange={e => setForm(f => ({ ...f, nama_siswa: e.target.value }))} />
              <input type="text" required placeholder="No. WA Wali" className="w-full rounded-lg border px-3 py-2"
                value={form.wali_wa} onChange={e => setForm(f => ({ ...f, wali_wa: e.target.value }))} />
              <input type="text" required placeholder="Bulan (misal: Mei 2025)" className="w-full rounded-lg border px-3 py-2"
                value={form.bulan} onChange={e => setForm(f => ({ ...f, bulan: e.target.value }))} />
              <input type="text" placeholder="Keterangan" className="w-full rounded-lg border px-3 py-2"
                value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))} />
              <input type="number" required placeholder="Nominal (Rp)" className="w-full rounded-lg border px-3 py-2"
                value={form.nominal} onChange={e => setForm(f => ({ ...f, nominal: e.target.value }))} />
              <select className="w-full rounded-lg border px-3 py-2"
                value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} required>
                <option value="Belum Lunas">Belum Lunas</option>
                <option value="Lunas">Lunas</option>
              </select>
              <input type="date" placeholder="Tanggal Tagihan" className="w-full rounded-lg border px-3 py-2"
                value={form.tgl_tagihan} onChange={e => setForm(f => ({ ...f, tgl_tagihan: e.target.value }))} />
              <input type="file" ref={fileRef} accept="image/*,application/pdf" className="w-full"
                onChange={handleFile} />
              <div className="flex gap-2 mt-3">
                <button type="submit" className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-bold">{editId ? "Simpan" : "Tambah"}</button>
                <button type="button" className="flex-1 py-2 rounded-xl bg-gray-200" onClick={() => setShowModal(false)}>Batal</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
