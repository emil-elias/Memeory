<?php

//leaderboard aller Spieler ausgeben

include_once 'setupDB.php';

$conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);

$sql = "SELECT `id`, `spielname`, `level`, `xp` FROM spieler ORDER BY `xp` DESC";

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