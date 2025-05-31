<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$host = "localhost"; $user = "u516826482_financeuser"; $pass = "o&3Sxtf/aO7?"; $dbname = "u516826482_financeapp";
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) die(json_encode(["error"=>"Koneksi gagal"]));

function simpanBukti($field) {
  if (isset($_FILES[$field]) && $_FILES[$field]['tmp_name']) {
    $ext = pathinfo($_FILES[$field]['name'], PATHINFO_EXTENSION);
    $newName = uniqid("bukti_") . "." . strtolower($ext);
    $folder = "uploads/";
    if (!file_exists($folder)) mkdir($folder, 0777, true);
    $target = $folder . $newName;
    if (move_uploaded_file($_FILES[$field]['tmp_name'], $target)) {
      return $target;
    }
  }
  return '';
}

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
  $tgl_tagihan = $_POST['tgl_tagihan'] ?? '';
  $bukti = simpanBukti('bukti_bayar');

  $q = $conn->prepare("INSERT INTO tagihan (nama_siswa, wali_wa, bulan, keterangan, nominal, status, tgl_tagihan, bukti_bayar)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  $q->bind_param("ssssisss", $nama_siswa, $wali_wa, $bulan, $keterangan, $nominal, $status, $tgl_tagihan, $bukti);
  $ok = $q->execute();
  echo json_encode(["success" => $ok]);
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
  $tgl_tagihan = $_POST['tgl_tagihan'] ?? '';
  $bukti_lama = $_POST['bukti_bayar_old'] ?? '';
  $bukti_baru = simpanBukti('bukti_bayar');

  $bukti_final = $bukti_baru ? $bukti_baru : $bukti_lama;

  $q = $conn->prepare("UPDATE tagihan SET nama_siswa=?, wali_wa=?, bulan=?, keterangan=?, nominal=?, status=?, tgl_tagihan=?, bukti_bayar=? WHERE id=?");
  $q->bind_param("ssssisssi", $nama_siswa, $wali_wa, $bulan, $keterangan, $nominal, $status, $tgl_tagihan, $bukti_final, $id);
  $ok = $q->execute();
  echo json_encode(["success" => $ok]);
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
