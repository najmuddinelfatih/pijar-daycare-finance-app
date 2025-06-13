import React, { useEffect, useState } from "react";
import {
  fetchKategori,
  tambahKategori,
  editKategori,
  hapusKategori,
} from "../lib/apiKategori"; // Sesuaikan path

export default function PengaturanKategori() {
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nama: "", jenis: "Pemasukan" });
  const [editId, setEditId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadKategori();
  }, []);

  async function loadKategori() {
    setLoading(true);
    try {
      const data = await fetchKategori();
      setKategori(data);
      setErrorMsg("");
    } catch {
      setErrorMsg("Gagal mengambil data kategori.");
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editId) {
        await editKategori({ ...form, id: editId });
      } else {
        await tambahKategori(form);
      }
      setShowForm(false);
      setForm({ nama: "", jenis: "Pemasukan" });
      setEditId(null);
      await loadKategori();
    } catch {
      setErrorMsg("Gagal menyimpan data. Cek koneksi/server.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus kategori ini?")) return;
    try {
      await hapusKategori(id);
      await loadKategori();
    } catch {
      setErrorMsg("Gagal menghapus data.");
    }
  }

  function handleEdit(kat) {
    setForm({ nama: kat.nama, jenis: kat.jenis });
    setEditId(kat.id);
    setShowForm(true);
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 my-8">
      <div className="flex justify-between mb-3">
        <div className="font-bold text-lg">Kategori Transaksi</div>
        <button
          className="px-3 py-1 rounded-xl bg-blue-500 text-white text-sm font-bold"
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm({ nama: "", jenis: "Pemasukan" });
          }}
        >
          + Tambah
        </button>
      </div>
      {errorMsg && <div className="text-red-600 mb-2">{errorMsg}</div>}
      {loading ? (
        <div>Memuat data...</div>
      ) : (
        <table className="w-full border text-sm mb-2">
          <thead>
            <tr className="bg-blue-50">
              <th className="py-2">Nama</th>
              <th className="py-2">Jenis</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {kategori.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-2 text-gray-400">
                  Belum ada data kategori.
                </td>
              </tr>
            ) : (
              kategori.map((kat) => (
                <tr key={kat.id} className="border-t">
                  <td className="py-1">{kat.nama}</td>
                  <td>{kat.jenis}</td>
                  <td className="flex gap-2 justify-center">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => handleEdit(kat)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(kat.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {showForm && (
        <form
          className="mt-3 bg-blue-50 rounded-xl p-3 flex flex-col gap-2"
          onSubmit={handleSubmit}
        >
          <div>
            <label>Nama Kategori</label>
            <input
              type="text"
              required
              className="w-full rounded border px-2 py-1"
              value={form.nama}
              onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
            />
          </div>
          <div>
            <label>Jenis</label>
            <select
              className="w-full rounded border px-2 py-1"
              value={form.jenis}
              onChange={(e) => setForm((f) => ({ ...f, jenis: e.target.value }))}
            >
              <option value="Pemasukan">Pemasukan</option>
              <option value="Pengeluaran">Pengeluaran</option>
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="flex-1 bg-blue-500 text-white py-1 rounded-xl font-bold"
              type="submit"
            >
              {editId ? "Simpan" : "Tambah"}
            </button>
            <button
              className="flex-1 bg-gray-200 py-1 rounded-xl"
              type="button"
              onClick={() => setShowForm(false)}
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
