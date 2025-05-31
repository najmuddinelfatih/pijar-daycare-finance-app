<?php
header('Content-Type: application/json');
$host = "localhost";
$user = "u516826482_financeuser";
$pass = "o&3Sxtf/aO7?";
$dbname = "u516826482_financeapp";
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) die(json_encode(["error"=>"Koneksi gagal"]));

$aksi = $_GET['aksi'] ?? 'list';

if ($aksi == 'list') {
    $res = $conn->query("SELECT * FROM pengingat_operasional ORDER BY tanggal_rutin ASC");
    $rows = [];
    while ($row = $res->fetch_assoc()) $rows[] = $row;
    echo json_encode($rows);
}
else if ($aksi == 'tambah') {
    $nama = $_POST['nama'] ?? '';
    $nominal = intval($_POST['nominal'] ?? 0);
    $tanggal_rutin = intval($_POST['tanggal_rutin'] ?? 1);
    $keterangan = $_POST['keterangan'] ?? '';
    $q = $conn->prepare("INSERT INTO pengingat_operasional (nama, nominal, tanggal_rutin, keterangan) VALUES (?, ?, ?, ?)");
    $q->bind_param("siis", $nama, $nominal, $tanggal_rutin, $keterangan);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'edit') {
    $id = intval($_POST['id'] ?? 0);
    $nama = $_POST['nama'] ?? '';
    $nominal = intval($_POST['nominal'] ?? 0);
    $tanggal_rutin = intval($_POST['tanggal_rutin'] ?? 1);
    $keterangan = $_POST['keterangan'] ?? '';
    $q = $conn->prepare("UPDATE pengingat_operasional SET nama=?, nominal=?, tanggal_rutin=?, keterangan=? WHERE id=?");
    $q->bind_param("siisi", $nama, $nominal, $tanggal_rutin, $keterangan, $id);
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
else {
    echo json_encode(["error"=>"Aksi tidak dikenali"]);
}
?>
