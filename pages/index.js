import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchTransaksi } from "../lib/apiTransaksi";
import { fetchTagihan } from "../lib/apiTagihan";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Bell, Clock, Users, TrendingUp, TrendingDown } from "lucide-react";
import ReminderOperasionalTable from "../components/ReminderOperasionalTable";
import { isBefore, parseISO, startOfDay } from "date-fns";

export default function Dashboard() {
  const router = useRouter();

  // 1. Semua hooks useState di atas
  const [authChecked, setAuthChecked] = useState(false);
  const [transaksi, setTransaksi] = useState([]);
  const [tagihan, setTagihan] = useState([]);
  const [, setLoading] = useState(true);
  const COLORS = ["#6366f1", "#14b8a6", "#ef4444", "#f59e42", "#0ea5e9", "#6366f1", "#a855f7"];
 

  // 2. Cek login di useEffect pertama, lalu baru render dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (!user) {
        router.replace("/login");
      } else {
        setAuthChecked(true);
      }
    }
  }, [router]);

  // 3. Data fetching setelah authChecked true
  useEffect(() => {
    if (authChecked) {
      setLoading(true);
      Promise.all([fetchTransaksi(), fetchTagihan()]).then(([trx, tag]) => {
        setTransaksi(trx);
        setTagihan(tag);
        setLoading(false);
      });
    }
  }, [authChecked]);

  // 4. Jangan render apapun sebelum authChecked true
  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  // =========== Summary Bulan Ini ===========
  const now = new Date();
  const bulanIni = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
  const trxBulanIni = transaksi.filter(t => t.tanggal && t.tanggal.slice(0, 7) === bulanIni);

  const pemasukanBulan = trxBulanIni.filter(t => t.jenis === "Pemasukan").reduce((a, b) => a + Math.abs(Number(b.jumlah)), 0);
  const pengeluaranBulan = trxBulanIni.filter(t => t.jenis === "Pengeluaran").reduce((a, b) => a + Math.abs(Number(b.jumlah)), 0);

  const saldoKas = transaksi.filter(t => t.metode === "Cash").reduce(
    (acc, t) => acc + (t.jenis === "Pengeluaran" ? -Math.abs(Number(t.jumlah)) : Math.abs(Number(t.jumlah))), 0);
  const saldoBank = transaksi.filter(t => t.metode === "Transfer").reduce(
    (acc, t) => acc + (t.jenis === "Pengeluaran" ? -Math.abs(Number(t.jumlah)) : Math.abs(Number(t.jumlah))), 0);

  // =========== Grafik Arus Kas Bulanan ===========
  function groupByMonth(list) {
    const byMonth = {};
    list.forEach(t => {
      if (!t.tanggal) return;
      const key = t.tanggal.slice(0, 7);
      if (!byMonth[key]) byMonth[key] = { bulan: key, pemasukan: 0, pengeluaran: 0 };
      if (t.jenis === "Pemasukan") byMonth[key].pemasukan += Math.abs(Number(t.jumlah));
      if (t.jenis === "Pengeluaran") byMonth[key].pengeluaran += Math.abs(Number(t.jumlah));
    });
    return Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([bulan, v]) => ({ bulan, ...v }));
  }
  const grafikBulanan = groupByMonth(transaksi);

  // =========== Notifikasi Tagihan Jatuh Tempo ===========
  const hariIni = startOfDay(now);
  const notifTagihan = tagihan.filter(t =>
    t.status && t.status.toLowerCase() !== "lunas" &&
    t.tgl_tagihan && isBefore(parseISO(t.tgl_tagihan), hariIni)
  ).sort((a, b) => a.tgl_tagihan.localeCompare(b.tgl_tagihan));

  // =========== 10 Transaksi Terakhir ===========
  const transaksiTerakhir = transaksi.slice().sort((a, b) =>
    (b.tanggal || "").localeCompare(a.tanggal || "")
  ).slice(0, 10);

  // =========== Tagihan Belum Lunas ===========
  const tagihanBelumLunas = tagihan.filter(t => t.status !== "Lunas");

  // =========== Pie Komposisi Pengeluaran Bulan Ini ===========
  const piePengeluaran = [];
  trxBulanIni
    .filter(t => t.jenis === "Pengeluaran" && t.kategori_nama)
    .forEach(t => {
      const kategori = t.kategori_nama.trim();
      const idx = piePengeluaran.findIndex(p => p.kategori === kategori);
      if (idx === -1)   
        piePengeluaran.push({ kategori, value: Math.abs(Number(t.jumlah)) });
      else
        piePengeluaran[idx].value += Math.abs(Number(t.jumlah));
    });

    // Helper dan render code lain
    function formatTanggal(dt) {
        if (!dt) return "-";
        const d = new Date(dt);
        return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <main className="flex-1 px-2 sm:px-6 py-6 max-w-9/10 mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-4">Dashboard Keuangan</h1>
        {/* Ringkasan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
          <div className="bg-green-100 rounded-xl p-4 flex flex-col items-start shadow">
            <div className="flex gap-2 items-center mb-1 text-green-800 font-bold text-sm">
              <TrendingUp size={18} /> Pemasukan Bulan Ini
            </div>
            <div className="text-xl font-bold text-green-700">
              Rp. {pemasukanBulan.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="bg-red-100 rounded-xl p-4 flex flex-col items-start shadow">
            <div className="flex gap-2 items-center mb-1 text-red-800 font-bold text-sm">
              <TrendingDown size={18} /> Pengeluaran Bulan Ini
            </div>
            <div className="text-xl font-bold text-red-700">
              Rp. {pengeluaranBulan.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="bg-blue-100 rounded-xl p-4 flex flex-col items-start shadow">
            <div className="flex gap-2 items-center mb-1 text-blue-800 font-bold text-sm">
              <Clock size={18} /> Saldo Kas
            </div>
            <div className="text-xl font-bold text-blue-700">
              Rp. {saldoKas.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="bg-indigo-100 rounded-xl p-4 flex flex-col items-start shadow">
            <div className="flex gap-2 items-center mb-1 text-indigo-800 font-bold text-sm">
              <Clock size={18} /> Saldo Bank
            </div>
            <div className="text-xl font-bold text-indigo-700">
              Rp. {saldoBank.toLocaleString("id-ID")}
            </div>
          </div>
        </div>
        {/* Grafik Arus Kas */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="font-bold mb-2 text-sm">Grafik Arus Kas 12 Bulan Terakhir</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={grafikBulanan}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pemasukan" fill="#14b8a6" name="Pemasukan"/>
              <Bar dataKey="pengeluaran" fill="#ef4444" name="Pengeluaran"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Notifikasi Tagihan & Reminder */}
        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          <div className="bg-yellow-50 rounded-xl shadow p-4">
            <div className="font-bold text-yellow-800 mb-2 flex gap-2 items-center"><Bell size={18}/> Tagihan Jatuh Tempo</div>
            {notifTagihan.length === 0 && <div className="text-gray-400">Tidak ada tagihan jatuh tempo.</div>}
            {notifTagihan.slice(0,5).map((t,i) =>
              <div key={i} className="flex justify-between items-center mb-2 border-b pb-1">
                <div>
                  <div className="font-semibold text-blue-800">{t.nama_siswa}</div>
                  <div className="text-xs text-gray-600">{formatTanggal(t.jatuh_tempo)} | Rp. {Number(t.nominal).toLocaleString("id-ID")}</div>
                </div>
                <div className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 font-bold">{t.status}</div>
              </div>
            )}
          </div>
          <ReminderOperasionalTable/>
        </div>
        {/* Transaksi Terakhir */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="font-bold mb-2 text-sm flex gap-2 items-center"><Clock size={16}/> 10 Transaksi Terakhir</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-blue-50 text-blue-800">
                  <th className="py-1 px-2 border-r border-gray-200">Tanggal</th>
                  <th className="border-r border-gray-200">Deskripsi</th>
                  <th className="border-r border-gray-200">Kategori</th>
                  <th className="border-r border-gray-200">Jenis</th>
                  <th className="border-r border-gray-200">Metode</th>
                  <th className="border-r border-gray-200">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {transaksiTerakhir.map((t, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-1 px-2 border-r border-gray-200">{formatTanggal(t.tanggal)}</td>
                    <td className="border-r border-gray-200">{t.deskripsi}</td>
                    <td className="border-r border-gray-200">{t.kategori_nama || "-"}</td>
                    <td className="text-center border-r border-gray-200">{t.jenis}</td>
                    <td className="text-center border-r border-gray-200">{t.metode}</td>
                    <td className={`text-right border-r border-gray-200 ${t.jenis === "Pemasukan" ? "text-green-600 font-bold" : "text-red-600 font-bold"}`}>
                      Rp. {Number(t.jumlah).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
                {transaksiTerakhir.length === 0 && <tr><td colSpan={6} className="text-center text-gray-400 py-3">Belum ada transaksi</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        {/* Tagihan Belum Lunas */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="font-bold mb-2 text-sm flex gap-2 items-center"><Users size={16}/> Tagihan Belum Lunas</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-red-50 text-red-800">
                  <th className="py-1 px-2 border-r border-gray-200">Nama Siswa</th>
                  <th className="border-r border-gray-200">Jatuh Tempo</th>
                  <th className="border-r border-gray-200">Nominal</th>
                  <th className="border-r border-gray-200">Keterangan</th>
                  <th className="border-r border-gray-200">Status</th>
                </tr>
              </thead>
              <tbody>
                {tagihanBelumLunas.map((t,i) =>
                  <tr key={i} className="border-t">
                    <td className="py-1 px-2 border-r border-gray-200">{t.nama_siswa}</td>
                    <td className="border-r border-gray-200">{formatTanggal(t.jatuh_tempo)}</td>
                    <td className="border-r border-gray-200">Rp. {Number(t.nominal).toLocaleString("id-ID")}</td>
                    <td className="border-r border-gray-200">{t.keterangan}</td>
                    <td className="text-center border-r border-gray-200">{t.status}</td>
                  </tr>
                )}
                {tagihanBelumLunas.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-3">Tidak ada tagihan belum lunas</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pie Chart Pengeluaran */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="font-bold mb-2 text-sm">Komposisi Pengeluaran Bulan Ini</div>
          {piePengeluaran.length === 0 && <div className="text-gray-400">Belum ada pengeluaran bulan ini.</div>}
          {piePengeluaran.length > 0 &&
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={piePengeluaran} dataKey="value" nameKey="kategori" cx="50%" cy="50%" outerRadius={90} label>
                  {piePengeluaran.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          }
        </div>
        <div className="h-8"></div>
      </main>
    </div>
  );
}

