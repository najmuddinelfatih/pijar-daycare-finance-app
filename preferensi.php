<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$host = "localhost"; $user = "u516826482_financeuser"; $pass = "o&3Sxtf/aO7?"; $dbname = "u516826482_financeapp";
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) die(json_encode(["error"=>"Koneksi gagal"]));

$aksi = $_GET['aksi'] ?? 'get';

if ($aksi == 'get') {
  $res = $conn->query("SELECT * FROM preferensi LIMIT 1");
  $row = $res->fetch_assoc();
  echo json_encode($row);
}
else if ($aksi == 'save') {
  $date_format = $_POST['date_format'] ?? 'DD/MM/YYYY';
  $bahasa = $_POST['bahasa'] ?? 'ID';
  $currency = $_POST['currency'] ?? 'IDR';
  $reminder_auto = $_POST['reminder_auto'] ?? 1;
  $theme = $_POST['theme'] ?? 'default';
  $res = $conn->query("SELECT id FROM preferensi LIMIT 1");
  $row = $res->fetch_assoc();
  if ($row) {
    $id = $row['id'];
    $q = $conn->prepare("UPDATE preferensi SET date_format=?, bahasa=?, currency=?, reminder_auto=?, theme=? WHERE id=?");
    $q->bind_param("sssisi", $date_format, $bahasa, $currency, $reminder_auto, $theme, $id);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
  } else {
    $q = $conn->prepare("INSERT INTO preferensi (date_format, bahasa, currency, reminder_auto, theme) VALUES (?, ?, ?, ?, ?)");
    $q->bind_param("sssiss", $date_format, $bahasa, $currency, $reminder_auto, $theme);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
  }
}
else {
  echo json_encode(["error"=>"Aksi tidak dikenali"]);
}
?>
