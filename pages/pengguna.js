import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar";
import {
  fetchUsers, tambahUser, editUser, hapusUser,
  resetPassword, toggleStatus
} from "../lib/apiUser";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Edit, Trash2, KeyRound, UserCheck, UserX, Plus } from "lucide-react";

export default function Pengguna() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  // State
  const [users, setUsers] = useState([]);
  const [, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nama: "", email: "", role: "Viewer", status: "Aktif" });
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [resetId, setResetId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
    useEffect(() => {
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("user");
        if (!user) {
          router.replace("/login");
        } else {
          setAuthChecked(true); // Sudah cek login, boleh render dashboard
        }
      }
    }, []);
    // Fetch data
  useEffect(() => {
    loadUsers();
  }, [router, authChecked]);
  async function loadUsers() {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) { setErrorMsg("Gagal mengambil data user."); }
    setLoading(false);
  }
    if (!authChecked) {
      // Boleh return loader, skeleton, atau <></> (blank)
      return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
      // Atau: return null;
    }

  // Filter
  const filteredUsers = users.filter(u =>
    (!search || u.nama.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    && (!roleFilter || u.role === roleFilter)
  );

  // Handler
  function handleEdit(user) {
    setEditId(user.id);
    setForm({ ...user });
    setShowModal(true);
  }
  function handleDelete(user) {
    setDeleteId(user.id);
    setShowDelete(true);
  }
  function handleReset(user) {
    setResetId(user.id);
    setShowReset(true);
  }
  async function handleToggleStatus(user) {
    await toggleStatus(user.id);
    loadUsers();
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");
    try {
      if (editId) await editUser({ ...form, id: editId });
      else await tambahUser(form);
      setShowModal(false);
      setEditId(null);
      setForm({ nama: "", email: "", role: "Viewer", status: "Aktif" });
      setSuccessMsg(editId ? "Berhasil mengubah user." : "Berhasil menambah user.");
      loadUsers();
    } catch {
      setErrorMsg("Gagal simpan data user.");
    }
  }
  async function handleDeleteConfirm() {
    await hapusUser(deleteId);
    setShowDelete(false);
    loadUsers();
  }
  async function handleResetConfirm() {
    await resetPassword(resetId);
    setShowReset(false);
    alert("Password berhasil direset ke 123456!");
  }

  // Export Excel
  function exportExcel() {
    const exportData = filteredUsers.map(u => ({
      "Nama": u.nama, "Email": u.email, "Role": u.role, "Status": u.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pengguna");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "pengguna.xlsx");
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar/>
      <main className="flex-1 px-2 sm:px-6 py-6 max-w-9/10 mx-auto w-full">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Daftar Pengguna</h1>
        <div className="mb-4 flex flex-col sm:flex-row justify-between gap-2 items-start sm:items-center">
          <div className="flex gap-2">
            <input type="text" className="border border-blue-300 rounded-xl px-3 py-2 text-sm w-48"
              placeholder="Cari nama/email" value={search} onChange={e=>setSearch(e.target.value)} />
            <select className="border border-blue-300 rounded-xl px-3 py-2 text-sm w-40"
              value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
              <option value="">Semua Role</option>
              <option value="Admin">Admin</option>
              <option value="Keuangan">Keuangan</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white font-bold shadow hover:bg-blue-600"
            onClick={() => { setShowModal(true); setEditId(null); setForm({ nama: "", email: "", role: "Viewer", status: "Aktif" }); }}>
            <Plus size={18} /> Tambah User
          </button>
        </div>
        <div className="flex gap-2 mb-4">
          <button className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold shadow hover:bg-green-700 text-sm" onClick={exportExcel}>Export Excel</button>
          {/* <button className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold shadow hover:bg-blue-700 text-sm" onClick={exportPDF}>Export PDF</button> */}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow text-xs sm:text-sm">
            <thead>
              <tr className="bg-blue-100 text-blue-800">
                <th className="py-2 px-2 border-r border-gray-200">Nama</th>
                <th className="border-r border-gray-200">Email</th>
                <th className="py-2 px-2 text-center border-r border-gray-200">Role</th>
                <th className="text-center border-r border-gray-200">Status</th>
                <th className="min-w-[130px] text-center border-r border-gray-200">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) =>
                <tr key={i} className="border-t">
                  <td className="py-1 px-2 border-r border-gray-200">{u.nama}</td>
                  <td className="py-1 px-2 border-r border-gray-200">{u.email}</td>
                  <td className="text-center border-r border-gray-200">{u.role}</td>
                  <td className="text-center border-r border-gray-200">
                    <span className={u.status === "Aktif" ? "text-green-600 font-bold" : "text-gray-400 font-bold"}>
                      {u.status}
                    </span>
                  </td>
                  <td className="text-center border-r border-gray-200">
                    <div className="flex gap-2 justify-center">
                      <button className="text-blue-600 hover:underline" onClick={()=>handleEdit(u)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="text-red-600 hover:underline" onClick={()=>handleDelete(u)} title="Hapus">
                        <Trash2 size={16} />
                      </button>
                      <button className="text-yellow-600 hover:underline" onClick={()=>handleReset(u)} title="Reset Password">
                        <KeyRound size={16} />
                      </button>
                      <button
                        className={u.status === "Aktif" ? "text-green-600 hover:underline" : "text-gray-400 hover:underline"}
                        onClick={()=>handleToggleStatus(u)}
                        title={u.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
                      >
                        {u.status === "Aktif" ? <UserCheck size={16} /> : <UserX size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {filteredUsers.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-gray-400">Data kosong</td></tr>}
            </tbody>
          </table>
        </div>
        {/* Modal Tambah/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[99999]">
            <form
              className="bg-white rounded-xl p-6 w-96 flex flex-col gap-3 shadow-xl"
              onSubmit={handleSubmit}
            >
              <div className="text-xl font-bold mb-2">{editId ? "Edit User" : "Tambah User"}</div>
              <div>
                <label className="block font-semibold mb-1">Nama</label>
                <input type="text" className="w-full rounded-lg border px-3 py-2" required
                  value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input type="email" className="w-full rounded-lg border px-3 py-2" required
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Role</label>
                <select className="w-full rounded-lg border px-3 py-2" required
                  value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="Admin">Admin</option>
                  <option value="Keuangan">Keuangan</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Status</label>
                <select className="w-full rounded-lg border px-3 py-2" required
                  value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
              <div className="flex gap-2 mt-3">
                <button type="submit" className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-bold">{editId ? "Simpan" : "Tambah"}</button>
                <button type="button" className="flex-1 py-2 rounded-xl bg-gray-200" onClick={() => setShowModal(false)}>Batal</button>
              </div>
            </form>
          </div>
        )}
        {/* Modal Hapus */}
        {showDelete && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[99999]">
            <div className="bg-white rounded-xl p-6 w-80 text-center">
              <div className="font-bold mb-2">Yakin hapus user?</div>
              <button className="mr-3 px-4 py-2 rounded-xl bg-gray-200"
                onClick={() => setShowDelete(false)}>Batal</button>
              <button className="px-4 py-2 rounded-xl bg-red-500 text-white"
                onClick={handleDeleteConfirm}>Hapus</button>
            </div>
          </div>
        )}
        {/* Modal Reset Password */}
        {showReset && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[99999]">
            <div className="bg-white rounded-xl p-6 w-80 text-center">
              <div className="font-bold mb-2">Reset password user ini?</div>
              <button className="mr-3 px-4 py-2 rounded-xl bg-gray-200"
                onClick={() => setShowReset(false)}>Batal</button>
              <button className="px-4 py-2 rounded-xl bg-yellow-500 text-white"
                onClick={handleResetConfirm}>Reset</button>
            </div>
          </div>
        )}
        {errorMsg && <div className="text-red-600 text-sm mt-4">{errorMsg}</div>}
        {successMsg && <div className="text-green-700 text-sm mt-4">{successMsg}</div>}
      </main>
    </div>
  );
}
