import React, { useEffect, useState } from "react";
import {
  fetchReminderOperasional, tambahReminderOperasional,
  editReminderOperasional, hapusReminderOperasional,
  doneReminderOperasional, repeatReminderOperasional, uncheckReminderOperasional
} from "../lib/apiReminderOperasional";
import { Edit, Trash2, Plus, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { hasAccess } from "../lib/akses";

export default function ReminderOperasionalTable() {
  const router = useRouter();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ nama: "", nominal: "", tanggal_rutin: "1", keterangan: "" });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Bulan sekarang
  const now = new Date();
  const bulan_tahun = format(now, "yyyy-MM");

  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, [router]);

  const loadData = useCallback(async () => {
    setData(await fetchReminderOperasional());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  async function loadData() {
    // Cek dan repeat data bulan sebelumnya jika kosong!
    const data = await fetchReminderOperasional(bulan_tahun);
    if (!data.length) {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevBulan = format(prev, "yyyy-MM");
      await repeatReminderOperasional(prevBulan, bulan_tahun);
      const dataBaru = await fetchReminderOperasional(bulan_tahun);
      setList(dataBaru);
    } else {
      setList(data);
    }
  }
  async function handleUncheck(id) {
  await uncheckReminderOperasional(id);
  loadData();
    }
  function handleEdit(item) {
    setForm({ ...item });
    setEditId(item.id);
    setShowModal(true);
  }
  function handleTambah() {
    setForm({ nama: "", nominal: "", tanggal_rutin: "1", keterangan: "" });
    setEditId(null);
    setShowModal(true);
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, bulan_tahun };
    if (editId) await editReminderOperasional({ ...payload, id: editId });
    else await tambahReminderOperasional(payload);
    setShowModal(false); setEditId(null); loadData();
  }
  async function handleHapus(id) {
    if (confirm("Yakin hapus pengingat?")) {
      await hapusReminderOperasional(id);
      loadData();
    }
  }
  async function handleDone(id) {
    await doneReminderOperasional(id);
    loadData();
  }
  if (!user) return null;

  return (
    <div>
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-lg font-bold text-blue-600">Reminder Biaya Operasional Bulan Ini</h2>
        {hasAccess(user.role, "edit") && <button className="px-4 py-2 rounded bg-blue-500 text-white flex items-center gap-1" onClick={handleTambah}>
          <Plus size={16}/> Tambah Reminder
        </button>}
      </div>
      <table className="w-full bg-white rounded-xl text-xs shadow">
        <thead>
          <tr className="bg-blue-100 text-blue-800">
            <th className="py-2 px-2 border-r">Checklist</th>
            <th className="border-r">Nama</th>
            <th className="border-r">Nominal</th>
            <th className="border-r">Tanggal</th>
            <th className="border-r">Keterangan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {list.map(r =>
            <tr key={r.id} className={r.sudah_bayar == 1 ? "text-gray-400 line-through" : ""}>
              <td className="text-center border-r">
                {r.sudah_bayar == 0 ? (
                    hasAccess(user.role, "edit") && <button
                    title="Tandai sudah bayar"
                    className="text-green-500"
                    onClick={() => handleDone(r.id)}
                    >
                    <CheckCircle size={18}/>
                    </button>
                ) : (
                    hasAccess(user.role, "edit") && <button
                    title="Batalkan checklist"
                    className="text-gray-300 hover:text-orange-500"
                    onClick={() => handleUncheck(r.id)}
                    >
                    <CheckCircle size={18}/>
                    </button>
                )}
                </td>
              <td className="py-1 px-2 border-r">{r.nama}</td>
              <td className="text-right border-r">Rp. {Number(r.nominal).toLocaleString("id-ID")}</td>
              <td className="border-r text-center">{r.tanggal_rutin}</td>
              <td className="text-center border-r">{r.keterangan}</td>
              <td className="items-center justify-center flex gap-2">
                {hasAccess(user.role, "edit") && <button className="text-blue-600" onClick={()=>handleEdit(r)}><Edit size={16}/></button>}
                {hasAccess(user.role, "edit") && <button className="text-red-600" onClick={()=>handleHapus(r.id)}><Trash2 size={16}/></button>}
              </td>
            </tr>
          )}
          {list.length === 0 && <tr><td colSpan={6} className="text-center text-gray-400 py-3">Belum ada reminder</td></tr>}
        </tbody>
      </table>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form className="bg-white rounded-xl p-6 w-96 flex flex-col gap-3 shadow-xl" onSubmit={handleSubmit}>
            <div className="text-xl font-bold mb-2">{editId ? "Edit Reminder" : "Tambah Reminder"}</div>
            <div>
              <label className="block font-semibold mb-1">Nama Biaya</label>
              <input type="text" required className="w-full rounded-lg border px-3 py-2"
                value={form.nama} onChange={e=>setForm(f=>({...f, nama:e.target.value}))}/>
            </div>
            <div>
              <label className="block font-semibold mb-1">Nominal</label>
              <input type="number" required className="w-full rounded-lg border px-3 py-2"
                value={form.nominal} onChange={e=>setForm(f=>({...f, nominal:e.target.value}))}/>
            </div>
            <div>
              <label className="block font-semibold mb-1">Tanggal (rutin tiap bulan)</label>
              <input type="number" min="1" max="31" required className="w-full rounded-lg border px-3 py-2"
                value={form.tanggal_rutin} onChange={e=>setForm(f=>({...f, tanggal_rutin:e.target.value}))}/>
            </div>
            <div>
              <label className="block font-semibold mb-1">Keterangan</label>
              <input type="text" className="w-full rounded-lg border px-3 py-2"
                value={form.keterangan} onChange={e=>setForm(f=>({...f, keterangan:e.target.value}))}/>
            </div>
            <div className="flex gap-2 mt-3">
              <button type="submit" className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-bold">{editId ? "Simpan" : "Tambah"}</button>
              <button type="button" className="flex-1 py-2 rounded-xl bg-gray-200" onClick={()=>setShowModal(false)}>Batal</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
