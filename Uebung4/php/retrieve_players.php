<?php

//vollständige Spielerliste mit allen Daten (außer Passwort)
//dürfen nur admins

include_once 'setupDB.php';
include_once 'player.php';

ob_start();
$user = json_decode(getCurrentPlayer(false));
ob_end_clean();

if ($user->admin == 0) {
    header("HTTP/1.1 401 Unauthorized");
    echo "Keine Berechtigung";
    exit();
}

$conn = openDBConnection();

$sql = "SELECT `id`, `spielname`, `email`, `level`, xp, `admin` FROM Spieler";
$result = $conn->query($sql);

$players = array();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $players[] = $row;
    }
}

header('Content-Type: application/json');
echo json_encode($players, JSON_PRETTY_PRINT);

?>