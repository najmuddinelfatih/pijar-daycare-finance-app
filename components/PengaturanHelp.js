import React from "react";
import { Info, HelpCircle, Phone, Mail } from "lucide-react"; // opsional pakai lucide/react-icons

export default function PengaturanHelp() {
  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-5 my-8">
      <div className="font-bold text-lg mb-2 flex items-center gap-2 text-blue-600">
        <HelpCircle /> Bantuan & FAQ
      </div>
      <ul className="list-disc pl-6 text-gray-800 text-sm flex flex-col gap-3">
        <li>
          <b>Bagaimana cara menambah akun kas/bank?</b>
          <br />Masuk ke tab <b>Akun Kas & Bank</b>, klik tombol tambah, lalu isi form sesuai data bank/daycare.
        </li>
        <li>
          <b>Bagaimana upload bukti transfer atau kwitansi?</b>
          <br />Di halaman Transaksi, pilih tambah/edit, lalu upload file bukti pada kolom <b>Bukti Transfer</b>.
        </li>
        <li>
          <b>Bagaimana merubah logo dan nama daycare?</b>
          <br />Buka tab <b>Identitas</b>, klik <b>Pilih Logo</b>, dan simpan perubahan.
        </li>
        <li>
          <b>Bagaimana jika lupa password?</b>
          <br />Hubungi admin daycare untuk reset password via fitur <b>Reset Password</b> di tab Hak Akses.
        </li>
        <li>
          <b>Jika ada kendala/error aplikasi?</b>
          <br />Cek koneksi internet, lalu refresh halaman. Jika masalah berlanjut, segera hubungi admin.
        </li>
      </ul>
      <div className="border-t pt-4 mt-2 flex flex-col gap-2 text-sm">
        <div className="font-semibold mb-1 flex items-center gap-2">
          <Info className="text-blue-500" /> Kontak Bantuan/Support
        </div>
        <div className="flex items-center gap-2">
          <Phone className="text-green-500" /> WhatsApp Admin:
          <a href="https://wa.me/62812xxxxxxx" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            0812-xxxx-xxxx
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="text-red-500" /> Email:
          <a href="mailto:support@pijarmontessoriislam.id" className="text-blue-600 underline">
            support@pijarmontessoriislam.id
          </a>
        </div>
      </div>
      <div className="text-gray-500 text-xs mt-2">
        Ingin training penggunaan aplikasi atau request fitur baru? Silakan hubungi admin di atas.
      </div>
    </div>
  );
}
