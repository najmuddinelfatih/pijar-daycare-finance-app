import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Modal from "../components/Modal";
import dynamic from "next/dynamic";
import {
  Calendar, FileText, Coins, Eye, Hash, Edit, Trash2, Receipt
} from "lucide-react";
import jsPDF from "jspdf";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import Image from "next/image";
import {
  fetchTransaksi,
  tambahTransaksi,
  editTransaksi,
  hapusTransaksi,
} from "../lib/apiTransaksi";
import { fetchAkunKas } from "../lib/apiAkunKas";
import { fetchKategori } from "../lib/apiKategori";
import { hasAccess } from "../lib/akses";
import imageCompression from 'browser-image-compression';



const DataTable = dynamic(() => import("react-data-table-component"), { ssr: false });

const customStyles = {
  table: { style: { borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)' } },
  head: { style: { backgroundColor: '#e0f2fe', color: '#0284c7', fontWeight: 700, fontSize: 15, minHeight: 48 } },
  headRow: { style: { borderBottomWidth: 2, borderColor: '#bae6fd' } },
  rows: { style: { fontSize: 14, minHeight: 44, background: '#fff', borderBottom: '1px solid #e5e7eb' } },
  cells: { style: { padding: '10px 14px' } },
  pagination: { style: { fontSize: 13, padding: 12 } }
};

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return "";
  if (dateTimeStr.includes("T")) {
    const [date, time] = dateTimeStr.split("T");
    const [y, m, d] = date.split("-");
    const [hh, mm] = time.split(":");
    return `${d}/${m}/${y} ${hh}:${mm}`;
  }
  return dateTimeStr;
}

// =========== FORM ============
function FormTransaksi({ form, akunKas, kategoriList, onChange, onJenisChange, onAkunChange, onKategoriChange, onUpload, onSubmit, onDelete, isEdit }) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      {/* Tanggal & Waktu */}
      <div>
        <label className="block mb-2 font-bold text-gray-700 text-sm sm:text-base">Tanggal & Waktu</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"><Calendar size={18} /></span>
          <input
            type="datetime-local"
            name="tanggal"
            required
            value={form.tanggal}
            onChange={onChange}
            className="w-full rounded-2xl border-2 border-blue-200 focus:border-blue-500 outline-none px-10 py-3 bg-blue-50 text-sm sm:text-base font-medium transition"
          />
        </div>
      </div>
      {/* No Referensi */}
      <div>
        <label className="block mb-2 font-bold text-gray-700 text-sm sm:text-base">No Referensi <span className="text-xs font-normal text-gray-400">(opsional)</span></label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"><Hash size={18} /></span>
          <input
            type="text"
            name="referensi"
            value={form.referensi}
            onChange={onChange}
            placeholder="Contoh: 202405241102 / kosongkan jika tidak ada"
            className="w-full rounded-2xl border-2 border-blue-200 focus:border-blue-500 outline-none px-10 py-3 bg-blue-50 text-sm sm:text-base font-medium transition"
          />
        </div>
      </div>
      {/* Akun */}
      <div>
        <label className="block mb-2 font-bold text-gray-700 text-sm sm:text-base">Akun Kas/Bank</label>
        <select
          name="akun_id"
          required
          value={form.akun_id}
          onChange={onAkunChange}
          className="w-full rounded-2xl border-2 border-blue-200 focus:border-blue-500 outline-none px-4 py-3 bg-blue-50 text-sm sm:text-base font-medium transition"
        >
          <option value="">Pilih Akun</option>
          {akunKas.map(a => (
            <option key={a.id} value={a.id}>{a.nama}</option>
          ))}
        </select>
      </div>
      {/* Kategori */}
      <div>
        <label className="block mb-2 font-bold text-gray-700 text-sm sm:text-base">Kategori</label>
        <select
          name="kategori_id"
          required
          value={form.kategori_id}
          onChange={onKategoriChange}
          className="w-full rounded-2xl border-2 border-blue-200 focus:border-blue-500 outline-none px-4 py-3 bg-blue-50 text-sm sm:text-base font-medium transition"
        >
          <option value="">Pilih Kategori</option>
          {kategoriList.map(k => (
            <option key={k.id} value={k.id}>{k.nama} ({k.jenis})</option>
          ))}
        </select>
      </div>
      {/* Jenis */}
      <div>
        <label className="block mb-2 font-bold text-gray-700 text-sm sm:text-base">Jenis</label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="jenis"
              value="Pemasukan"
              checked={form.jenis === "Pemasukan"}
              onChange={onJenisChange}
              className="accent-blue-500"
              required
            />
            <span>Pemasukan</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="jenis"
              value="Pengeluaran"
              checked={form.jenis === "Pengeluaran"}
              onChange={onJenisChange}
              className="accent-blue-500"
              required
            />
            <span>Pengeluaran</span>
          </label>
        </div>
      </div>
      {/* Metode */}
      <div>
        <label className="block mb-2 font-bold text-gray-700 text-sm sm:text-base">Metode</label>
        <select
          name="metode"
          required
          value={form.metode}
          onChange={onChange}
          className="w-full rounded-2xl border-2 border-blue-200 focus:border-blue-500 outline-none px-4 py-3 bg-blue-50 text-sm sm:text-base font-medium transition"
        >
          <option value="Cash">Cash</option>
          <option value="Transfer">Transfer</option>
        </select>
      </div>
      {/* Upload Bukti */}
      <div>
        <label className="block mb-2 font-bold text-gray-700 text-sm sm:text-base">Bukti Transfer/Kwitansi/Nota</label>
        <input
          type="file"
          name="bukti"
          accept="image/*,application/pdf"
          onChange={onUpload}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {form.bukti && (
          <div className="mt-2 text-xs text-blue-500 font-mono">{form.bukti.name}</div>
        )}
      </div>
      {/* Deskripsi */}
      <div>
        <label className="block mb-2 font-bold text-gray-700 text-sm sm:text-base">Deskripsi</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"><FileText size={18} /></span>
          <input
            type="text"
            name="deskripsi"
            required
            value={form.deskripsi}
            onChange={onChange}
            placeholder="Contoh: Uang SPP Bulan Mei / Pembelian Buku"
            className="w-full rounded-2xl border-2 border-blue-200 focus:border-blue-500 outline-none px-10 py-3 bg-blue-50 text-sm sm:text-base font-medium transition"
          />
        </div>
      </div>
      {/* Jumlah */}
      <div>
        <label className="block mb-2 font-bold text-gray-700 text-sm sm:text-base">Jumlah</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"><Coins size={18} /></span>
          <input
            type="number"
            name="jumlah"
            required
            value={form.jumlah}
            onChange={onChange}
            placeholder="Contoh: 500000"
            className="w-full rounded-2xl border-2 border-blue-200 focus:border-blue-500 outline-none px-10 py-3 bg-blue-50 text-sm sm:text-base font-medium transition"
          />
        </div>
      </div>
      <button type="submit" className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition text-white font-bold py-3 rounded-2xl shadow-xl text-base sm:text-lg tracking-wide">
        Simpan
      </button>
      {isEdit && (
        <button
          type="button"
          className="mt-2 w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 transition text-white font-bold py-3 rounded-2xl shadow-xl text-base sm:text-lg tracking-wide"
          onClick={onDelete}
        >
          Hapus
        </button>
      )}
    </form>
  );
}


export default function Transaksi() {
  // ========== AUTENTIKASI & HOOKS ==========
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  // ========== STATE ==========
  const [data, setData] = useState([]);
  const [akunKas, setAkunKas] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [, setLoading] = useState(true);
  const [kategoriFilter, setKategoriFilter] = useState("");
  const [jenisFilter, setJenisFilter] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  // Form states
  const [addForm, setAddForm] = useState({ tanggal: "", referensi: "", akun_id: "", kategori_id: "", jenis: "Pemasukan", metode: "Cash", deskripsi: "", jumlah: "", bukti: null });
  const [editForm, setEditForm] = useState({ tanggal: "", referensi: "", akun_id: "", kategori_id: "", jenis: "Pemasukan", metode: "Cash", deskripsi: "", jumlah: "", bukti: null });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Bukti modal
  const [showBuktiModal, setShowBuktiModal] = useState(false);
  const [buktiUrl, setBuktiUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Search/filter
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (!user) {
        router.replace("/login");
      } else {
        setAuthChecked(true); // Sudah cek login, boleh render
      }
    }
  }, [router, authChecked]);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  // ===== FETCH DATA =====
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [dt, ak, kg] = await Promise.all([
          fetchTransaksi(),
          fetchAkunKas(),
          fetchKategori(),
        ]);
        setData(dt);
        setAkunKas(ak);
        setKategoriList(kg);
        setErrorMsg("");
      } catch {
        setErrorMsg("Gagal mengambil data dari server.");
      }
      setLoading(false);
    }
    loadAll();
  }, []);

  // Jika auth belum dicek, jangan render apapun (JANGAN render hooks lain!)
  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }
    if (!user) return null;

  // Handler tambah
  async function handleTambah(e) {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");
    try {
      const resp = await tambahTransaksi(addForm);
      if (!resp.success) throw new Error("Gagal tambah");
      setSuccessMsg("Transaksi berhasil ditambah!");
      setShowAddModal(false);
      const dt = await fetchTransaksi();
      setData(dt);
      setAddForm({
        tanggal: "",
        referensi: "",
        akun_id: "",
        kategori_id: "",
        jenis: "Pemasukan",
        metode: "Cash",
        deskripsi: "",
        jumlah: "",
        bukti: null,
      });
    } catch (e) {
      setErrorMsg("Gagal tambah transaksi. " + e.message);
    }
  }
  // Handler open edit
  function handleOpenEdit(trx) {
    setEditForm({
      tanggal: trx.tanggal?.slice(0, 16),
      referensi: trx.referensi || "",
      akun_id: trx.akun_id,
      kategori_id: trx.kategori_id,
      jenis: trx.jenis,
      metode: trx.metode,
      deskripsi: trx.deskripsi,
      jumlah: Math.abs(trx.jumlah),
      bukti: null,
    });
    setEditId(trx.id);
    setShowEditModal(true);
  }
  // Handler edit
  async function handleEdit(e) {
  e.preventDefault();
  setErrorMsg("");
  setSuccessMsg("");

  try {
    let buktiCompressed = null;

      // Jika user upload file baru, kompres dulu
      if (editForm.bukti instanceof File) {
        console.log("🔧 Mulai kompres edit...");
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        };
        const compressedBlob = await imageCompression(editForm.bukti, options);
        buktiCompressed = new File([compressedBlob], editForm.bukti.name, {
          type: editForm.bukti.type,
          lastModified: Date.now(),
        });
        console.log("✅ Kompres edit berhasil:", buktiCompressed);
      }

      // Buat payload lengkap untuk FormData
      const payload = {
        ...editForm,
        id: editId,
        bukti: buktiCompressed || null,
        bukti_bayar_old: editForm.bukti_bayar_old || "",
      };

      const resp = await editTransaksi(payload);
      if (!resp.success) throw new Error("Gagal edit");

      setSuccessMsg("Transaksi berhasil diubah!");
      setShowEditModal(false);
      setEditId(null);

      const dt = await fetchTransaksi();
      setData(dt);
    } catch (e) {
      setErrorMsg("Gagal edit transaksi. " + e.message);
    }
  }
  // Handler delete
  async function handleDeleteConfirm() {
    try {
      const resp = await hapusTransaksi(editId);
      if (!resp.success) throw new Error("Gagal hapus");
      setSuccessMsg("Transaksi berhasil dihapus!");
      setShowDeleteModal(false);
      setEditId(null);
      const dt = await fetchTransaksi();
      setData(dt);
    } catch (e) {
      setErrorMsg("Gagal hapus transaksi. " + e.message);
    }
  }

  // Handler file input
  async function handleAddChange(e) {
  const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (!file) return;

      // Kompres file gambar
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      try {
        const compressedBlob = await imageCompression(file, options);
        const compressedFile = new File([compressedBlob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });

        setAddForm(prev => ({ ...prev, [name]: compressedFile }));
      } catch (err) {
        console.error("Gagal kompres gambar:", err);
      }
    } else {
      setAddForm(prev => ({ ...prev, [name]: value }));
    }
  }
  
  async function handleEditChange(e) {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (!file) return;

      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      try {
        const compressedBlob = await imageCompression(file, options);
        const compressedFile = new File([compressedBlob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });

        setEditForm(prev => ({ ...prev, [name]: compressedFile }));
        console.log("✅ Kompres edit berhasil:", compressedFile);
      } catch (err) {
        console.error("❌ Gagal kompres (EDIT):", err);
      }
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  }
  function handleJenisChange(e) {
    setAddForm(f => ({ ...f, jenis: e.target.value }));
  }
  function handleJenisEditChange(e) {
    setEditForm(f => ({ ...f, jenis: e.target.value }));
  }
  function handleAkunChange(e) {
    setAddForm(f => ({ ...f, akun_id: e.target.value }));
  }
  function handleAkunEditChange(e) {
    setEditForm(f => ({ ...f, akun_id: e.target.value }));
  }
  function handleKategoriChange(e) {
    setAddForm(f => ({ ...f, kategori_id: e.target.value }));
  }
  function handleKategoriEditChange(e) {
    setEditForm(f => ({ ...f, kategori_id: e.target.value }));
  }

  // ===== Filtered data logic =====
  const filteredData = data.filter(row => {
    // FILTER KATEGORI
    if (kategoriFilter && row.kategori_id != kategoriFilter) return false;
    // FILTER JENIS
    if (jenisFilter && row.jenis !== jenisFilter) return false;
    // FILTER RENTANG TGL
    if (dateStart && row.tanggal < dateStart) return false;
    if (dateEnd && row.tanggal > dateEnd + "T23:59:59") return false;
    // FILTER SEARCH
    if (search &&
      !row.deskripsi.toLowerCase().includes(search.toLowerCase()) &&
      !row.referensi?.toLowerCase().includes(search.toLowerCase())
    ) return false;
    return true;
  });

  // === Perhitungan Saldo ===
  const saldoKas = data
  .filter(trx => trx.metode === "Cash")
  .reduce(
    (acc, trx) =>
      acc + (trx.jenis === "Pengeluaran"
        ? -Math.abs(Number(trx.jumlah))
        : Math.abs(Number(trx.jumlah))),
    0
  );

const saldoBank = data
  .filter(trx => trx.metode === "Transfer")
  .reduce(
    (acc, trx) =>
      acc + (trx.jenis === "Pengeluaran"
        ? -Math.abs(Number(trx.jumlah))
        : Math.abs(Number(trx.jumlah))),
    0
  );


  // Table columns
  const columns = [
    { name: "Tanggal", selector: row => formatDateTime(row.tanggal), minWidth: "120px" },
    { name: "No Ref", selector: row => row.referensi, minWidth: "90px" },
    {
      name: "Akun",
      selector: row => {
        const akun = akunKas.find(a => a.id == row.akun_id);
        return akun ? akun.nama : "";
      }, minWidth: "120px"
    },
    {
      name: "Kategori",
      selector: row => {
        const kat = kategoriList.find(k => k.id == row.kategori_id);
        return kat ? kat.nama : "";
      }, minWidth: "120px"
    },
    { name: "Jenis", selector: row => row.jenis, minWidth: "80px" },
    { name: "Metode", selector: row => row.metode, minWidth: "80px" },
    { name: "Deskripsi", selector: row => row.deskripsi, grow: 2 },
    {
      name: "Jumlah", selector: row =>
        <span className={`font-bold ${row.jenis === "Pemasukan" ? "text-green-600" : "text-red-600"}`}>
          {`Rp. ${Math.abs(row.jumlah).toLocaleString("id-ID")}`}
        </span>,
      minWidth: "110px",
      right: true
    },
    {
      name: "Bukti",
      selector: row =>
        row.bukti
          ? (
            <button
              className="text-blue-600 underline flex items-center gap-1"
              onClick={() => {
                setShowBuktiModal(true);
                setBuktiUrl(`https://pijarmontessoriislam.id/api/${row.bukti}`);
              }}
            >
              <Eye size={16} /> Lihat
            </button>
          )
          : "-",
      minWidth: "85px"
    },
    {
      name: "Aksi",
      minWidth: "170px",
      cell: row => (
        <div className="flex gap-2 justify-center">
          {/* Tombol Edit */}
          {hasAccess(user.role, "edit") && <button
            className="text-blue-600 hover:underline"
            onClick={() => handleOpenEdit(row)}
            title="Edit"
          >
            <Edit size={16} />
          </button>}
          {/* Tombol Hapus */}
          {hasAccess(user.role, "edit") && <button
            className="text-red-600 hover:underline"
            onClick={() => { setShowDeleteModal(true); setEditId(row.id); }}
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>}
          {/* Tombol Kwitansi: hanya jika Pemasukan */}
          {row.jenis === "Pemasukan" ? (
            hasAccess(user.role, "edit") && <button
              className="text-green-600 hover:underline"
              title="Download Kwitansi"
              onClick={() => handleDownloadKwitansi(row)}
            >
              <Receipt size={16} />
            </button>
          ) : (
            hasAccess(user.role, "edit") && <button
              className="text-gray-400 cursor-not-allowed"
              disabled
              title="Tidak ada Kwitansi"
            >
              <Receipt size={16} />
            </button>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true
    }
  ];

  // ========== Tambah function handleDownloadKwitansi ==========
  async function handleDownloadKwitansi(row) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Kwitansi Pembayaran", 14, 18);
    doc.setFontSize(11);
    doc.text(`Tanggal: ${formatDateTime(row.tanggal)}`, 14, 32);
    doc.text(`No. Referensi: ${row.referensi || "-"}`, 14, 40);
    doc.text(`Nama Kategori: ${kategoriList.find(k => k.id == row.kategori_id)?.nama || "-"}`, 14, 48);
    doc.text(`Jumlah: Rp${Number(row.jumlah).toLocaleString("id-ID")}`, 14, 56);
    doc.text(`Deskripsi: ${row.deskripsi}`, 14, 64);
    doc.text("Tanda Tangan: ____________________", 14, 90);
    doc.save(`kwitansi_${row.id}.pdf`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <main className="flex-1 px-2 sm:px-6 py-6 max-w-9/10 mx-auto w-full">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-500 mb-2">Transaksi Keuangan</h1>
            <div className="flex gap-4">
              <div className="bg-green-100 text-green-700 px-5 py-2 rounded-xl font-bold">
                Saldo Kas: Rp. {saldoKas.toLocaleString("id-ID")}
              </div>
              <div className="bg-blue-100 text-blue-700 px-5 py-2 rounded-xl font-bold">
                Saldo Bank: Rp. {saldoBank.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
          {hasAccess(user.role, "edit") && <button
            className="px-5 py-3 rounded-full bg-blue-500 text-white font-bold shadow-md hover:bg-blue-600 transition text-base"
            onClick={() => setShowAddModal(true)}
          >
            + Tambah Transaksi
          </button>}
        </div>
        <div className="mb-3 flex flex-wrap gap-2 items-center">
          {/* Filter Kategori */}
          <select
            className="border border-blue-300 rounded-xl px-3 py-2 text-sm w-full sm:w-48"
            value={kategoriFilter}
            onChange={e => setKategoriFilter(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {kategoriList.map(k => (
              <option key={k.id} value={k.id}>{k.nama} ({k.jenis})</option>
            ))}
          </select>
          {/* Filter Jenis */}
          <select
            className="border border-blue-300 rounded-xl px-3 py-2 text-sm w-full sm:w-40"
            value={jenisFilter}
            onChange={e => setJenisFilter(e.target.value)}
          >
            <option value="">Semua Jenis</option>
            <option value="Pemasukan">Pemasukan</option>
            <option value="Pengeluaran">Pengeluaran</option>
          </select>
          {/* Filter Tanggal */}
          <input
            type="date"
            className="border border-blue-300 rounded-xl px-3 py-2 text-sm w-full sm:w-40"
            value={dateStart}
            onChange={e => setDateStart(e.target.value)}
            placeholder="Dari tanggal"
          />
          <input
            type="date"
            className="border border-blue-300 rounded-xl px-3 py-2 text-sm w-full sm:w-40"
            value={dateEnd}
            onChange={e => setDateEnd(e.target.value)}
            placeholder="Sampai tanggal"
          />
          {/* Search */}
          <input
            type="text"
            className="border border-blue-300 rounded-xl px-3 py-2 text-sm w-full sm:w-60"
            placeholder="Cari deskripsi atau no referensi"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          customStyles={customStyles}
          responsive
          striped
          dense
          noHeader
        />

        {/* Modal Tambah */}
        <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Transaksi">
          <FormTransaksi
            form={addForm}
            akunKas={akunKas}
            kategoriList={kategoriList}
            onChange={handleAddChange}
            onJenisChange={handleJenisChange}
            onAkunChange={handleAkunChange}
            onKategoriChange={handleKategoriChange}
            onUpload={handleAddChange}
            onSubmit={handleTambah}
          />
        </Modal>
        {/* Modal Edit */}
        <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Transaksi">
          <FormTransaksi
            form={editForm}
            akunKas={akunKas}
            kategoriList={kategoriList}
            onChange={handleEditChange}
            onJenisChange={handleJenisEditChange}
            onAkunChange={handleAkunEditChange}
            onKategoriChange={handleKategoriEditChange}
            onUpload={handleEditChange}
            onSubmit={handleEdit}
            onDelete={() => { setShowEditModal(false); setShowDeleteModal(true); }}
            isEdit
          />
        </Modal>
        {/* Modal Delete */}
        <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Konfirmasi Hapus">
          <div className="text-center mb-6 text-gray-700 text-lg font-semibold">
            Apakah Anda yakin ingin menghapus transaksi ini?
          </div>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-2 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 text-gray-700"
              onClick={() => setShowDeleteModal(false)}>
              Batal
            </button>
            <button className="px-6 py-2 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow"
              onClick={handleDeleteConfirm}>
              Hapus
            </button>
          </div>
        </Modal>
        {/* Modal Bukti */}
        <Modal show={showBuktiModal} onClose={() => setShowBuktiModal(false)} title="Lihat Bukti">
          <div className="flex flex-col items-center gap-4 p-4">
            {!buktiUrl ? (
              <div className="text-gray-500 italic">Tidak ada bukti yang bisa ditampilkan</div>
            ) : buktiUrl.endsWith(".pdf") ? (
              <iframe
                key={buktiUrl}
                src={buktiUrl}
                title="Bukti PDF"
                className="w-full max-w-4xl h-[500px] border rounded-md shadow"
              />
            ) : (
              <Zoom>
                <Image
                  src={buktiUrl}
                  alt="Bukti Transfer"
                  width={600}
                  height={400}
                  className="rounded-lg shadow max-w-full h-auto"
                />
              </Zoom>
            )}
          </div>
        </Modal>
        {/* <Modal show={showBuktiModal} onClose={() => setShowBuktiModal(false)} title="Lihat Bukti">
          <div className="flex flex-col items-center gap-4 p-2">
            {buktiUrl && (
              buktiUrl.endsWith(".pdf") ? (
                <iframe
                  src={buktiUrl}
                  className="w-full h-[500px] border rounded"
                />
              ) : (
                <Zoom>
                  <img
                    src={buktiUrl}
                    alt="Bukti Transfer"
                    className="max-h-[400px] w-auto rounded shadow"
                  />
                </Zoom>
              )
            )}
          </div>
        </Modal> */}
        {errorMsg && <div className="text-red-600 text-sm mt-4">{errorMsg}</div>}
        {successMsg && <div className="text-green-700 text-sm mt-4">{successMsg}</div>}
      </main>
    </div>
    );
  }