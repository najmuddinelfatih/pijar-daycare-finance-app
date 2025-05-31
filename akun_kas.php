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
    $res = $conn->query("SELECT * FROM akun_kas");
    $rows = [];
    while ($row = $res->fetch_assoc()) $rows[] = $row;
    echo json_encode($rows);
}
else if ($aksi == 'tambah') {
    $nama = $_POST['nama'] ?? '';
    $tipe = $_POST['tipe'] ?? '';
    $norek = $_POST['norek'] ?? '';
    $ket = $_POST['ket'] ?? '';
    $q = $conn->prepare("INSERT INTO akun_kas (nama, tipe, norek, ket) VALUES (?, ?, ?, ?)");
    $q->bind_param("ssss", $nama, $tipe, $norek, $ket);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'hapus') {
    $id = $_POST['id'] ?? 0;
    $q = $conn->prepare("DELETE FROM akun_kas WHERE id=?");
    $q->bind_param("i", $id);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'edit') {
    $id = $_POST['id'] ?? 0;
    $nama = $_POST['nama'] ?? '';
    $tipe = $_POST['tipe'] ?? '';
    $norek = $_POST['norek'] ?? '';
    $ket = $_POST['ket'] ?? '';
    $q = $conn->prepare("UPDATE akun_kas SET nama=?, tipe=?, norek=?, ket=? WHERE id=?");
    $q->bind_param("ssssi", $nama, $tipe, $norek, $ket, $id);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
}
else {
    echo json_encode(["error"=>"Aksi tidak dikenali"]);
}
?>