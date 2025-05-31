import React, { useEffect, useState } from "react";
import { fetchPreferensi, savePreferensi } from "../lib/apiPreferensi";

export default function PengaturanPreferensi() {
  const [form, setForm] = useState({
    date_format: "DD/MM/YYYY",
    bahasa: "ID",
    currency: "IDR",
    reminder_auto: 1,
    theme: "default"
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);
  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchPreferensi();
      setForm({
        date_format: data.date_format || "DD/MM/YYYY",
        bahasa: data.bahasa || "ID",
        currency: data.currency || "IDR",
        reminder_auto: data.reminder_auto == 1 ? 1 : 0,
        theme: data.theme || "default"
      });
      setErrorMsg("");
    } catch {
      setErrorMsg("Gagal mengambil data preferensi.");
    }
    setLoading(false);
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setSuccessMsg(""); setErrorMsg("");
    try {
      await savePreferensi(form);
      setSuccessMsg("Preferensi berhasil disimpan!");
    } catch {
      setErrorMsg("Gagal menyimpan preferensi.");
    }
  }
  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-4 my-8">
      <div className="font-bold text-lg mb-2">Preferensi Aplikasi</div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="font-semibold mb-1 block">Format Tanggal</label>
          <select className="w-full border rounded px-3 py-2"
            value={form.date_format}
            onChange={e => setForm(f => ({ ...f, date_format: e.target.value }))}>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="font-semibold mb-1 block">Bahasa</label>
          <select className="w-full border rounded px-3 py-2"
            value={form.bahasa}
            onChange={e => setForm(f => ({ ...f, bahasa: e.target.value }))}>
            <option value="ID">Indonesia</option>
            <option value="EN">English</option>
          </select>
        </div>
        <div>
          <label className="font-semibold mb-1 block">Mata Uang</label>
          <select className="w-full border rounded px-3 py-2"
            value={form.currency}
            onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
            <option value="IDR">Rupiah (IDR)</option>
            <option value="USD">Dollar (USD)</option>
          </select>
        </div>
        <div>
          <label className="font-semibold mb-1 block">Auto Reminder</label>
          <select className="w-full border rounded px-3 py-2"
            value={form.reminder_auto}
            onChange={e => setForm(f => ({ ...f, reminder_auto: Number(e.target.value) }))}>
            <option value={1}>Aktif</option>
            <option value={0}>Nonaktif</option>
          </select>
        </div>
        <div>
          <label className="font-semibold mb-1 block">Tema Default</label>
          <select className="w-full border rounded px-3 py-2"
            value={form.theme}
            onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}>
            <option value="default">Default (Biru)</option>
            <option value="green">Green</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>
        <button className="bg-blue-500 text-white py-2 rounded-xl font-bold" type="submit">
          Simpan Preferensi
        </button>
        {successMsg && <div className="text-green-700 font-semibold">{successMsg}</div>}
        {errorMsg && <div className="text-red-600">{errorMsg}</div>}
        {loading && <div className="text-gray-400">Memuat preferensi ...</div>}
      </form>
    </div>
  );
}
