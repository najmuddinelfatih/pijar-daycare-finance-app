import React, { useEffect, useState } from "react";
import {
  fetchAkunKas,
  tambahAkunKas,
  editAkunKas,
  hapusAkunKas,
} from "../lib/apiAkunKas"; // Sesuaikan path

export default function PengaturanAkunKas() {
  const [akunKas, setAkunKas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nama: "", tipe: "Kas", norek: "", ket: "" });
  const [editId, setEditId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch data saat pertama kali komponen mount
  useEffect(() => {
    loadAkunKas();
  }, []);

  async function loadAkunKas() {
    setLoading(true);
    try {
      const data = await fetchAkunKas();
      setAkunKas(data);
      setErrorMsg("");
    } catch {
      setErrorMsg("Gagal mengambil data akun kas.");
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault(); // ✅ penting
    try {
      if (editId) {
        await editAkunKas({ ...form, id: editId });
      } else {
        await tambahAkunKas(form);
      }
      setShowForm(false);
      setForm({ nama: "", tipe: "Kas", norek: "", ket: "" });
      setEditId(null);
      await loadAkunKas();
    } catch {
      setErrorMsg("Gagal menyimpan data. Cek koneksi/server.");
    }
  }


  async function handleDelete(id) {
    if (!window.confirm("Hapus akun kas ini?")) return;
    try {
      await hapusAkunKas(id);
      await loadAkunKas();
    } catch {
      setErrorMsg("Gagal menghapus data.");
    }
  }

  function handleEdit(akun) {
    setForm({
      nama: akun.nama,
      tipe: akun.tipe,
      norek: akun.norek,
      ket: akun.ket,
    });
    setEditId(akun.id);
    setShowForm(true);
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 my-8">
      <div className="flex justify-between mb-3">
        <div className="font-bold text-lg">Akun Kas & Bank</div>
        <button
          className="px-3 py-1 rounded-xl bg-blue-500 text-white text-sm font-bold"
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm({ nama: "", tipe: "Kas", norek: "", ket: "" });
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
              <th className="py-2">Tipe</th>
              <th className="py-2">No. Rekening</th>
              <th className="py-2">Keterangan</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {akunKas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-2 text-gray-400">
                  Belum ada data akun kas/bank.
                </td>
              </tr>
            ) : (
              akunKas.map((akun) => (
                <tr key={akun.id} className="border-t">
                  <td className="py-1">{akun.nama}</td>
                  <td>{akun.tipe}</td>
                  <td>{akun.norek}</td>
                  <td>{akun.ket}</td>
                  <td className="flex gap-2 justify-center">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => handleEdit(akun)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(akun.id)}
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
            <label>Nama Akun</label>
            <input
              type="text"
              required
              className="w-full rounded border px-2 py-1"
              value={form.nama}
              onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
            />
          </div>
          <div>
            <label>Tipe</label>
            <select
              className="w-full rounded border px-2 py-1"
              value={form.tipe}
              onChange={(e) => setForm((f) => ({ ...f, tipe: e.target.value }))}
            >
              <option value="Kas">Kas</option>
              <option value="Bank">Bank</option>
            </select>
          </div>
          <div>
            <label>No. Rekening</label>
            <input
              type="text"
              className="w-full rounded border px-2 py-1"
              value={form.norek}
              onChange={(e) => setForm((f) => ({ ...f, norek: e.target.value }))}
            />
          </div>
          <div>
            <label>Keterangan</label>
            <input
              type="text"
              className="w-full rounded border px-2 py-1"
              value={form.ket}
              onChange={(e) => setForm((f) => ({ ...f, ket: e.target.value }))}
            />
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
