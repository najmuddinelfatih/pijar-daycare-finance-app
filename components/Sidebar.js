// components/Sidebar.js
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  FileBarChart,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import Image from "next/image";

const menus = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Transaksi", href: "/transaksi", icon: CreditCard },
  { label: "Tagihan Siswa", href: "/tagihan", icon: Receipt },
  { label: "Laporan", href: "/laporan", icon: FileBarChart },
  { label: "Pengguna", href: "/pengguna", icon: Users },
  { label: "Pengaturan", href: "/pengaturan", icon: Settings },
];

function handleLogout() {
  localStorage.removeItem("user");
  window.location.href = "/login";
}

export default function Sidebar({ externalOpen, setExternalOpen }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const isOpen = externalOpen;
  const setIsOpen = setExternalOpen;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
    }
  }, []);

  const role = (user?.role || "").toLowerCase();
  const allowedMenus = menus.filter((menu) => {
    if (menu.label === "Pengguna") {
      return role === "admin";
    }
    return true;
  });

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-60 bg-blue-100 flex-col py-8 px-6 min-h-screen shadow-lg">
        <div className="mb-12">
          <Link href="/">
          <Image
            src="https://pijarmontessoriislam.id/api/public/logo_pijar_daycare_bekasi_v2.png"
            alt="Logo Daycare"
            width={600}
            height={400}
            className="w-[140px] h-auto"
          />
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-4 text-base font-medium">
          {allowedMenus.map(({ label, href, icon: Icon }) => (
            <Link href={href} key={href}>
              <span
                className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition duration-200 ${
                  router.pathname === href
                    ? "bg-blue-200 text-blue-900"
                    : "text-blue-700 hover:bg-blue-200"
                }`}
              >
                <Icon size={18} />
                {label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center">
          <div className="px-4 py-2 text-blue-800 font-semibold">
            {user ? `Halo, ${user.nama}` : "Halo, ..."}
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 px-4 py-2 rounded bg-red-500 text-white font-bold flex items-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden p-4 bg-blue-100 text-blue-700 flex justify-between items-center">
        <button onClick={() => setIsOpen(true)} className="text-2xl font-bold">
          ☰
        </button>
        <Link href="/">
        <Image
          src="https://pijarmontessoriislam.id/api/public/logo_pijar_daycare_bekasi_v2.png"
          alt="Logo Daycare"
          width={600}
          height={400}
          className="h-8"
        />
        </Link>
      </div>

      {/* Sidebar Mobile */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-blue-100 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden flex flex-col py-8 px-6 shadow-lg`}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="text-blue-800 text-xl font-bold">Menu</div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-blue-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-4 text-base font-medium">
          {allowedMenus.map(({ label, href, icon: Icon }) => (
            <Link href={href} key={href}>
              <span
                className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition duration-200 ${
                  router.pathname === href
                    ? "bg-blue-200 text-blue-900"
                    : "text-blue-700 hover:bg-blue-200"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} />
                {label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center">
          <div className="px-4 py-2 text-blue-800 font-semibold">
            {user ? `Halo, ${user.nama}` : "Halo, ..."}
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 px-4 py-2 rounded bg-red-500 text-white font-bold flex items-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
