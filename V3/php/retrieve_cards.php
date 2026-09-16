<?php

include 'setupDB.php';

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