import React, { useState } from "react";
import { loginUser } from "../lib/apiUser";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Jika sudah login, auto-redirect
  React.useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("user")) {
      router.replace("/"); // redirect ke dashboard
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res.success) {
        localStorage.setItem("user", JSON.stringify(res.user));
        router.replace("/"); // redirect ke dashboard
      } else {
        setErrorMsg(res.msg || "Login gagal. Cek email dan password.");
      }
    } catch {
      setErrorMsg("Gagal koneksi ke server.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 via-blue-100 to-white">
      <form
        className="bg-white rounded-2xl shadow-lg px-7 py-8 w-full max-w-sm flex flex-col gap-5"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold text-teal-700 mb-2 text-center">Login Pijar Daycare App V1</h1>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full border border-teal-300 rounded-lg px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full border border-teal-300 rounded-lg px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-xl mt-2 shadow"
          type="submit"
        >
          {loading ? "Memproses..." : "Login"}
        </button>
        <div className="mt-2 text-center">
          <a href="/forgot-password" className="text-blue-500 hover:underline text-sm">Lupa password?</a>
        </div>
        {errorMsg && <div className="text-red-600 text-sm text-center">{errorMsg}</div>}
      </form>
    </div>
  );
}
