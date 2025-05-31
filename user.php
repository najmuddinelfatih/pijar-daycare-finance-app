<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$host = "localhost"; $user = "u516826482_financeuser"; $pass = "o&3Sxtf/aO7?"; $dbname = "u516826482_financeapp";
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) die(json_encode(["error"=>"Koneksi gagal"]));

$aksi = $_GET['aksi'] ?? 'list';

if ($aksi == 'list') {
  $res = $conn->query("SELECT * FROM user ORDER BY id DESC");
  $rows = [];
  while ($row = $res->fetch_assoc()) $rows[] = $row;
  // Debug: print semua email ke file
  file_put_contents('user_list.txt', implode(", ", array_column($rows, "email")));
  echo json_encode($rows);
}

else if ($aksi == 'login') {
  $email = trim($_POST['email'] ?? '');
  $pw = $_POST['password'] ?? '';
  $q = $conn->prepare("SELECT * FROM user WHERE email=? LIMIT 1");
  $q->bind_param("s", $email);
  $q->execute();
  $res = $q->get_result();
  if ($user = $res->fetch_assoc()) {
    if (password_verify($pw, $user['password'])) {
      unset($user['password']);
      echo json_encode(["success"=>true, "user"=>$user]);
    } else {
      echo json_encode(["success"=>false, "msg"=>"Password salah"]);
    }
  } else {
    echo json_encode(["success"=>false, "msg"=>"Email tidak ditemukan"]);
  }
}


else if ($aksi == 'request_reset') {
  $email = $_POST['email'] ?? '';
  $res = $conn->query("SELECT * FROM user WHERE email='$email' LIMIT 1");
  if ($user = $res->fetch_assoc()) {
    $token = bin2hex(random_bytes(32));
    $expiry = date("Y-m-d H:i:s", time()+900); // 15 menit dari sekarang
    $q = $conn->prepare("UPDATE user SET reset_token=?, reset_expiry=? WHERE id=?");
    $q->bind_param("ssi", $token, $expiry, $user['id']);
    $ok = $q->execute();
    // Kirim email (gunakan mail() atau PHPMailer di sini)
    
    $link = "https://pijarmontessoriislam.id/api/reset-password?token=$token";
    $to = $email;
    $subject = "Reset Password Akun Anda";
    $message = "Klik link berikut untuk reset password (berlaku 15 menit): $link";
    $headers = "From: Pijar Daycare - Web Dev <noreply@pijarmontessoriislam.id>\r\n" .
           "Reply-To: noreply@pijarmontessoriislam.id\r\n" .
           "X-Mailer: PHP/" . phpversion();
    mail($to, $subject, $message, $headers);
    echo json_encode(["success"=>true]);
  } else {
    echo json_encode(["success"=>false,"msg"=>"Email tidak ditemukan"]);
  }
}
else if ($aksi == 'resetpw_token') {
  $token = $_POST['token'] ?? '';
  $password = $_POST['password'] ?? '';
  $res = $conn->query("SELECT * FROM user WHERE reset_token='$token' AND reset_expiry > NOW() LIMIT 1");
  if ($user = $res->fetch_assoc()) {
    $pw_hash = password_hash($password, PASSWORD_DEFAULT);
    $q = $conn->prepare("UPDATE user SET password=?, reset_token=NULL, reset_expiry=NULL WHERE id=?");
    $q->bind_param("si", $pw_hash, $user['id']);
    $ok = $q->execute();
    echo json_encode(["success"=>$ok]);
  } else {
    echo json_encode(["success"=>false,"msg"=>"Token tidak valid atau expired"]);
  }
}
else if ($aksi == 'tambah') {
  $nama = $_POST['nama'] ?? '';
  $email = $_POST['email'] ?? '';
  $role = $_POST['role'] ?? 'Viewer';
  $status = $_POST['status'] ?? 'Aktif';
  $password = password_hash('123456', PASSWORD_DEFAULT); // default password
  $q = $conn->prepare("INSERT INTO user (nama, email, password, role, status) VALUES (?, ?, ?, ?, ?)");
  $q->bind_param("sssss", $nama, $email, $password, $role, $status);
  $ok = $q->execute();
  echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'edit') {
  $id = $_POST['id'] ?? 0;
  $nama = $_POST['nama'] ?? '';
  $email = $_POST['email'] ?? '';
  $role = $_POST['role'] ?? 'Viewer';
  $status = $_POST['status'] ?? 'Aktif';
  $q = $conn->prepare("UPDATE user SET nama=?, email=?, role=?, status=? WHERE id=?");
  $q->bind_param("ssssi", $nama, $email, $role, $status, $id);
  $ok = $q->execute();
  echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'hapus') {
  $id = $_POST['id'] ?? 0;
  $q = $conn->prepare("DELETE FROM user WHERE id=?");
  $q->bind_param("i", $id);
  $ok = $q->execute();
  echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'resetpw') {
  $id = $_POST['id'] ?? 0;
  $password = password_hash('123456', PASSWORD_DEFAULT);
  $q = $conn->prepare("UPDATE user SET password=? WHERE id=?");
  $q->bind_param("si", $password, $id);
  $ok = $q->execute();
  echo json_encode(["success"=>$ok]);
}
else if ($aksi == 'toggle') {
  $id = $_POST['id'] ?? 0;
  $get = $conn->query("SELECT status FROM user WHERE id=$id");
  $s = $get->fetch_assoc()["status"];
  $new = ($s == "Aktif" ? "Nonaktif" : "Aktif");
  $q = $conn->prepare("UPDATE user SET status=? WHERE id=?");
  $q->bind_param("si", $new, $id);
  $ok = $q->execute();
  echo json_encode(["success"=>$ok]);
}
else {
  echo json_encode(["error"=>"Aksi tidak dikenali"]);
}
?>