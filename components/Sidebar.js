// components/Sidebar.js
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const menus = [
  { label: "Dashboard", href: "/" },
  { label: "Transaksi", href: "/transaksi" },
  { label: "Tagihan Siswa", href: "/tagihan" },
  { label: "Laporan", href: "/laporan" },
  { label: "Pengguna", href: "/pengguna" },
  { label: "Pengaturan", href: "/pengaturan" },
];
const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

function handleLogout() {
  localStorage.removeItem("user");
  window.location.href = "/login";
}
export default function Sidebar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Jalankan hanya di browser
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
    }
  }, []);
  return (
    <aside className="hidden md:flex w-56 bg-blue-500 flex-col py-8 px-6 min-h-screen">
      <div className="text-white text-3xl font-bold mb-12">Daycare</div>
      <nav className="flex-1 flex flex-col gap-5 text-lg font-semibold">
        {menus.map(menu => (
          <Link href={menu.href} key={menu.href}>
            <span className={`
              ${router.pathname === menu.href ? "text-white" : "text-blue-100 hover:text-white"}
              cursor-pointer transition
            `}>
              {menu.label}
            </span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex flex-col items-center">
        <div className="px-10 py-4 text-white font-bold">
        {user ? `Halo, ${user.nama}` : "Halo, ..."}
      </div>
        <button onClick={handleLogout} className="px-3 py-1 rounded bg-red-500 text-white font-bold">Logout</button>
      </div>
    </aside>
  );
}
