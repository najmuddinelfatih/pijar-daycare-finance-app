import React, { useState, useEffect } from "react";
import { fetchUsers, tambahUser, editUser, hapusUser, resetPassword, toggleStatus } from "../lib/apiUser"; // Sesuaikan path & fungsi API
// Buatkan API sederhana di PHP/MySQL

export default function PengaturanHakAkses() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ nama: "", email: "", role: "Viewer", status: "Aktif" });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadUsers(); }, []);
  async function loadUsers() { setData(await fetchUsers()); }
  function openModal(isEdit = false, row = null) {
    setShowModal(true);
    setEditId(isEdit ? row.id : null);
    setForm(isEdit && row ? { ...row } : { nama: "", email: "", role: "Viewer", status: "Aktif" });
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (editId) await editUser({ ...form, id: editId });
    else await tambahUser(form);
    setShowModal(false); await loadUsers();
  }
  async function handleDelete(id) {
    if (window.confirm("Hapus user?")) await hapusUser(id);
    await loadUsers();
  }
  async function handleReset(id) {
    if (window.confirm("Reset password user ini?")) await resetPassword(id);
  }
  async function handleToggleStatus(id) {
    await toggleStatus(id);
    await loadUsers();
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6 my-8">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-lg">Manajemen User & Hak Akses</div>
        <button className="px-3 py-2 rounded-xl bg-blue-500 text-white text-sm font-bold"
          onClick={() => openModal(false)}>+ Tambah</button>
      </div>
      <table className="w-full text-sm rounded-xl shadow border">
        <thead>
          <tr className="bg-blue-50 text-blue-700">
            <th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0
            ? <tr><td colSpan={5} className="text-center p-3 text-gray-400">Belum ada user.</td></tr>
            : data.map(row =>
              <tr key={row.id} className="border-t">
                <td>{row.nama}</td><td>{row.email}</td><td>{row.role}</td>
                <td>{row.status}</td>
                <td>
                  <button className="text-blue-600 mx-1 underline" onClick={() => openModal(true, row)}>Edit</button>
                  <button className="text-red-600 mx-1 underline" onClick={() => handleDelete(row.id)}>Hapus</button>
                  <button className="text-yellow-600 mx-1 underline" onClick={() => handleReset(row.id)}>Reset PW</button>
                  <button className="text-green-600 mx-1 underline" onClick={() => handleToggleStatus(row.id)}>
                    {row.status === "Aktif" ? "Nonaktif" : "Aktifkan"}
                  </button>
                </td>
              </tr>)}
        </tbody>
      </table>
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[99999]">
          <form className="bg-white rounded-xl p-6 w-96 flex flex-col gap-3 shadow-xl"
            onSubmit={handleSubmit}>
            <div className="text-xl font-bold mb-2">{editId ? "Edit User" : "Tambah User"}</div>
            <input type="text" className="w-full rounded-lg border px-3 py-2" required
              placeholder="Nama" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} />
            <input type="email" className="w-full rounded-lg border px-3 py-2" required
              placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <select className="w-full rounded-lg border px-3 py-2"
              value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required>
              <option value="Admin">Admin</option>
              <option value="Keuangan">Keuangan</option>
              <option value="Viewer">Viewer</option>
            </select>
            <select className="w-full rounded-lg border px-3 py-2"
              value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} required>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
            <div className="flex gap-2 mt-3">
              <button type="submit" className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-bold">{editId ? "Simpan" : "Tambah"}</button>
              <button type="button" className="flex-1 py-2 rounded-xl bg-gray-200" onClick={() => setShowModal(false)}>Batal</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
