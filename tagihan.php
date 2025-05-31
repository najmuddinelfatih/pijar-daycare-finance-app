<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$host = "localhost"; $user = "u516826482_financeuser"; $pass = "o&3Sxtf/aO7?"; $dbname = "u516826482_financeapp";
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) die(json_encode(["error"=>"Koneksi gagal"]));

$aksi = $_GET['aksi'] ?? 'list';

// GET / LIST
if ($aksi == 'list') {
  $res = $conn->query("SELECT * FROM tagihan ORDER BY id DESC");
  $rows = [];
  while ($row = $res->fetch_assoc()) $rows[] = $row;
  echo json_encode($rows);
}
// TAMBAH
else if ($aksi == 'tambah') {
  $nama_siswa = $_POST['nama_siswa'] ?? '';
  $wali_wa = $_POST['wali_wa'] ?? '';
  $bulan = $_POST['bulan'] ?? '';
  $keterangan = $_POST['keterangan'] ?? '';
  $nominal = $_POST['nominal'] ?? 0;
  $status = $_POST['status'] ?? 'Belum Lunas';
  $tgl_tagihan = $_POST['tgl_tagihan'] ?? date('Y-m-d');
  $bukti_bayar = "";
  // Handle file upload
  if (isset($_FILES['bukti_bayar'])) {
    $fname = time().'_'.basename($_FILES['bukti_bayar']['name']);
    move_uploaded_file($_FILES['bukti_bayar']['tmp_name'], "../uploads/$fname");
    $bukti_bayar = "uploads/$fname";
  }
  $q = $conn->prepare("INSERT INTO tagihan (nama_siswa, wali_wa, bulan, keterangan, nominal, status, bukti_bayar, tgl_tagihan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  $q->bind_param("ssssisss", $nama_siswa, $wali_wa, $bulan, $keterangan, $nominal, $status, $bukti_bayar, $tgl_tagihan);
  $ok = $q->execute();
  echo json_encode(["success"=>$ok]);
}
// EDIT
else if ($aksi == 'edit') {
  $id = $_POST['id'] ?? 0;
  $nama_siswa = $_POST['nama_siswa'] ?? '';
  $wali_wa = $_POST['wali_wa'] ?? '';
  $bulan = $_POST['bulan'] ?? '';
  $keterangan = $_POST['keterangan'] ?? '';
  $nominal = $_POST['nominal'] ?? 0;
  $status = $_POST['status'] ?? 'Belum Lunas';
  $tgl_tagihan = $_POST['tgl_tagihan'] ?? date('Y-m-d');
  $tgl_bayar = ($status == "Lunas") ? date('Y-m-d H:i:s') : NULL;
  $bukti_bayar = $_POST['bukti_bayar_old'] ?? "";
  if (isset($_FILES['bukti_bayar'])) {
    $fname = time().'_'.basename($_FILES['bukti_bayar']['name']);
    move_uploaded_file($_FILES['bukti_bayar']['tmp_name'], "../uploads/$fname");
    $bukti_bayar = "uploads/$fname";
  }
  $q = $conn->prepare("UPDATE tagihan SET nama_siswa=?, wali_wa=?, bulan=?, keterangan=?, nominal=?, status=?, bukti_bayar=?, tgl_tagihan=?, tgl_bayar=? WHERE id=?");
  $q->bind_param("ssssissssi", $nama_siswa, $wali_wa, $bulan, $keterangan, $nominal, $status, $bukti_bayar, $tgl_tagihan, $tgl_bayar, $id);
  $ok = $q->execute();
  echo json_encode(["success"=>$ok]);
}
// HAPUS
else if ($aksi == 'hapus') {
  $id = $_POST['id'] ?? 0;
  $q = $conn->prepare("DELETE FROM tagihan WHERE id=?");
  $q->bind_param("i", $id);
  $ok = $q->execute();
  echo json_encode(["success"=>$ok]);
}
else {
  echo json_encode(["error"=>"Aksi tidak dikenali"]);
}
?>
