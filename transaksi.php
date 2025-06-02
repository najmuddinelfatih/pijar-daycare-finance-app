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
if ($conn->connect_error) die(json_encode(["error" => "Koneksi gagal"]));

$aksi = $_GET['aksi'] ?? 'list';

if ($aksi == 'list') {
    $res = $conn->query(
        "SELECT t.*, 
            a.nama as akun_nama, 
            k.nama as kategori_nama, 
            k.jenis as kategori_jenis
        FROM transaksi t 
        LEFT JOIN akun_kas a ON t.akun_id=a.id
        LEFT JOIN kategori k ON t.kategori_id=k.id
        ORDER BY t.tanggal DESC, t.id DESC"
    );
    $rows = [];
    while ($row = $res->fetch_assoc()) $rows[] = $row;
    echo json_encode($rows);
}

else if ($aksi == 'tambah') {
    $tanggal = $_POST['tanggal'] ?? '';
    $akun_id = $_POST['akun_id'] ?? 0;
    $kategori_id = $_POST['kategori_id'] ?? 0;
    $deskripsi = $_POST['deskripsi'] ?? '';
    $jumlah = $_POST['jumlah'] ?? 0;
    $jenis = $_POST['jenis'] ?? '';
    $metode = $_POST['metode'] ?? '';
    $referensi = $_POST['referensi'] ?? '';
    $bukti = '';

    if (isset($_FILES['bukti']) && $_FILES['bukti']['tmp_name']) {
    $ext = pathinfo($_FILES['bukti']['name'], PATHINFO_EXTENSION);
    $bukti = "uploads/bukti_" . time() . "_" . rand(1000,9999) . "." . $ext;
    move_uploaded_file($_FILES['bukti']['tmp_name'], $bukti);
    }

    $q = $conn->prepare("INSERT INTO transaksi (tanggal, akun_id, kategori_id, deskripsi, jumlah, jenis, metode, referensi, bukti) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $q->bind_param("siissssss", $tanggal, $akun_id, $kategori_id, $deskripsi, $jumlah, $jenis, $metode, $referensi, $bukti);

    $ok = $q->execute();
    echo json_encode(["success" => $ok]);
}

else if ($aksi == 'edit') {
    $id = $_POST['id'] ?? 0;
    $tanggal = $_POST['tanggal'] ?? '';
    $akun_id = $_POST['akun_id'] ?? 0;
    $kategori_id = $_POST['kategori_id'] ?? 0;
    $deskripsi = $_POST['deskripsi'] ?? '';
    $jumlah = $_POST['jumlah'] ?? 0;
    $jenis = $_POST['jenis'] ?? '';
    $metode = $_POST['metode'] ?? '';
    $referensi = $_POST['referensi'] ?? '';
    $bukti_lama = $_POST['bukti_bayar_old'] ?? '';
    $bukti_baru = '';

    if (isset($_FILES['bukti']) && $_FILES['bukti']['tmp_name']) {
        $ext = pathinfo($_FILES['bukti']['name'], PATHINFO_EXTENSION);
        $bukti_baru = "uploads/bukti_" . time() . "_" . rand(1000,9999) . "." . $ext;
        move_uploaded_file($_FILES['bukti']['tmp_name'], $bukti_baru);
    }

    $bukti_final = $bukti_baru ? $bukti_baru : $bukti_lama;

    $q = $conn->prepare("UPDATE transaksi SET tanggal=?, akun_id=?, kategori_id=?, deskripsi=?, jumlah=?, jenis=?, metode=?, referensi=?, bukti=? WHERE id=?");
    $q->bind_param("siisssssssi", $tanggal, $akun_id, $kategori_id, $deskripsi, $jumlah, $jenis, $metode, $referensi, $bukti_final, $id);

    $ok = $q->execute();
    echo json_encode(["success" => $ok]);
}

else if ($aksi == 'hapus') {
    $id = $_POST['id'] ?? 0;
    $q = $conn->prepare("DELETE FROM transaksi WHERE id=?");
    $q->bind_param("i", $id);
    $ok = $q->execute();
    echo json_encode(["success" => $ok]);
}

else {
    echo json_encode(["error" => "Aksi tidak dikenali"]);
}
?>
