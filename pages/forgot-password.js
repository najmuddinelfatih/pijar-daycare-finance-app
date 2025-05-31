import React, { useState } from "react";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const form = new FormData();
    form.append("email", email);
    const res = await fetch("https://pijarmontessoriislam.id/api/user.php?aksi=request_reset", {
      method: "POST", body: form
    });
    const data = await res.json();
    if (data.success) setMsg("Link reset password sudah dikirim ke email.");
    else setMsg(data.msg || "Gagal, email tidak ditemukan.");
    setLoading(false);
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50">
      <form className="bg-white rounded-xl p-6 shadow w-full max-w-sm" onSubmit={handleSubmit}>
        <div className="text-lg font-bold mb-4 text-teal-700">Reset Password</div>
        <input type="email" className="w-full border rounded-lg px-3 py-2 mb-3"
          required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Masukkan email anda"/>
        <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2 rounded-xl" disabled={loading}>
          {loading ? "Memproses..." : "Kirim Link Reset"}
        </button>
        {msg && <div className="text-center mt-3 text-sm text-teal-700">{msg}</div>}
      </form>
    </div>
  );
}
