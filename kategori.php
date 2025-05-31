<?php
ob_clean();
error_reporting(0);
ini_set('display_errors', 0);
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$host = "localhost";
$user = "u516826482_financeuser";
$pass = "o&3Sxtf/aO7?";
$dbname = "u516826482_financeapp";
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) die(json_encode(["error"=>"Koneksi gagal"]));

$aksi = $_GET['aksi'] ?? 'list';

if ($aksi == 'list') {
    $res = $conn->query("SELECT * FROM kategori");
    $rows = [];
    while ($row = $res->fetch_assoc()) $rows[] = $row;
    echo json_encode($rows);
}
else if ($aksi == 'tambah') {
    $nama = $_POST['nama'] ?? '';
    $jenis = $_POST['jenis'] ?? '';
    $q = $conn->prepare("INSERT INTO kategori (nama, jenis) VALUES (?, ?)");
    $q->bind_param("ss", $nama, $jenis);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'hapus') {
    $id = $_POST['id'] ?? 0;
    $q = $conn->prepare("DELETE FROM kategori WHERE id=?");
    $q->bind_param("i", $id);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'edit') {
    $id = $_POST['id'] ?? 0;
    $nama = $_POST['nama'] ?? '';
    $jenis = $_POST['jenis'] ?? '';
    $q = $conn->prepare("UPDATE kategori SET nama=?, jenis=? WHERE id=?");
    $q->bind_param("ssi", $nama, $jenis, $id);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
}
else {
    echo json_encode(["error"=>"Aksi tidak dikenali"]);
}
?>
