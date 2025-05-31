// components/Sidebar.js
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSwipeable } from "react-swipeable"; // 🆕 Tambah ini

const menus = [
  { label: "Dashboard", href: "/" },
  { label: "Transaksi", href: "/transaksi" },
  { label: "Tagihan Siswa", href: "/tagihan" },
  { label: "Laporan", href: "/laporan" },
  { label: "Pengguna", href: "/pengguna" },
  { label: "Pengaturan", href: "/pengaturan" },
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

  // 🆕 Gesture Swipe
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => setIsOpen(true),
    onSwipedLeft: () => setIsOpen(false),
    delta: 50, // minimum jarak swipe (px)
    preventScrollOnSwipe: true,
    trackTouch: true,
  });

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-56 bg-blue-500 flex-col py-8 px-6 min-h-screen">
        <div className="text-white text-3xl font-bold mb-12">Daycare</div>
        <nav className="flex-1 flex flex-col gap-5 text-lg font-semibold">
          {menus.map((menu) => (
            <Link href={menu.href} key={menu.href}>
              <span
                className={`${
                  router.pathname === menu.href
                    ? "text-white"
                    : "text-blue-100 hover:text-white"
                } cursor-pointer transition`}
              >
                {menu.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center">
          <div className="px-10 py-4 text-white font-bold">
            {user ? `Halo, ${user.nama}` : "Halo, ..."}
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded bg-red-500 text-white font-bold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div
        className="md:hidden p-4 bg-blue-600 text-white flex justify-between items-center"
        {...swipeHandlers} // 🆕 Tambahkan gesture ke wrapper mobile
      >
        <button onClick={() => setIsOpen(true)} className="text-2xl font-bold">
          ☰
        </button>
        <span className="font-bold text-lg">Daycare</span>
      </div>

      {/* Sidebar Mobile */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-blue-500 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden flex flex-col py-8 px-6`}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="text-white text-2xl font-bold">Menu</div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-5 text-lg font-semibold">
          {menus.map((menu) => (
            <Link href={menu.href} key={menu.href}>
              <span
                className={`${
                  router.pathname === menu.href
                    ? "text-white"
                    : "text-blue-100 hover:text-white"
                } cursor-pointer transition`}
                onClick={() => setIsOpen(false)}
              >
                {menu.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center">
          <div className="px-10 py-4 text-white font-bold">
            {user ? `Halo, ${user.nama}` : "Halo, ..."}
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded bg-red-500 text-white font-bold"
          >
            Logout
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
