<?php

//alle level aus der DB holen und als JSON zurückgeben

include_once 'setupDB.php';

$conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);

$levelArray = array();

$sql = "SELECT * FROM level";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $level = $row["level"];
        $anzahl_karten = $row["anzahl_karten"];
        $spielZeit = $row["spielZeit"];
        $xp = $row["xp"];
        $levelObject = array("level" => $level, "anzahl_karten" => $anzahl_karten, "spielZeit" => $spielZeit, "xp" => $xp);
        $levelArray[] = $levelObject;
    }
}

$levelArrayJSON = json_encode($levelArray);
header('Content-Type: application/json');
echo $levelArrayJSON;

closeDBConnection($conn);
?>