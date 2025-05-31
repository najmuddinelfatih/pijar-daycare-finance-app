// header.js atau shared-imports.js

import React, { useState, useRef, useEffect, forwardRef } from "react";
import dynamic from "next/dynamic";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  Calendar, Wallet, FileText, Coins, Eye, Download, Hash, MoreVertical, Edit, Trash2, ZoomIn, ZoomOut, Receipt
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import ReactDOM from "react-dom";

// Dynamic DataTable (bisa dipakai di semua halaman)
const DataTable = dynamic(() => import("react-data-table-component"), { ssr: false });

// Custom style tabel global
const customStyles = {
  table: { style: { borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)' } },
  head: { style: { backgroundColor: '#e0f2fe', color: '#0284c7', fontWeight: 700, fontSize: 15, minHeight: 48 } },
  headRow: { style: { borderBottomWidth: 2, borderColor: '#bae6fd' } },
  rows: { style: { fontSize: 14, minHeight: 44, background: '#fff', borderBottom: '1px solid #e5e7eb' } },
  cells: { style: { padding: '10px 14px' } },
  pagination: { style: { fontSize: 13, padding: 12 } }
};

// Helper pad2, formatDateTime, formatWA
function pad2(n) { return n < 10 ? "0" + n : n; }
function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return "";
  const [date, time] = dateTimeStr.split("T");
  if (!time) return dateTimeStr;
  const [y, m, d] = date.split("-");
  const [hh, mm] = time.split(":");
  return `${d}/${m}/${y} ${hh}:${mm}`;
}
function formatWA(no) {
  let clean = no.replace(/\D/g, "");
  if (clean.startsWith("0")) clean = "62" + clean.substring(1);
  if (!clean.startsWith("62")) clean = "62" + clean;
  return clean;
}

// Template WA Default
const defaultWATemplate = `Assalamu'alaikum, Bapak/Ibu {nama} 🙏

Ini adalah pengingat tagihan untuk bulan {bulan}:
- Nama: {nama}
- Keterangan: {keterangan}
- Nominal: Rp{nominal}
- Status: {status}

Mohon segera melakukan pembayaran. Terima kasih!`;

// Export semua yang bisa dipakai di berbagai halaman
export {
  React, useState, useRef, useEffect, forwardRef,
  ReactDOM, dynamic,
  saveAs, XLSX, html2canvas, jsPDF,
  DataTable, customStyles, Zoom,
  Calendar, Wallet, FileText, Coins, Eye, Download, Hash, MoreVertical, Edit, Trash2, ZoomIn, ZoomOut, Receipt, Phone, Trash, CheckCircle, FileTextIcon, Users, Printer,
  pad2, formatDateTime, formatWA,
  defaultWATemplate
};
