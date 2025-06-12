import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchTransaksi } from "../lib/apiTransaksi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import DataTable from "react-data-table-component";


function formatTanggal(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
}

export default function Laporan() {
  const router = useRouter();
  const authChecked = useState(false);
  const [tab, setTab] = useState("aruskas");
  const [transaksi, setTransaksi] = useState([]);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  useEffect(() => { fetchTransaksi().then(setTransaksi); }, [router, authChecked]);
  const [windowWidth, setWindowWidth] = useState(1200); // default
    const marginChart = useMemo(() => {
      if (windowWidth < 640) {
        // Mobile (Tailwind sm breakpoint = 640px)
        return { top: 10, right: 20, left: 20, bottom: 10 };
      } else {
        // Desktop
        return { top: 20, right: 40, left: 40, bottom: 20 };
      }
    }, [windowWidth]);
  
    useEffect(() => {
      if (typeof window !== "undefined") {
        const handleResize = () => setWindowWidth(window.innerWidth);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }
    }, []);

  // Filter
  const filtered = transaksi.filter(t => {
    if (filterStart && t.tanggal < filterStart) return false;
    if (filterEnd && t.tanggal > filterEnd + "T23:59:59") return false;
    return true;
  });

  // Arus Kas
  function groupByMonth(list) {
    const byMonth = {};
    list.forEach(t => {
      const key = t.tanggal?.slice(0,7); // "YYYY-MM"
      if (!byMonth[key]) byMonth[key] = { bulan: key, pemasukan: 0, pengeluaran: 0 };
      if (t.jenis === "Pemasukan") byMonth[key].pemasukan += Math.abs(Number(t.jumlah));
      if (t.jenis === "Pengeluaran") byMonth[key].pengeluaran += Math.abs(Number(t.jumlah));
    });
    return Object.values(byMonth).sort((a, b) => a.bulan.localeCompare(b.bulan));
  }
  const grafikBulanan = groupByMonth(filtered);

  // Laba Rugi
  const totalPendapatan = filtered.filter(t => t.jenis === "Pemasukan").reduce((a, b) => a + Math.abs(Number(b.jumlah)), 0);
  const totalBiaya = filtered.filter(t => t.jenis === "Pengeluaran").reduce((a, b) => a + Math.abs(Number(b.jumlah)), 0);
  const labaBersih = totalPendapatan - totalBiaya;

  // Neraca (sederhana)
  const saldoKas = filtered.filter(t => t.metode === "Cash").reduce((a, t) =>
    a + (t.jenis === "Pengeluaran" ? -Math.abs(Number(t.jumlah)) : Math.abs(Number(t.jumlah))), 0);
  const saldoBank = filtered.filter(t => t.metode === "Transfer").reduce((a, t) =>
    a + (t.jenis === "Pengeluaran" ? -Math.abs(Number(t.jumlah)) : Math.abs(Number(t.jumlah))), 0);
  const totalAset = saldoKas + saldoBank;
  // Belum catat hutang atau piutang, bisa dikembangkan nanti

  // === Exporters ===
  function exportExcelArusKas() {
    const exportData = filtered.map(t => ({
      "Tanggal": formatTanggal(t.tanggal),
      "Kategori": t.kategori_nama || "-",
      "Jenis": t.jenis,
      "Metode": t.metode,
      "Deskripsi": t.deskripsi,
      "Jumlah": `Rp. ${Math.abs(Number(t.jumlah)).toLocaleString("id-ID")}`,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ArusKas");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "arus_kas.xlsx");
  }
  function exportPDFArusKas() {
    const doc = new jsPDF();
    doc.setFontSize(15);
    doc.text("Laporan Arus Kas", 14, 16);
    doc.autoTable({
      head: [["Tanggal", "Kategori", "Jenis", "Metode", "Deskripsi", "Jumlah"]],
      body: filtered.map(t => [
        formatTanggal(t.tanggal),
        t.kategori_nama || "-",
        t.jenis,
        t.metode,
        t.deskripsi,
        `Rp. ${Math.abs(Number(t.jumlah)).toLocaleString("id-ID")}`,
      ]),
      startY: 24,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [20, 184, 166] }
    });
    doc.save("arus_kas.pdf");
  }
  function exportExcelLabaRugi() {
    const exportData = [
      { "Pendapatan": `Rp. ${totalPendapatan.toLocaleString("id-ID")}` },
      { "Biaya": `Rp. ${totalBiaya.toLocaleString("id-ID")}` },
      { "Laba Bersih": `Rp. ${labaBersih.toLocaleString("id-ID")}` }
    ];
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LabaRugi");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "laba_rugi.xlsx");
  }
  function exportPDFLabaRugi() {
    const doc = new jsPDF();
    doc.setFontSize(15);
    doc.text("Laporan Laba Rugi", 14, 16);
    doc.autoTable({
      body: [
        ["Total Pendapatan", `Rp. ${totalPendapatan.toLocaleString("id-ID")}`],
        ["Total Biaya", `Rp. ${totalBiaya.toLocaleString("id-ID")}`],
        ["Laba Bersih", `Rp. ${labaBersih.toLocaleString("id-ID")}`],
      ],
      startY: 28,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [20, 184, 166] }
    });
    doc.save("laba_rugi.pdf");
  }
  function exportExcelNeraca() {
    const exportData = [
      { "Aset Kas": `Rp. ${saldoKas.toLocaleString("id-ID")}` },
      { "Aset Bank": `Rp. ${saldoBank.toLocaleString("id-ID")}` },
      { "Total Aset": `Rp. ${totalAset.toLocaleString("id-ID")}` },
    ];
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Neraca");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "neraca.xlsx");
  }
  function exportPDFNeraca() {
    const doc = new jsPDF();
    doc.setFontSize(15);
    doc.text("Laporan Neraca", 14, 16);
    doc.autoTable({
      body: [
        ["Aset Kas", `Rp. ${saldoKas.toLocaleString("id-ID")}`],
        ["Aset Bank", `Rp. ${saldoBank.toLocaleString("id-ID")}`],
        ["Total Aset", `Rp. ${totalAset.toLocaleString("id-ID")}`],
      ],
      startY: 28,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [20, 184, 166] }
    });
    doc.save("neraca.pdf");
  }

  // Pie data untuk Neraca
  const neracaPie = [
    { name: "Aset Kas", value: Math.max(saldoKas,0) },
    { name: "Aset Bank", value: Math.max(saldoBank,0) }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <main className="flex-1 px-2 sm:px-6 py-6 max-w-9/10 mx-auto w-full">
        <h1 className="text-2xl font-bold text-teal-700 mb-4">Laporan Keuangan</h1>
        <div className="flex gap-2 mb-6">
          <button className={`px-4 py-2 rounded-xl font-bold ${tab === "aruskas" ? "bg-teal-600 text-white shadow" : "bg-teal-100 text-teal-600 hover:bg-teal-200"}`} onClick={()=>setTab("aruskas")}>Arus Kas</button>
          <button className={`px-4 py-2 rounded-xl font-bold ${tab === "labarugi" ? "bg-teal-600 text-white shadow" : "bg-teal-100 text-teal-600 hover:bg-teal-200"}`} onClick={()=>setTab("labarugi")}>Laba Rugi</button>
          <button className={`px-4 py-2 rounded-xl font-bold ${tab === "neraca" ? "bg-teal-600 text-white shadow" : "bg-teal-100 text-teal-600 hover:bg-teal-200"}`} onClick={()=>setTab("neraca")}>Neraca</button>
        </div>
        <div className="flex flex-wrap gap-3 mb-5">
          <input type="date" className="border rounded px-3 py-2 text-sm"
            value={filterStart} onChange={e => setFilterStart(e.target.value)} placeholder="Dari tanggal"/>
          <input type="date" className="border rounded px-3 py-2 text-sm"
            value={filterEnd} onChange={e => setFilterEnd(e.target.value)} placeholder="Sampai tanggal"/>
        </div>
        {/* ============ TAB ARUS KAS ============= */}
        {tab === "aruskas" && (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-100 p-4 rounded-xl">
                <div className="font-bold text-green-700 text-xs mb-1">Total Pemasukan</div>
                <div className="text-xl font-bold text-green-700">
                  Rp. {filtered.filter(t => t.jenis === "Pemasukan").reduce((a, b) => a + Math.abs(Number(b.jumlah)), 0).toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-red-100 p-4 rounded-xl">
                <div className="font-bold text-red-700 text-xs mb-1">Total Pengeluaran</div>
                <div className="text-xl font-bold text-red-700">
                  Rp. {filtered.filter(t => t.jenis === "Pengeluaran").reduce((a, b) => a + Math.abs(Number(b.jumlah)), 0).toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <div className="font-bold text-blue-700 text-xs mb-1">Saldo Akhir</div>
                <div className="text-xl font-bold text-blue-700">
                  Rp. {(filtered.filter(t => t.jenis === "Pemasukan").reduce((a, b) => a + Math.abs(Number(b.jumlah)), 0) -
                    filtered.filter(t => t.jenis === "Pengeluaran").reduce((a, b) => a + Math.abs(Number(b.jumlah)), 0)
                  ).toLocaleString("id-ID")}
                </div>
              </div>
            </div>
            {/* Grafik Arus Kas Bulanan */}
            <div className="mb-8 bg-white rounded-xl shadow p-4">
              <div className="font-bold mb-2 text-sm">Grafik Arus Kas Bulanan</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={grafikBulanan}
                  margin={marginChart} // ← pakai yang responsif
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="bulan"
                    tick={{ fontSize: 11, fontWeight: 'bold', fill: '#1e293b' }}
                  />
                  <YAxis
                    domain={[0, 'auto']}
                    tickFormatter={(v) => `Rp. ${Number(v).toLocaleString("id-ID")}`}
                    tick={{ fontSize: 11, fontWeight: 'bold', fill: '#1e293b' }}
                  />
                  <Tooltip
                    formatter={(v) => `Rp. ${Number(v).toLocaleString("id-ID")}`}
                  />
                  <Legend />
                  <Bar dataKey="pemasukan" fill="#14b8a6" name="Pemasukan" />
                  <Bar dataKey="pengeluaran" fill="#ef4444" name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Tabel Detail */}
            <div className="bg-white rounded-xl shadow p-3 mt-4">
              <DataTable
                columns={[
                  {
                    name: "Tanggal",
                    selector: row => formatTanggal(row.tanggal),
                    minWidth: "110px",
                    cell: row => <span className=" border-gray-200 pr-2">{formatTanggal(row.tanggal)}</span>
                  },
                  {
                    name: "Kategori",
                    selector: row => row.kategori_nama || "-",
                    minWidth: "120px",
                    cell: row => <span className=" border-gray-200 pr-2">{row.kategori_nama || "-"}</span>
                  },
                  {
                    name: "Jenis",
                    selector: row => row.jenis,
                    minWidth: "110px",
                    cell: row => <span className={` border-gray-200 pr-2 ${row.jenis === "Pemasukan" ? "text-green-600 font-bold" : "text-red-500 font-bold"}`}>{row.jenis}</span>
                  },
                  {
                    name: "Metode",
                    selector: row => row.metode,
                    minWidth: "100px",
                    cell: row => <span className=" border-gray-200 pr-2">{row.metode}</span>
                  },
                  {
                    name: "Deskripsi",
                    selector: row => row.deskripsi,
                    minWidth: "160px",
                    cell: row => <span className=" border-gray-200 pr-2">{row.deskripsi}</span>
                  },
                  {
                    name: "Jumlah",
                    selector: row => `Rp. ${Math.abs(Number(row.jumlah)).toLocaleString("id-ID")}`,
                    minWidth: "120px",
                    right: true,
                    cell: row =>
                      <span className={`font-bold ${row.jenis === "Pemasukan" ? "text-green-700" : "text-red-600"}`}>
                        Rp. {Math.abs(Number(row.jumlah)).toLocaleString("id-ID")}
                      </span>
                  }
                ]}
                data={filtered}
                pagination
                highlightOnHover
                striped
                dense
                responsive
                noHeader
                customStyles={{
                  headCells: {
                    style: { fontWeight: "bold", background: "#ccfbf1", color: "#134e4a" }
                  },
                  cells: {
                    style: { borderRight: "1px solid #e5e7eb" }
                  }
                }}
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button className="bg-green-500 text-white rounded px-4 py-2 font-bold"
                onClick={exportExcelArusKas}>Export Excel</button>
              <button className="bg-blue-500 text-white rounded px-4 py-2 font-bold"
                onClick={exportPDFArusKas}>Export PDF</button>
            </div>
          </>
        )}

        {/* ============ TAB LABA RUGI ============= */}
        {tab === "labarugi" && (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-100 p-4 rounded-xl">
                <div className="font-bold text-green-700 text-xs mb-1">Total Pendapatan</div>
                <div className="text-xl font-bold text-green-700">
                  Rp. {totalPendapatan.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-red-100 p-4 rounded-xl">
                <div className="font-bold text-red-700 text-xs mb-1">Total Biaya</div>
                <div className="text-xl font-bold text-red-700">
                  Rp. {totalBiaya.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <div className="font-bold text-blue-700 text-xs mb-1">Laba Bersih</div>
                <div className={`text-xl font-bold ${labaBersih >= 0 ? "text-blue-700" : "text-red-700"}`}>
                  Rp. {labaBersih.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
            {/* PieChart Pendapatan vs Biaya */}
            <div className="mb-8 bg-white rounded-xl shadow p-4">
              <div className="font-bold mb-2 text-sm">Grafik Komposisi Pendapatan vs Biaya</div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={[
                    { name: "Pendapatan", value: totalPendapatan },
                    { name: "Biaya", value: totalBiaya }
                  ]}
                  dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                    {[
                      <Cell key="pendapatan" fill="#14b8a6" />,
                      <Cell key="biaya" fill="#ef4444" />
                    ]}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-2 mt-6">
              <button className="bg-green-500 text-white rounded px-4 py-2 font-bold"
                onClick={exportExcelLabaRugi}>Export Excel</button>
              <button className="bg-blue-500 text-white rounded px-4 py-2 font-bold"
                onClick={exportPDFLabaRugi}>Export PDF</button>
            </div>
          </>
        )}

        {/* ============ TAB NERACA ============= */}
        {tab === "neraca" && (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-100 p-4 rounded-xl">
                <div className="font-bold text-green-700 text-xs mb-1">Aset Kas</div>
                <div className="text-xl font-bold text-green-700">
                  Rp. {saldoKas.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <div className="font-bold text-blue-700 text-xs mb-1">Aset Bank</div>
                <div className="text-xl font-bold text-blue-700">
                  Rp. {saldoBank.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-amber-100 p-4 rounded-xl">
                <div className="font-bold text-amber-700 text-xs mb-1">Total Aset</div>
                <div className="text-xl font-bold text-amber-700">
                  Rp. {totalAset.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
            {/* Pie Chart */}
            <div className="mb-8 bg-white rounded-xl shadow p-4">
              <div className="font-bold mb-2 text-sm">Grafik Komposisi Aset</div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={neracaPie} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                    <Cell key="kas" fill="#14b8a6" />
                    <Cell key="bank" fill="#0ea5e9" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-2 mt-6">
              <button className="bg-green-500 text-white rounded px-4 py-2 font-bold"
                onClick={exportExcelNeraca}>Export Excel</button>
              <button className="bg-blue-500 text-white rounded px-4 py-2 font-bold"
                onClick={exportPDFNeraca}>Export PDF</button>
            </div>
          </>
        )}
        <div className="h-10"></div>
      </main>
    </div>
  );
}