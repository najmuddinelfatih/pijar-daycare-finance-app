// pages/_app.js
import "@/styles/globals.css";
import { useState, useEffect } from "react";
// import { useSwipeable } from "react-swipeable";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/router"; // 🆕

export default function App({ Component, pageProps }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter(); // 🆕

  useEffect(() => setHydrated(true), []);

  // const handlers = useSwipeable({
  //   onSwipedRight: () => setSidebarOpen(true),
  //   onSwipedLeft: () => setSidebarOpen(false),
  //   delta: 50,
  //   trackTouch: true,
  //   preventScrollOnSwipe: true,
  // });

  useEffect(() => {
  const u = JSON.parse(localStorage.getItem("user") || "{}");
  const protectedRoutes = {
    "/pengguna": ["Admin"],
    "/pengaturan": ["Admin"],
  };

  const currentPath = router.pathname;
  const allowedRoles = protectedRoutes[currentPath];

  if (allowedRoles && !allowedRoles.includes(u.role)) {
    router.replace("/"); // redirect ke beranda
  }
  }, [router.pathname, router]);


  if (!hydrated) return null;

  const hideSidebarRoutes = ["/login"]; // 🧠 tambahkan path lain kalau perlu
  const isSidebarHidden = hideSidebarRoutes.includes(router.pathname); // 🆕

  return (
    <div>
      <div className={`md:flex`}>
        {!isSidebarHidden && (
          <Sidebar externalOpen={sidebarOpen} setExternalOpen={setSidebarOpen} />
        )}
        <div className="flex-1 min-h-screen bg-gray-50">
          <Component {...pageProps} />
        </div>
      </div>
    </div>
  );
}
