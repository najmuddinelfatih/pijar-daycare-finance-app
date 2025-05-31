<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$host = "localhost"; $user = "u516826482_financeuser"; $pass = "o&3Sxtf/aO7?"; $dbname = "u516826482_financeapp";
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) die(json_encode(["error"=>"Koneksi gagal"]));

$aksi = $_GET['aksi'] ?? 'list';

if ($aksi == 'list') {
  $res = $conn->query("SELECT * FROM notifikasi");
  $rows = [];
  while ($row = $res->fetch_assoc()) $rows[] = $row;
  echo json_encode($rows);
}
else if ($aksi == 'tambah') {
  $tipe = $_POST['tipe'] ?? '';
  $aktif = $_POST['aktif'] ?? 1;
  $hari_reminder = $_POST['hari_reminder'] ?? 3;
  $jam_reminder = $_POST['jam_reminder'] ?? '08:00:00';
  $pesan = $_POST['pesan'] ?? '';
  $now = date('Y-m-d H:i:s');
  $q = $conn->prepare("INSERT INTO notifikasi (tipe, aktif, hari_reminder, jam_reminder, pesan, terakhir_update) VALUES (?, ?, ?, ?, ?, ?)");
  $q->bind_param("siisss", $tipe, $aktif, $hari_reminder, $jam_reminder, $pesan, $now);
  $ok = $q->execute();
  echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'edit') {
  $id = $_POST['id'] ?? 0;
  $tipe = $_POST['tipe'] ?? '';
  $aktif = $_POST['aktif'] ?? 1;
  $hari_reminder = $_POST['hari_reminder'] ?? 3;
  $jam_reminder = $_POST['jam_reminder'] ?? '08:00:00';
  $pesan = $_POST['pesan'] ?? '';
  $now = date('Y-m-d H:i:s');
  $q = $conn->prepare("UPDATE notifikasi SET tipe=?, aktif=?, hari_reminder=?, jam_reminder=?, pesan=?, terakhir_update=? WHERE id=?");
  $q->bind_param("siisssi", $tipe, $aktif, $hari_reminder, $jam_reminder, $pesan, $now, $id);
  $ok = $q->execute();
  echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'hapus') {
  $id = $_POST['id'] ?? 0;
  $q = $conn->prepare("DELETE FROM notifikasi WHERE id=?");
  $q->bind_param("i", $id);
  $ok = $q->execute();
  echo json_encode(["success"=>$ok]);
}
else {
  echo json_encode(["error"=>"Aksi tidak dikenali"]);
}
?>
