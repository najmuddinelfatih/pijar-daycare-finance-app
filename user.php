<?php
header('Content-Type: application/json');
$host = "localhost"; $user = "user"; $pass = "password"; $dbname = "db_name";
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) die(json_encode(["error"=>"Koneksi gagal"]));

$aksi = $_GET['aksi'] ?? 'list';

if ($aksi == 'list') {
  $res = $conn->query("SELECT * FROM user ORDER BY id DESC");
  $rows = [];
  while ($row = $res->fetch_assoc()) $rows[] = $row;
  echo json_encode($rows);
}
else if ($aksi == 'login') {
  $email = $_POST['email'] ?? '';
  $password = $_POST['password'] ?? '';
  $res = $conn->query("SELECT * FROM user WHERE email='$email' LIMIT 1");
  if ($row = $res->fetch_assoc()) {
    if (password_verify($password, $row['password'])) {
      // Return user info, jangan return password!
      unset($row['password']);
      echo json_encode(['success'=>true, 'user'=>$row]);
    } else {
      echo json_encode(['success'=>false, 'msg'=>'Password salah']);
    }
  } else {
    echo json_encode(['success'=>false, 'msg'=>'User tidak ditemukan']);
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
