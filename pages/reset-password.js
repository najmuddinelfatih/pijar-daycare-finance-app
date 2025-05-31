import React, { useState } from "react";
import { useRouter } from "next/router";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { token } = router.query;

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) return setMsg("Password tidak sama");
    setLoading(true); setMsg("");
    const form = new FormData();
    form.append("token", token);
    form.append("password", password);
    const res = await fetch("https://pijarmontessoriislam.id/api/user.php?aksi=resetpw_token", {
      method: "POST", body: form
    });
    const data = await res.json();
    if (data.success) {
      setMsg("Password berhasil direset. Silakan login.");
      setTimeout(() => router.replace("/login"), 2000);
    } else setMsg(data.msg || "Reset gagal, token invalid.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50">
      <form className="bg-white rounded-xl p-6 shadow w-full max-w-sm" onSubmit={handleSubmit}>
        <div className="text-lg font-bold mb-4 text-teal-700">Buat Password Baru</div>
        <input type="password" className="w-full border rounded-lg px-3 py-2 mb-3"
          required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password baru"/>
        <input type="password" className="w-full border rounded-lg px-3 py-2 mb-3"
          required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Ulangi password"/>
        <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2 rounded-xl" disabled={loading}>
          {loading ? "Memproses..." : "Reset Password"}
        </button>
        {msg && <div className="text-center mt-3 text-sm text-teal-700">{msg}</div>}
      </form>
    </div>
  );
}
