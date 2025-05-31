<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
$host = "localhost";
$user = "u516826482_financeuser";
$pass = "o&3Sxtf/aO7?";
$dbname = "u516826482_financeapp";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) die("DB error");

// Tabel-tabel yang mau di-backup
$tables = ["user", "akun_kas", "kategori", "notifikasi", "preferensi", "transaksi",];

if (isset($_GET['aksi']) && $_GET['aksi'] == 'download') {
    $zip = new ZipArchive();
    $zipFilename = "backup_daycare_" . date("Ymd_His") . ".zip";
    $zip->open($zipFilename, ZipArchive::CREATE);

    foreach ($tables as $table) {
        $res = $conn->query("SELECT * FROM $table");
        $csv = fopen("php://temp", "w+");
        // Header kolom
        if ($res->num_rows > 0) {
            fputcsv($csv, array_keys($res->fetch_assoc()));
            $res->data_seek(0);
            while ($row = $res->fetch_assoc()) {
                fputcsv($csv, $row);
            }
        }
        rewind($csv);
        $csvStr = stream_get_contents($csv);
        fclose($csv);
        $zip->addFromString($table . ".csv", $csvStr);
    }
    $zip->close();

    header("Content-Type: application/zip");
    header("Content-Disposition: attachment; filename=\"$zipFilename\"");
    readfile($zipFilename);
    unlink($zipFilename);
    exit();
}
echo json_encode(["info"=>"API backup csv siap!"]);
?>
