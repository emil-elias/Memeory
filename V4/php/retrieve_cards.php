<?php

//alle karten aus der DB holen und als JSON zurückgeben
//das json enthält die karten id, das bild as base64 string und den namen der karte

include_once 'setupDB.php';

$conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);

$imageArray = array();

$sql = "SELECT * FROM karte";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $id = $row["id"];
        $bild = base64_encode($row["bild"]);
        $name = $row["name"];
        $imageObject = array("id" => $id, "image" => $bild, "name" => $name);
        $imageArray[] = $imageObject;
    }
}

$imageArrayJSON = json_encode($imageArray);
header('Content-Type: application/json');
echo $imageArrayJSON;

closeDBConnection($conn);

?>