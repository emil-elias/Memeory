<?php

//ein spezifisches Level ausgeben
//json antwort enthät das level mit nummer, anzahl karten, spielzeit und benötigten xp
//sowie ein array mit allen spielern die sich aktuell in diesem level befinden, sortiert nach xp

include_once 'setupDB.php';

if (!isset($_REQUEST['level'])) {
    header("HTTP/1.1 400 Bad Request");
    echo "Keine Level Nummer angegeben";
    exit();
}

$level = $_REQUEST['level'];

$conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);

$sql1 = "SELECT * FROM `level` where `level` = $level";

$result = $conn->query($sql1);
$levelData = $result->fetch_assoc();


$players = array();
$sql2 = "SELECT `id`, `spielname`, `xp` FROM `spieler` where `level` = $level ORDER BY `xp` DESC";	
$playersResult = $conn->query($sql2);

if ($playersResult->num_rows > 0) {
    while ($row = $playersResult->fetch_assoc()) {
        $players[] = $row;
    }
}

$response = array("level" => $levelData, "players" => $players);

header('Content-Type: application/json');
echo json_encode($response, JSON_PRETTY_PRINT);

closeDBConnection($conn);

?>