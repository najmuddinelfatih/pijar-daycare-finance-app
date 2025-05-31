<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
$host = "localhost";
$user = "u516826482_financeuser";
$pass = "o&3Sxtf/aO7?";
$dbname = "u516826482_financeapp";
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) die(json_encode(["error"=>"Koneksi gagal"]));

$aksi = $_GET['aksi'] ?? 'list';

if ($aksi == 'list') {
    // Ambil reminder bulan ini saja
    $bulan_tahun = $_GET['bulan_tahun'] ?? date("Y-m");
    $res = $conn->query("SELECT * FROM pengingat_operasional WHERE bulan_tahun='$bulan_tahun' ORDER BY tanggal_rutin ASC");
    $rows = [];
    while ($row = $res->fetch_assoc()) $rows[] = $row;
    echo json_encode($rows);
}
else if ($aksi == 'tambah') {
    $nama = $_POST['nama'] ?? '';
    $nominal = intval($_POST['nominal'] ?? 0);
    $tanggal_rutin = intval($_POST['tanggal_rutin'] ?? 1);
    $keterangan = $_POST['keterangan'] ?? '';
    $bulan_tahun = $_POST['bulan_tahun'] ?? date("Y-m");
    $q = $conn->prepare("INSERT INTO pengingat_operasional (nama, nominal, tanggal_rutin, keterangan, bulan_tahun, sudah_bayar) VALUES (?, ?, ?, ?, ?, 0)");
    $q->bind_param("siiss", $nama, $nominal, $tanggal_rutin, $keterangan, $bulan_tahun);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'edit') {
    $id = intval($_POST['id'] ?? 0);
    $nama = $_POST['nama'] ?? '';
    $nominal = intval($_POST['nominal'] ?? 0);
    $tanggal_rutin = intval($_POST['tanggal_rutin'] ?? 1);
    $keterangan = $_POST['keterangan'] ?? '';
    $bulan_tahun = $_POST['bulan_tahun'] ?? date("Y-m");
    $q = $conn->prepare("UPDATE pengingat_operasional SET nama=?, nominal=?, tanggal_rutin=?, keterangan=?, bulan_tahun=? WHERE id=?");
    $q->bind_param("siissi", $nama, $nominal, $tanggal_rutin, $keterangan, $bulan_tahun, $id);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'hapus') {
    $id = intval($_POST['id'] ?? 0);
    $q = $conn->prepare("DELETE FROM pengingat_operasional WHERE id=?");
    $q->bind_param("i", $id);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'done') {
    $id = intval($_POST['id'] ?? 0);
    $q = $conn->prepare("UPDATE pengingat_operasional SET sudah_bayar=1 WHERE id=?");
    $q->bind_param("i", $id);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'uncheck') {
    $id = intval($_POST['id'] ?? 0);
    $q = $conn->prepare("UPDATE pengingat_operasional SET sudah_bayar=0 WHERE id=?");
    $q->bind_param("i", $id);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'repeat') {
    // Untuk duplikasi semua data bulan sebelumnya ke bulan sekarang (jika belum ada)
    $bulan_lama = $_POST['bulan_lama'] ?? '';
    $bulan_baru = $_POST['bulan_baru'] ?? date("Y-m");
    $res = $conn->query("SELECT nama, nominal, tanggal_rutin, keterangan FROM pengingat_operasional WHERE bulan_tahun='$bulan_lama'");
    while ($row = $res->fetch_assoc()) {
        // Cek apakah sudah ada di bulan baru
        $cek = $conn->query("SELECT id FROM pengingat_operasional WHERE nama='{$row['nama']}' AND bulan_tahun='$bulan_baru'");
        if ($cek->num_rows == 0) {
            $stmt = $conn->prepare("INSERT INTO pengingat_operasional (nama, nominal, tanggal_rutin, keterangan, bulan_tahun, sudah_bayar) VALUES (?, ?, ?, ?, ?, 0)");
            $stmt->bind_param("siiss", $row['nama'], $row['nominal'], $row['tanggal_rutin'], $row['keterangan'], $bulan_baru);
            $stmt->execute();
        }
    }
    echo json_encode(["success"=>true]);
}
else {
    echo json_encode(["error"=>"Aksi tidak dikenali"]);
}