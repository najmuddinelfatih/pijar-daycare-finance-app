import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { fetchTagihan, tambahTagihan, editTagihan, hapusTagihan } from "../lib/apiTagihan";
import Modal from "../components/Modal";
import dynamic from "next/dynamic";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { Paperclip, CheckCircle, XCircle, Send } from "lucide-react";
import { hasAccess } from "../lib/akses";

const DataTable = dynamic(() => import("react-data-table-component"), { ssr: false });

const customStyles = {
  table: { style: { borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)' } },
  head: { style: { backgroundColor: '#e0f2fe', color: '#0d9488', fontWeight: 700, fontSize: 15, minHeight: 48 } },
  headRow: { style: { borderBottomWidth: 2, borderColor: '#99f6e4' } },
  rows: { style: { fontSize: 14, minHeight: 44, background: '#fff', borderBottom: '1px solid #e5e7eb' } },
  cells: { style: { padding: '10px 14px' } },
  pagination: { style: { fontSize: 13, padding: 12 } }
};

const defaultTemplate = `Assalamu'alaikum, Bapak/Ibu {nama_siswa} 🙏

Ini adalah pengingat tagihan untuk bulan {bulan}:
- Nama: {nama_siswa}
- Keterangan: {keterangan}
- Nominal: Rp{nominal}
- Status: {status}

Mohon segera melakukan pembayaran. Terima kasih!`;

function formatWA(no) {
  let clean = no.replace(/\D/g, "");
  if (clean.startsWith("0")) clean = "62" + clean.substring(1);
  if (!clean.startsWith("62")) clean = "62" + clean;
  return clean;
}

export default function Tagihan() {
  console.log("Tagihan rendered!");
  // === AUTH CHECK, ALL HOOKS ON TOP! ===
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // All useState
  const [data, setData] = useState([]);
  const [addForm, setAddForm] = useState({
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
  const [editForm, setEditForm] = useState({ ...addForm });
  const [editId, setEditId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showWAModal, setShowWAModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [waMsg, setWAMsg] = useState("");
  const [waTarget, setWATarget] = useState({});
  const [waTemplate, setWATemplate] = useState(
    typeof window !== "undefined" && localStorage.getItem("waTemplateTagihan")
      ? localStorage.getItem("waTemplateTagihan")
      : defaultTemplate
  );
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const fileRefAdd = useRef();
  const fileRefEdit = useRef();
  const [user, setUser] = useState(null);
  const [showBuktiModal, setShowBuktiModal] = useState(false);
  const [buktiPreviewUrl, setBuktiPreviewUrl] = useState("");


  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);
  // === LOGIN CHECK, NO RENDER UNTIL AUTH CHECKED ===
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (!user) {
        router.replace("/login");
      } else {
        setAuthChecked(true);
      }
    }
  }, [router, authChecked]);

    // === FETCH DATA ===
  useEffect(() => { loadData(); }, []);
  async function loadData() { setData(await fetchTagihan()); }

  // JANGAN render apapun sebelum cek login!
  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }
  if (!user) return null;
  
  // === HANDLERS ===
  const handleAddChange = e => setAddForm({ ...addForm, [e.target.name]: e.target.value });
  const handleEditChange = e => setEditForm({ ...editForm, [e.target.name]: e.target.value });
  const handleInputWAAdd = e => setAddForm({ ...addForm, wali_wa: formatWA(e.target.value) });
  const handleInputWAEdit = e => setEditForm({ ...editForm, wali_wa: formatWA(e.target.value) });
  const handleFileAdd = e => setAddForm(f => ({ ...f, bukti_bayar: e.target.files[0] }));
  const handleFileEdit = e => setEditForm(f => ({ ...f, bukti_bayar: e.target.files[0] }));

  const handleTambah = async e => {
    e.preventDefault();
    await tambahTagihan(addForm);
    setShowAddModal(false);
    setAddForm({
      nama_siswa: "", wali_wa: "", bulan: "", keterangan: "",
      nominal: "", status: "Belum Lunas", tgl_tagihan: "", bukti_bayar: null, bukti_bayar_old: ""
    });
    loadData();
  };

  const handleOpenEdit = item => {
    setEditForm({ ...item, bukti_bayar: null, bukti_bayar_old: item.bukti_bayar });
    setEditId(item.id);
    setShowEditModal(true);
  };

  const handleEdit = async e => {
    e.preventDefault();
    await editTagihan({ ...editForm, id: editId });
    setShowEditModal(false);
    setEditId(null);
    setEditForm({ ...addForm });
    loadData();
  };

  const handleDeleteConfirm = async () => {
    await hapusTagihan(deleteId);
    setShowDeleteModal(false);
    setDeleteId(null);
    setEditForm({ ...addForm });
    setAddForm({ ...addForm });
    setEditId(null);
    loadData();
  };

  // WhatsApp Template
  function replaceVars(template, item) {
    return template
      .replace(/{nama_siswa}/g, item.nama_siswa)
      .replace(/{bulan}/g, item.bulan)
      .replace(/{keterangan}/g, item.keterangan)
      .replace(/{nominal}/g, Number(item.nominal).toLocaleString("id-ID"))
      .replace(/{status}/g, item.status);
  }
  const handleOpenWA = item => {
    setWAMsg(replaceVars(waTemplate, item));
    setWATarget(item);
    setShowWAModal(true);
  };
  const handleSendWA = () => {
    const url = `https://wa.me/${waTarget.wali_wa}?text=${encodeURIComponent(waMsg)}`;
    window.open(url, "_blank");
    setShowWAModal(false);
  };
  const handleBulkWhatsApp = () => {
    filteredData
      .filter(item => item.status !== "Lunas")
      .forEach(item => {
        const msg = replaceVars(waTemplate, item);
        window.open(`https://wa.me/${item.wali_wa}?text=${encodeURIComponent(msg)}`, "_blank");
      });
  };
  const handleSaveTemplate = () => {
    setShowTemplateModal(false);
    if (typeof window !== "undefined") localStorage.setItem("waTemplateTagihan", waTemplate);
  };

  // Export Excel
  function exportExcel() {
    const exportData = data.map(item => ({
      "Nama": item.nama_siswa,
      "WA": item.wali_wa,
      "Bulan": item.bulan,
      "Keterangan": item.keterangan,
      "Nominal": item.nominal,
      "Status": item.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tagihan");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, "tagihan_siswa.xlsx");
  }

  // Filter
  const filteredData = data.filter(
    item =>
      (!filterText ||
        (item.nama_siswa && item.nama_siswa.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(filterText.toLowerCase()))) &&
      (!filterStatus || item.status === filterStatus)
  );
  
  // DataTable Columns
  const columns = [
    { name: "Nama", selector: row => row.nama_siswa, sortable: true },
    { name: "WA", selector: row => row.wali_wa, sortable: false, cell: row => <span className="font-mono text-s">{row.wali_wa}</span> },
    { name: "Bulan", selector: row => row.bulan, sortable: true },
    { name: "Keterangan", selector: row => row.keterangan, sortable: false },
    {
      name: "Nominal",
      selector: row => row.nominal,
      sortable: true,
      right: true,
      cell: row => <span className="text-blue-700 font-semibold">{Number(row.nominal).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span>
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      cell: row =>
        row.status === "Lunas" ? (
          <span className="text-green-600 font-bold flex items-center gap-1">
            <CheckCircle size={16} /> Lunas
          </span>
        ) : (
          <span className="text-red-500 font-bold flex items-center gap-1">
            <XCircle size={16} /> Belum Lunas
          </span>
        )
    },
    {
      name: "Bukti",
      cell: row =>
        row.bukti_bayar
          ? (
            <button
              onClick={() => {
                setShowBuktiModal(true);
                setBuktiPreviewUrl(`https://pijarmontessoriislam.id/api/${row.bukti_bayar}`);
              }}
              className="text-blue-600 underline flex items-center gap-1"
            >
              <Paperclip size={16} /> Lihat
            </button>
          ) : "-",
      minWidth: "90px"
    },
    {
      name: "Aksi",
      cell: row => (
        <div className="flex flex-wrap gap-2">
          {hasAccess(user.role, "edit") && <button
            className="text-blue-500 hover:text-blue-700 px-2 underline"
            onClick={() => handleOpenEdit(row)}
          >
            Edit
          </button>}
          {hasAccess(user.role, "edit") && <button
            className="text-red-500 hover:text-red-700 px-2 underline"
            onClick={() => {
              setShowDeleteModal(true);
              setDeleteId(row.id);
            }}
          >
            Hapus
          </button>}
          {row.status !== "Lunas" &&
            hasAccess(user.role, "edit") && <button
              className="text-green-600 hover:text-green-800 px-2 underline flex items-center gap-1"
              onClick={() => handleOpenWA(row)}
              title="Kirim WhatsApp"
            >
              <Send size={16} /> WA
            </button>}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: "140px"
    }
  ];

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <main className="flex-1 px-2 sm:px-6 py-6 max-w-9/10 mx-auto w-full">
        {/* Header + Filter/Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-teal-600">Tagihan Siswa</h1>
            {hasAccess(user.role, "edit") && <button
              className="mt-1 text-xs text-teal-500 hover:underline"
              onClick={() => setShowTemplateModal(true)}
            >
              📝 Edit Template WhatsApp
            </button>}
          </div>
          <div className="flex gap-2 flex-wrap">
            {hasAccess(user.role, "edit") && <button
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-400 to-blue-500 text-white font-bold shadow hover:brightness-110 transition text-sm"
              onClick={() => setShowAddModal(true)}
            >
              + Tambah Tagihan
            </button>}
            {hasAccess(user.role, "edit") && <button
              className="px-4 py-2 rounded-2xl bg-green-500 text-white font-bold shadow hover:bg-green-600 transition text-sm"
              onClick={handleBulkWhatsApp}
            >
              Kirim WhatsApp Massal
            </button>}
            {hasAccess(user.role, "edit") && <button
              className="px-4 py-2 rounded-2xl bg-blue-500 text-white font-bold shadow hover:bg-blue-600 transition text-sm"
              onClick={exportExcel}
            >
              Export Excel
            </button>}
          </div>
        </div>
        <div className="mb-3 flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="text"
            className="border border-teal-300 rounded-xl px-3 py-2 text-sm w-full sm:w-auto"
            placeholder="Cari Nama/Keterangan"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
          <select
            className="border border-teal-300 rounded-xl px-3 py-2 text-sm w-full sm:w-auto"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="Lunas">Lunas</option>
            <option value="Belum Lunas">Belum Lunas</option>
          </select>
        </div>
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          responsive
          striped
          dense
          noHeader
          customStyles={customStyles}
        />

        {/* Modal Tambah */}
        <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Tagihan">
          <form className="flex flex-col gap-4" onSubmit={handleTambah}>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Nama Siswa</label>
              <input
                type="text"
                name="nama_siswa"
                required
                value={addForm.nama_siswa}
                onChange={handleAddChange}
                placeholder="Nama Siswa"
                className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-4 py-3 bg-teal-50 text-sm sm:text-base font-medium transition"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Nomor WA Orangtua/Wali</label>
              <input
                type="text"
                name="wali_wa"
                required
                value={addForm.wali_wa}
                onChange={handleInputWAAdd}
                placeholder="08xxx atau 62xxx"
                className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-4 py-3 bg-teal-50 text-sm sm:text-base font-medium transition"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Bulan</label>
              <input
                type="text"
                name="bulan"
                required
                value={addForm.bulan}
                onChange={handleAddChange}
                placeholder="Mei 2024"
                className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-4 py-3 bg-teal-50 text-sm sm:text-base font-medium transition"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Keterangan</label>
              <input
                type="text"
                name="keterangan"
                required
                value={addForm.keterangan}
                onChange={handleAddChange}
                placeholder="Tagihan SPP/Buku, dll"
                className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-4 py-3 bg-teal-50 text-sm sm:text-base font-medium transition"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Nominal</label>
              <input
                type="number"
                name="nominal"
                required
                value={addForm.nominal}
                onChange={handleAddChange}
                placeholder="Contoh: 200000"
                className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-4 py-3 bg-teal-50 text-sm sm:text-base font-medium transition"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Status</label>
              <select
                name="status"
                value={addForm.status}
                onChange={handleAddChange}
                className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-4 py-3 bg-teal-50 text-sm sm:text-base font-medium transition"
              >
                <option value="Belum Lunas">Belum Lunas</option>
                <option value="Lunas">Lunas</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Tanggal Tagihan</label>
              <input
                type="date"
                name="tgl_tagihan"
                value={addForm.tgl_tagihan}
                onChange={handleAddChange}
                className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-4 py-3 bg-teal-50 text-sm sm:text-base font-medium transition"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Bukti Bayar (Opsional)</label>
              <input
                type="file"
                ref={fileRefAdd}
                accept="image/*,application/pdf"
                className="w-full"
                onChange={handleFileAdd}
              />
            </div>
            <button
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 transition text-white font-bold py-3 rounded-2xl shadow-xl text-base sm:text-lg tracking-wide"
            >
              Simpan
            </button>
          </form>
        </Modal>

        {/* Modal Edit */}
        <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Tagihan">
          <form className="flex flex-col gap-4" onSubmit={handleEdit}>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Nama Siswa</label>
              <input
                type="text"
                name="nama_siswa"
                required
                value={editForm.nama_siswa}
                onChange={handleEditChange}
                placeholder="Nama Siswa"
                className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-4 py-3 bg-teal-50 text-sm sm:text-base font-medium transition"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Nomor WA Orangtua/Wali</label>
              <input
                type="text"
                name="wali_wa"
                required
                value={editForm.wali_wa}
                onChange={handleInputWAEdit}
                placeholder="08xxx atau 62xxx"
                className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-4 py-3 bg-teal-50 text-sm sm:text-base font-medium transition"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Bulan</label>
              <input
                type="text"
                name="bulan"
                required
                value={editForm.bulan}
                onChange={handleEditChange}
                placeholder="Mei 2024"
                className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-4 py-3 bg-teal-50 text-sm sm:text-base font-medium transition"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Keterangan</label>
              <input
                type="text"
                name="keterangan"
                required
                value={editForm.keterangan}
                onChange={handleEditChange}
                placeholder="Tagihan SPP/Buku, dll"
                className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-4 py-3 bg-teal-50 text-sm sm:text-base font-medium transition"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Nominal</label>
              <input
                type="number"
                name="nominal"
                required
                value={editForm.nominal}
                onChange={handleEditChange}
                placeholder="Contoh: 200000"
                className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-4 py-3 bg-teal-50 text-sm sm:text-base font-medium transition"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Status</label>
              <select
                name="status"
                value={editForm.status}
                onChange={handleEditChange}
                className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-4 py-3 bg-teal-50 text-sm sm:text-base font-medium transition"
              >
                <option value="Belum Lunas">Belum Lunas</option>
                <option value="Lunas">Lunas</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Tanggal Tagihan</label>
              <input
                type="date"
                name="tgl_tagihan"
                value={editForm.tgl_tagihan}
                onChange={handleEditChange}
                className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-4 py-3 bg-teal-50 text-sm sm:text-base font-medium transition"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-gray-700 text-sm sm:text-base">Bukti Bayar (Opsional)</label>
              <input
                type="file"
                ref={fileRefEdit}
                accept="image/*,application/pdf"
                className="w-full"
                onChange={handleFileEdit}
              />
              {editForm.bukti_bayar_old &&
                <a href={`/${editForm.bukti_bayar_old}`} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-600 underline">
                  <Paperclip size={16}/> Lihat Bukti Saat Ini
                </a>
              }
            </div>
            <div className="flex gap-2 mt-3">
              <button type="submit" className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-bold">{editId ? "Simpan" : "Tambah"}</button>
              <button type="button" className="flex-1 py-2 rounded-xl bg-gray-200" onClick={() => setShowEditModal(false)}>Batal</button>
              <button type="button" className="flex-1 py-2 rounded-xl bg-red-500 text-white font-bold"
                onClick={() => {
                  setShowEditModal(false);
                  setShowDeleteModal(true);
                  setDeleteId(editId);
                }}>
                Hapus
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal Konfirmasi Hapus */}
        <Modal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Konfirmasi Hapus"
        >
          <div className="text-center mb-6 text-gray-700 text-lg font-semibold">
            Apakah Anda yakin ingin menghapus tagihan ini?
          </div>
          <div className="flex gap-4 justify-center">
            <button
              className="px-6 py-2 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 text-gray-700"
              onClick={() => setShowDeleteModal(false)}
            >
              Batal
            </button>
            <button
              className="px-6 py-2 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow disabled:opacity-50"
              onClick={handleDeleteConfirm}
              disabled={!deleteId}
            >
              Hapus
            </button>
          </div>
        </Modal>
        {/* Modal WhatsApp */}
        <Modal
          show={showWAModal}
          onClose={() => setShowWAModal(false)}
          title="Kirim WhatsApp"
        >
          <div className="mb-2 text-sm text-gray-700">
            <div className="mb-2">Akan dikirim ke: <span className="font-mono text-xs text-blue-700">{waTarget.wali_wa}</span></div>
            <textarea
              className="w-full h-32 border rounded-xl p-3 text-sm font-mono bg-teal-50 mb-2"
              value={waMsg}
              onChange={e => setWAMsg(e.target.value)}
            />
            <button
              className="w-full mt-2 py-2 rounded-xl font-bold bg-green-500 hover:bg-green-600 text-white shadow"
              onClick={handleSendWA}
            >
              Kirim WhatsApp
            </button>
          </div>
        </Modal>
        {/* Modal Template WhatsApp */}
        <Modal
          show={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          title="Template Pesan WhatsApp"
        >
          <div className="mb-2 text-gray-700 text-sm">
            <p>Edit template pesan WhatsApp di bawah.<br />Gunakan <code className="bg-gray-100 px-1 rounded">{"{nama_siswa}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{bulan}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{keterangan}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{nominal}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{status}"}</code>.</p>
            <textarea
              className="w-full h-40 border rounded-xl p-3 text-sm font-mono bg-teal-50 mb-2 mt-2"
              value={waTemplate}
              onChange={e => setWATemplate(e.target.value)}
            />
            <button
              className="w-full mt-2 py-2 rounded-xl font-bold bg-teal-500 hover:bg-teal-600 text-white shadow"
              onClick={handleSaveTemplate}
            >
              Simpan Template
            </button>
          </div>
        </Modal>
        <div className="h-12"></div>
        <Modal show={showBuktiModal} onClose={() => setShowBuktiModal(false)} title="Lihat Bukti Pembayaran">
          <div className="p-4 flex justify-center items-center min-h-[200px]">
            {buktiPreviewUrl.endsWith(".pdf") ? (
              <iframe
                src={buktiPreviewUrl}
                className="w-full h-[500px] border rounded"
                title="Bukti Pembayaran PDF"
              />
            ) : (
              <img
                src={buktiPreviewUrl}
                alt="Bukti Pembayaran"
                className="max-h-[500px] w-auto rounded shadow"
              />
            )}
          </div>
        </Modal>

      </main>
    </div>
  );
}
