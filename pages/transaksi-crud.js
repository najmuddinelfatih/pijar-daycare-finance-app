import React, { useEffect, useRef, useState } from "react";
import { fetchTransaksi, tambahTransaksi, editTransaksi, hapusTransaksi } from "../lib/apiTransaksi";
import { fetchAkunKas } from "../lib/apiAkunKas";
import { fetchKategori } from "../lib/apiKategori";

export default function TransaksiCRUD() {
  const [data, setData] = useState([]);
  const [akunKas, setAkunKas] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    tanggal: "",
    akun_id: "",
    kategori_id: "",
    deskripsi: "",
    jumlah: "",
    jenis: "Pemasukan",
    metode: "Cash",
    referensi: "",
    bukti: null,
    bukti_old: "",
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const fileRef = useRef();

  useEffect(() => { loadAll(); }, []);
  async function loadAll() {
    const [dt, ak, kg] = await Promise.all([fetchTransaksi(), fetchAkunKas(), fetchKategori()]);
    setData(dt); setAkunKas(ak); setKategori(kg);
  }

  function openModal(isEdit = false, row = null) {
    setShowModal(true);
    setEditId(isEdit ? row.id : null);
    setForm(isEdit && row ? {
      tanggal: row.tanggal ? row.tanggal.slice(0, 16) : "",
      akun_id: row.akun_id,
      kategori_id: row.kategori_id,
      deskripsi: row.deskripsi,
      jumlah: Math.abs(row.jumlah),
      jenis: row.jenis,
      metode: row.metode || "Cash",
      referensi: row.referensi || "",
      bukti: null,
      bukti_old: row.bukti || "",
    } : {
      tanggal: "",
      akun_id: "",
      kategori_id: "",
      deskripsi: "",
      jumlah: "",
      jenis: "Pemasukan",
      metode: "Cash",
      referensi: "",
      bukti: null,
      bukti_old: "",
    });
  }

  function handleFile(e) {
    setForm(f => ({ ...f, bukti: e.target.files[0] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let res;
    if (editId) res = await editTransaksi({ ...form, id: editId });
    else res = await tambahTransaksi(form);
    if (res.success) setShowModal(false);
    loadAll();
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus transaksi ini?")) return;
    await hapusTransaksi(id);
    loadAll();
  }

  const filtered = data.filter(row =>
    (row.deskripsi?.toLowerCase().includes(search.toLowerCase()) ||
      row.referensi?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <main className="flex-1 px-2 sm:px-6 py-6 max-w-9/10 mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <h1 className="text-2xl font-bold text-blue-500">Transaksi Keuangan</h1>
          <button className="px-4 py-2 rounded-full bg-blue-500 text-white font-bold shadow hover:bg-blue-600"
            onClick={() => openModal(false)}>
            + Tambah Transaksi
          </button>
        </div>
        <div className="mb-3 flex gap-2">
          <input className="border rounded px-3 py-2 w-60" placeholder="Cari deskripsi/ref"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow overflow-hidden text-xs sm:text-sm">
            <thead>
              <tr className="bg-blue-100 text-blue-700">
                <th className="py-2 px-2">Tanggal</th>
                <th>Akun</th>
                <th>Kategori</th>
                <th>Jenis</th>
                <th>Metode</th>
                <th>Deskripsi</th>
                <th>Jumlah</th>
                <th>Bukti</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row =>
                <tr key={row.id} className="border-t">
                  <td className="py-1 px-2">{row.tanggal?.replace("T", " ").slice(0, 16)}</td>
                  <td>{akunKas.find(a => a.id == row.akun_id)?.nama || ""}</td>
                  <td>{kategori.find(k => k.id == row.kategori_id)?.nama || ""}</td>
                  <td>{row.jenis}</td>
                  <td>{row.metode}</td>
                  <td>{row.deskripsi}</td>
                  <td className={row.jenis === "Pemasukan" ? "text-green-600" : "text-red-600"}>
                    Rp{Number(row.jumlah).toLocaleString("id-ID")}
                  </td>
                  <td>
                    {row.bukti
                      ? <a href={`/${row.bukti}`} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 underline">Lihat</a>
                      : "-"}
                  </td>
                  <td className="flex gap-1">
                    <button className="text-blue-600 underline" onClick={() => openModal(true, row)}>Edit</button>
                    <button className="text-red-600 underline" onClick={() => handleDelete(row.id)}>Hapus</button>
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
              <div className="text-xl font-bold mb-2">{editId ? "Edit Transaksi" : "Tambah Transaksi"}</div>
              <input type="datetime-local" required className="w-full rounded-lg border px-3 py-2"
                value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} />
              <select className="w-full rounded-lg border px-3 py-2" required
                value={form.akun_id} onChange={e => setForm(f => ({ ...f, akun_id: e.target.value }))}>
                <option value="">Pilih Akun</option>
                {akunKas.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
              </select>
              <select className="w-full rounded-lg border px-3 py-2" required
                value={form.kategori_id} onChange={e => setForm(f => ({ ...f, kategori_id: e.target.value }))}>
                <option value="">Pilih Kategori</option>
                {kategori.map(k => <option key={k.id} value={k.id}>{k.nama} ({k.jenis})</option>)}
              </select>
              <select className="w-full rounded-lg border px-3 py-2" required
                value={form.jenis} onChange={e => setForm(f => ({ ...f, jenis: e.target.value }))}>
                <option value="Pemasukan">Pemasukan</option>
                <option value="Pengeluaran">Pengeluaran</option>
              </select>
              <select className="w-full rounded-lg border px-3 py-2" required
                value={form.metode} onChange={e => setForm(f => ({ ...f, metode: e.target.value }))}>
                <option value="Cash">Cash</option>
                <option value="Transfer">Transfer</option>
              </select>
              <input type="text" placeholder="No Referensi (opsional)" className="w-full rounded-lg border px-3 py-2"
                value={form.referensi} onChange={e => setForm(f => ({ ...f, referensi: e.target.value }))} />
              <input type="text" placeholder="Deskripsi" required className="w-full rounded-lg border px-3 py-2"
                value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} />
              <input type="number" placeholder="Jumlah" required className="w-full rounded-lg border px-3 py-2"
                value={form.jumlah} onChange={e => setForm(f => ({ ...f, jumlah: e.target.value }))} />
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
