import React, { useEffect, useState } from "react";
import { fetchTransaksi } from "../lib/apiTransaksi";
import Sidebar from "../components/Sidebar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

function formatTanggal(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
}

export default function Laporan() {
  const [transaksi, setTransaksi] = useState([]);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterMetode, setFilterMetode] = useState("");

  useEffect(() => {
    fetchTransaksi().then(setTransaksi);
  }, []);

  // Filter transaksi
  const filtered = transaksi.filter(t => {
    if (filterStart && t.tanggal < filterStart) return false;
    if (filterEnd && t.tanggal > filterEnd + "T23:59:59") return false;
    if (filterKategori && t.kategori !== filterKategori) return false;
    if (filterMetode && t.metode !== filterMetode) return false;
    return true;
  });

  // Rekap
  const totalPemasukan = filtered
    .filter(t => t.jenis === "Pemasukan")
    .reduce((a, b) => a + Math.abs(Number(b.jumlah)), 0);

  const totalPengeluaran = filtered
    .filter(t => t.jenis === "Pengeluaran")
    .reduce((a, b) => a + Math.abs(Number(b.jumlah)), 0);

  const saldoAkhir = totalPemasukan - totalPengeluaran;

  // Export Excel
  function exportExcel() {
    const exportData = filtered.map(t => ({
      "Tanggal": formatTanggal(t.tanggal),
      "Kategori": t.kategori,
      "Metode": t.metode,
      "Deskripsi": t.deskripsi,
      "Jenis": t.jenis,
      "Jumlah": `Rp. ${Math.abs(Number(t.jumlah)).toLocaleString("id-ID")}`,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "laporan_keuangan.xlsx");
  }

  // Export PDF
  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Laporan Keuangan", 14, 16);
    doc.autoTable({
      head: [["Tanggal", "Kategori", "Metode", "Deskripsi", "Jenis", "Jumlah"]],
      body: filtered.map(t => [
        formatTanggal(t.tanggal),
        t.kategori,
        t.metode,
        t.deskripsi,
        t.jenis,
        `Rp. ${Math.abs(Number(t.jumlah)).toLocaleString("id-ID")}`,
      ]),
      startY: 24,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129] }
    });
    doc.save("laporan_keuangan.pdf");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 px-2 sm:px-6 py-6 max-w-9/10 mx-auto w-full">
        <h1 className="text-2xl font-bold text-emerald-700 mb-6">Laporan Keuangan</h1>
        <div className="flex flex-wrap gap-3 mb-5">
          <input type="date" className="border rounded px-3 py-2 text-sm"
            value={filterStart} onChange={e => setFilterStart(e.target.value)} placeholder="Dari tanggal"/>
          <input type="date" className="border rounded px-3 py-2 text-sm"
            value={filterEnd} onChange={e => setFilterEnd(e.target.value)} placeholder="Sampai tanggal"/>
          <select className="border rounded px-3 py-2 text-sm"
            value={filterKategori} onChange={e => setFilterKategori(e.target.value)}>
            <option value="">Semua Kategori</option>
            <option value="Pemasukan">Pemasukan</option>
            <option value="Pengeluaran">Pengeluaran</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm"
            value={filterMetode} onChange={e => setFilterMetode(e.target.value)}>
            <option value="">Semua Metode</option>
            <option value="Cash">Cash</option>
            <option value="Transfer">Transfer</option>
          </select>
          <button className="bg-green-500 text-white rounded px-4 py-2 font-bold"
            onClick={exportExcel}>Export Excel</button>
          <button className="bg-blue-500 text-white rounded px-4 py-2 font-bold"
            onClick={exportPDF}>Export PDF</button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-100 p-4 rounded-xl">
            <div className="font-bold text-green-700 text-xs mb-1">Total Pemasukan</div>
            <div className="text-xl font-bold text-green-700">
              Rp. {totalPemasukan.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="bg-red-100 p-4 rounded-xl">
            <div className="font-bold text-red-700 text-xs mb-1">Total Pengeluaran</div>
            <div className="text-xl font-bold text-red-700">
              Rp. {totalPengeluaran.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="bg-blue-100 p-4 rounded-xl">
            <div className="font-bold text-blue-700 text-xs mb-1">Saldo Akhir</div>
            <div className="text-xl font-bold text-blue-700">
              Rp. {saldoAkhir.toLocaleString("id-ID")}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow text-xs sm:text-sm">
            <thead>
              <tr className="bg-emerald-100 text-emerald-800">
                <th className="py-2 px-2">Tanggal</th>
                <th>Kategori</th>
                <th>Metode</th>
                <th>Deskripsi</th>
                <th>Jenis</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) =>
                <tr key={i} className="border-t">
                  <td className="py-1 px-2">{formatTanggal(t.tanggal)}</td>
                  <td>{t.kategori}</td>
                  <td>{t.metode}</td>
                  <td>{t.deskripsi}</td>
                  <td className={t.jenis === "Pemasukan" ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                    {t.jenis}
                  </td>
                  <td className={t.jenis === "Pemasukan" ? "text-green-700 font-bold" : "text-red-600 font-bold"}>
                    Rp. {Math.abs(Number(t.jumlah)).toLocaleString("id-ID")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="h-10"></div>
      </main>
    </div>
  );
}
