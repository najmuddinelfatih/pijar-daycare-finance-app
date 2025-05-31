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

$aksi = $_GET['aksi'] ?? 'get';

// Ambil data identitas (ambil baris pertama saja)
if ($aksi == 'get') {
    $res = $conn->query("SELECT * FROM identitas LIMIT 1");
    $row = $res->fetch_assoc();
    echo json_encode($row ?: []);
}

// Simpan (update) data nama dan logo daycare
else if ($aksi == 'update') {
    $nama = $_POST['nama'] ?? '';
    $logo = $_FILES['logo']['name'] ?? ($_POST['logo'] ?? ''); // Logo file baru atau string
    $target = '';

    if (isset($_FILES['logo']) && $_FILES['logo']['tmp_name']) {
        $target = 'uploads/' . basename($_FILES['logo']['name']);
        move_uploaded_file($_FILES['logo']['tmp_name'], $target);
        $logo = $target;
    }

    // Hanya update nama/atau logo saja sesuai kebutuhan
    if ($logo && $nama) {
        $q = $conn->prepare("UPDATE identitas SET nama=?, logo=? WHERE id=1");
        $q->bind_param("ss", $nama, $logo);
    } else if ($logo) {
        $q = $conn->prepare("UPDATE identitas SET logo=? WHERE id=1");
        $q->bind_param("s", $logo);
    } else {
        $q = $conn->prepare("UPDATE identitas SET nama=? WHERE id=1");
        $q->bind_param("s", $nama);
    }
    $ok = $q->execute();
    echo json_encode(["success"=>$ok, "logo"=>$logo]);
}

else {
    echo json_encode(["error"=>"Aksi tidak dikenali"]);
}
?>
