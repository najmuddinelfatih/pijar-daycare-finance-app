// import React, { useEffect, useState, useRef } from "react";
// import {
//   fetchTransaksi,
//   tambahTransaksi,
//   editTransaksi,
//   hapusTransaksi,
// } from "../lib/apiTransaksi"; // sesuaikan path
// import { fetchAkunKas } from "../lib/apiAkunKas";
// import { fetchKategori } from "../lib/apiKategori";
// import Image from "next/image";

// export default function CRUDTransaksi() {
//   const [data, setData] = useState([]);
//   const [akunKas, setAkunKas] = useState([]);
//   const [kategori, setKategori] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [showForm, setShowForm] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [form, setForm] = useState({
//     tanggal: "",
//     akun_id: "",
//     kategori_id: "",
//     deskripsi: "",
//     jumlah: "",
//     jenis: "Pemasukan",
//     metode: "Cash",
//     referensi: "",
//     bukti: null,
//   });
//   const [previewBukti, setPreviewBukti] = useState("");
//   const [errorMsg, setErrorMsg] = useState("");
//   const [successMsg, setSuccessMsg] = useState("");
//   const fileInputRef = useRef();

//   useEffect(() => {
//     loadAll();
//   }, []);

//   async function loadAll() {
//     setLoading(true);
//     try {
//       const [dt, ak, kg] = await Promise.all([
//         fetchTransaksi(),
//         fetchAkunKas(),
//         fetchKategori(),
//       ]);
//       setData(dt);
//       setAkunKas(ak);
//       setKategori(kg);
//       setErrorMsg("");
//     } catch {
//       setErrorMsg("Gagal mengambil data dari server.");
//     }
//     setLoading(false);
//   }

//   function openForm(isEdit = false, trx = null) {
//     setShowForm(true);
//     setEditId(isEdit ? trx.id : null);
//     if (isEdit && trx) {
//       setForm({
//         tanggal: trx.tanggal ? trx.tanggal.slice(0, 16) : "",
//         akun_id: trx.akun_id,
//         kategori_id: trx.kategori_id,
//         deskripsi: trx.deskripsi,
//         jumlah: Math.abs(trx.jumlah),
//         jenis: trx.jenis,
//         metode: trx.metode || "Cash",
//         referensi: trx.referensi || "",
//         bukti: null,
//       });
//       setPreviewBukti(trx.bukti ? "/" + trx.bukti : "");
//     } else {
//       setForm({
//         tanggal: "",
//         akun_id: "",
//         kategori_id: "",
//         deskripsi: "",
//         jumlah: "",
//         jenis: "Pemasukan",
//         metode: "Cash",
//         referensi: "",
//         bukti: null,
//       });
//       setPreviewBukti("");
//     }
//   }

//   function handleFormChange(e) {
//     const { name, value, type, files } = e.target;
//     if (type === "file") {
//       setForm(f => ({ ...f, [name]: files[0] }));
//       setPreviewBukti(URL.createObjectURL(files[0]));
//     } else {
//       setForm(f => ({ ...f, [name]: value }));
//     }
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setErrorMsg(""); setSuccessMsg("");
//     try {
//       let resp;
//       const formData = { ...form };
//       // Buat tanggal full format (yyyy-MM-ddTHH:mm)
//       if (form.tanggal && form.tanggal.length === 16) {
//         formData.tanggal = form.tanggal.replace("T", " ") + ":00";
//       }
//       if (editId) {
//         formData.id = editId;
//         resp = await editTransaksi(formData);
//       } else {
//         resp = await tambahTransaksi(formData);
//       }
//       if (!resp.success) throw new Error("Gagal simpan");
//       setShowForm(false);
//       setEditId(null);
//       setForm({
//         tanggal: "",
//         akun_id: "",
//         kategori_id: "",
//         deskripsi: "",
//         jumlah: "",
//         jenis: "Pemasukan",
//         metode: "Cash",
//         referensi: "",
//         bukti: null,
//       });
//       setSuccessMsg("Data berhasil disimpan!");
//       await loadAll();
//     } catch {
//       setErrorMsg("Gagal menyimpan data. " + e.message);
//     }
//   }

//   async function handleDelete(id) {
//     if (!window.confirm("Hapus transaksi ini?")) return;
//     try {
//       await hapusTransaksi(id);
//       await loadAll();
//     } catch {
//       setErrorMsg("Gagal menghapus data.");
//     }
//   }

//   return (
//     <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 my-8">
//       <div className="flex justify-between mb-3">
//         <div className="font-bold text-lg">Transaksi Keuangan</div>
//         <button
//           className="px-3 py-1 rounded-xl bg-blue-500 text-white text-sm font-bold"
//           onClick={() => openForm(false)}
//         >
//           + Tambah
//         </button>
//       </div>
//       {errorMsg && <div className="text-red-600 mb-2">{errorMsg}</div>}
//       {successMsg && <div className="text-green-700 mb-2">{successMsg}</div>}
//       {loading ? (
//         <div>Memuat data...</div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full border text-sm mb-2">
//             <thead>
//               <tr className="bg-blue-50">
//                 <th className="py-2">Tanggal</th>
//                 <th className="py-2">Akun</th>
//                 <th className="py-2">Kategori</th>
//                 <th className="py-2">Deskripsi</th>
//                 <th className="py-2">Jumlah</th>
//                 <th className="py-2">Metode</th>
//                 <th className="py-2">Bukti</th>
//                 <th></th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.length === 0 ? (
//                 <tr>
//                   <td colSpan={8} className="text-center py-2 text-gray-400">
//                     Belum ada data transaksi.
//                   </td>
//                 </tr>
//               ) : (
//                 data.map(trx => (
//                   <tr key={trx.id} className="border-t">
//                     <td className="py-1">{trx.tanggal?.replace("T", " ").slice(0, 16)}</td>
//                     <td>{trx.akun_nama}</td>
//                     <td>{trx.kategori_nama}</td>
//                     <td>{trx.deskripsi}</td>
//                     <td className={`font-semibold text-right ${trx.jenis === "Pemasukan" ? "text-green-600" : "text-red-600"}`}>
//                       {Number(trx.jumlah).toLocaleString("id-ID")}
//                     </td>
//                     <td>{trx.metode}</td>
//                     <td>
//                       {trx.bukti ? (
//                         <a href={`https://pijarmontessoriislam.id/api/${trx.bukti}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Lihat</a>
//                       ) : (
//                         "-"
//                       )}
//                     </td>
//                     <td className="flex gap-2 justify-center">
//                       <button className="text-blue-600 hover:underline"
//                         onClick={() => openForm(true, trx)}>Edit</button>
//                       <button className="text-red-600 hover:underline"
//                         onClick={() => handleDelete(trx.id)}>Hapus</button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {showForm && (
//         <form
//           className="mt-3 bg-blue-50 rounded-xl p-3 flex flex-col gap-2"
//           onSubmit={handleSubmit}
//         >
//           <div>
//             <label>Tanggal & Jam</label>
//             <input
//               type="datetime-local"
//               required
//               className="w-full rounded border px-2 py-1"
//               name="tanggal"
//               value={form.tanggal}
//               onChange={handleFormChange}
//             />
//           </div>
//           <div>
//             <label>Akun Kas/Bank</label>
//             <select
//               name="akun_id"
//               required
//               className="w-full rounded border px-2 py-1"
//               value={form.akun_id}
//               onChange={handleFormChange}
//             >
//               <option value="">Pilih Akun</option>
//               {akunKas.map(a => (
//                 <option key={a.id} value={a.id}>{a.nama}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label>Kategori</label>
//             <select
//               name="kategori_id"
//               required
//               className="w-full rounded border px-2 py-1"
//               value={form.kategori_id}
//               onChange={handleFormChange}
//             >
//               <option value="">Pilih Kategori</option>
//               {kategori.map(k => (
//                 <option key={k.id} value={k.id}>{k.nama} ({k.jenis})</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label>Jenis</label>
//             <select
//               name="jenis"
//               required
//               className="w-full rounded border px-2 py-1"
//               value={form.jenis}
//               onChange={handleFormChange}
//             >
//               <option value="Pemasukan">Pemasukan</option>
//               <option value="Pengeluaran">Pengeluaran</option>
//             </select>
//           </div>
//           <div>
//             <label>Metode</label>
//             <select
//               name="metode"
//               required
//               className="w-full rounded border px-2 py-1"
//               value={form.metode}
//               onChange={handleFormChange}
//             >
//               <option value="Cash">Cash</option>
//               <option value="Transfer">Transfer</option>
//             </select>
//           </div>
//           <div>
//             <label>No Referensi (opsional)</label>
//             <input
//               type="text"
//               className="w-full rounded border px-2 py-1"
//               name="referensi"
//               value={form.referensi}
//               onChange={handleFormChange}
//             />
//           </div>
//           <div>
//             <label>Deskripsi</label>
//             <input
//               type="text"
//               required
//               className="w-full rounded border px-2 py-1"
//               name="deskripsi"
//               value={form.deskripsi}
//               onChange={handleFormChange}
//             />
//           </div>
//           <div>
//             <label>Jumlah</label>
//             <input
//               type="number"
//               required
//               className="w-full rounded border px-2 py-1"
//               name="jumlah"
//               value={form.jumlah}
//               onChange={handleFormChange}
//             />
//           </div>
//           <div>
//             <label>Bukti Transfer/Kwitansi (upload baru untuk update)</label>
//             <div className="flex gap-3 items-center">
//               {previewBukti && (
//                 <a href={previewBukti} target="_blank" rel="noopener noreferrer">
//                   <Image src={previewBukti} alt="Bukti" className="h-12 rounded border" />
//                 </a>
//               )}
//               <input
//                 type="file"
//                 accept="image/*,application/pdf"
//                 className="rounded border px-2 py-1"
//                 name="bukti"
//                 ref={fileInputRef}
//                 onChange={handleFormChange}
//               />
//             </div>
//           </div>
//           <div className="flex gap-2 mt-2">
//             <button
//               className="flex-1 bg-blue-500 text-white py-1 rounded-xl font-bold"
//               type="submit"
//             >
//               {editId ? "Simpan" : "Tambah"}
//             </button>
//             <button
//               className="flex-1 bg-gray-200 py-1 rounded-xl"
//               type="button"
//               onClick={() => setShowForm(false)}
//             >
//               Batal
//             </button>
//           </div>
//         </form>
//       )}
//     </div>
//   );
// }
