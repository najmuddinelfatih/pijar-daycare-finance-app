import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar";
import { Eye, Bell, Settings, FileText, ShieldCheck, Save, HelpCircle, RefreshCcw, Paintbrush2 } from "lucide-react";
import PengaturanIdentitas from "../components/PengaturanIdentitas";
import PengaturanAkunKas from "../components/PengaturanAkunKas";
import PengaturanKategori from "../components/PengaturanKategori";
import PengaturanHakAkses from "../components/PengaturanHakAkses";
import PengaturanNotifikasi from "../components/PengaturanNotifikasi";
import PengaturanPreferensi from "../components/PengaturanPreferensi";
import PengaturanBackup from "../components/PengaturanBackup";
import PengaturanTema from "../components/PengaturanTema";
import PengaturanHelp from "../components/PengaturanHelp";


// Dummy komponen upload logo (cropping bisa dikembangkan)
// function LogoUploader({ value, onChange }) {
//   const fileInputRef = useRef();
//   const [preview, setPreview] = useState(value || "");
//   function handleFile(e) {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = ev => {
//       setPreview(ev.target.result);
//       onChange(ev.target.result);
//     };
//     reader.readAsDataURL(file);
//   }
//   return (
//     <div className="flex flex-col items-center gap-2">
//       <img src={preview || "/logo-daycare.png"} alt="Logo" className="h-20 w-20 object-contain border rounded-xl bg-gray-100" />
//       <button
//         className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500 text-white font-bold shadow hover:bg-blue-600 text-sm"
//         onClick={() => fileInputRef.current.click()}
//         type="button"
//       >
//         <Upload size={16} /> Upload Logo
//       </button>
//       <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFile} />
//     </div>
//   );
// }

export default function Pengaturan() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState("identitas");
  // const [akunForm, setAkunForm] = useState({ nama: "", tipe: "Kas", norek: "", ket: "" });
  // // const [showAkunForm, setShowAkunForm] = useState(false);
  // const [editAkunId, setEditAkunId] = useState(null);
  
  // const [kategoriForm, setKategoriForm] = useState({ nama: "", jenis: "Pemasukan" });
  // // const [showKategoriForm, setShowKategoriForm] = useState(false);
  // const [editKategoriId, setEditKategoriId] = useState(null);
  
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
  if (!authChecked) {
    // Boleh return loader, skeleton, atau <></> (blank)
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    // Atau: return null;
  }
  

  // // --- Fungsi CRUD dummy ---
  // function tambahAkun(e) {
  //   e.preventDefault();
  //   if (editAkunId) {
  //     setAkunKas(list => list.map(a => a.id === editAkunId ? { ...akunForm, id: editAkunId } : a));
  //   } else {
  //     setAkunKas(list => [...list, { ...akunForm, id: Date.now() }]);
  //   }
  //   setAkunForm({ nama: "", tipe: "Kas", norek: "", ket: "" });
  //   setShowAkunForm(false);
  //   setEditAkunId(null);
  // }
  // function editAkun(akun) {
  //   setAkunForm(akun);
  //   setEditAkunId(akun.id);
  //   setShowAkunForm(true);
  // }
  // function hapusAkun(id) {
  //   setAkunKas(list => list.filter(a => a.id !== id));
  // }
  // function tambahKategori(e) {
  //   e.preventDefault();
  //   if (editKategoriId) {
  //     setKategori(list => list.map(k => k.id === editKategoriId ? { ...kategoriForm, id: editKategoriId } : k));
  //   } else {
  //     setKategori(list => [...list, { ...kategoriForm, id: Date.now() }]);
  //   }
  //   setKategoriForm({ nama: "", jenis: "Pemasukan" });
  //   setShowKategoriForm(false);
  //   setEditKategoriId(null);
  // }
  // function editKategori(kat) {
  //   setKategoriForm(kat);
  //   setEditKategoriId(kat.id);
  //   setShowKategoriForm(true);
  // }
  // function hapusKategori(id) {
  //   setKategori(list => list.filter(k => k.id !== id));
  // }
  // function doBackup() {
  //   setBackupMsg("Backup berhasil didownload (dummy)!");
  //   setTimeout(() => setBackupMsg(""), 2000);
  // }
  // function doRestore(e) {
  //   setBackupMsg("Restore data berhasil (dummy)!");
  //   setTimeout(() => setBackupMsg(""), 2000);
  // }

  // UI Tab
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <Sidebar/>
      <main className="flex-1 px-2 sm:px-6 py-6 max-w-9/10 mx-auto w-full">
        <h1 className="text-xl font-bold text-blue-600 mb-5">Pengaturan Sistem</h1>
        <div className="flex gap-2 mb-6 flex-wrap">
          <button className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1 ${tab === "identitas" ? "bg-blue-600 text-white shadow" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`} onClick={() => setTab("identitas")}><Eye size={16}/>Identitas</button>
          <button className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1 ${tab === "akun" ? "bg-blue-600 text-white shadow" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`} onClick={() => setTab("akun")}><FileText size={16}/>Akun Kas & Bank</button>
          <button className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1 ${tab === "kategori" ? "bg-blue-600 text-white shadow" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`} onClick={() => setTab("kategori")}><Settings size={16}/>Kategori Transaksi</button>
          <button className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1 ${tab === "akses" ? "bg-blue-600 text-white shadow" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`} onClick={() => setTab("akses")}><ShieldCheck size={16}/>Hak Akses</button>
          <button className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1 ${tab === "notifikasi" ? "bg-blue-600 text-white shadow" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`} onClick={() => setTab("notifikasi")}><Bell size={16}/>Notifikasi</button>
          <button className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1 ${tab === "preferensi" ? "bg-blue-600 text-white shadow" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`} onClick={() => setTab("preferensi")}><Save size={16}/>Preferensi</button>
          <button className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1 ${tab === "backup" ? "bg-blue-600 text-white shadow" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`} onClick={() => setTab("backup")}><RefreshCcw size={16}/>Backup</button>
          <button className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1 ${tab === "tema" ? "bg-blue-600 text-white shadow" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`} onClick={() => setTab("tema")}><Paintbrush2 size={16}/>Tema</button>
          <button className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1 ${tab === "help" ? "bg-blue-600 text-white shadow" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`} onClick={() => setTab("help")}><HelpCircle size={16}/>Help</button>
        </div>

        {/* Tab Identitas */}
        {tab === "identitas" && <PengaturanIdentitas />}
        {/* Tab Akun Kas/Bank */}
        {tab === "akun" && <PengaturanAkunKas />}
        {/* Tab Kategori Transaksi */}
        {tab === "kategori" && <PengaturanKategori />}
        {/* Tab Hak Akses */}
        {tab === "akses" && <PengaturanHakAkses />}
        {/* Tab Notifikasi */}
        {tab === "notifikasi" && <PengaturanNotifikasi />}
        {/* Tab Preferensi */}
        {tab === "preferensi" && <PengaturanPreferensi />}
        {/* Tab Backup/Restore */}
        {tab === "backup" && <PengaturanBackup />}
        {/* Tab Tema/Branding */}
        {tab === "tema" && <PengaturanTema />}
        {/* Tab Help/Support */}
        {tab === "help" && <PengaturanHelp />}

      </main>
    </div>
  );
}