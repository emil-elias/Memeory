<?php

include 'setupDB.php';

//falls Level übergeben, dieses einfügen
//ansonsten zwei Standardlevel einfügen
if (isset($_REQUEST['level_number']) && isset($_REQUEST['number_of_cards']) && isset($_REQUEST['level_minutes']) && isset($_REQUEST['level_seconds'])) {
    $level = $_REQUEST['level_number'];
    $anzahl_karten = $_REQUEST['number_of_cards'];
    $spielzeit = $_REQUEST['level_minutes']*60+$_REQUEST['level_seconds'];
    insertLevel($level, $anzahl_karten, $spielzeit);
} else {
    insertLevel(2,8,90);
    insertLevel(3,16,120);
}


function insertLevel($level, $anzahl_karten, $spielzeit) {
    $conn = openDBConnection() or die("Connect failed: %s\n". $conn -> error);
    $sql = "SELECT * FROM `Level` WHERE `level` = $level";
    if ($conn->query($sql)->num_rows > 0) {
        echo "Level mit Nummer $level ist bereits vorhanden. <br>";
    } else {
        $sql = "INSERT INTO `level` (`level`, anzahl_karten, spielzeit) VALUES ($level, $anzahl_karten, $spielzeit)";
        if ($conn->query($sql) === TRUE) {
            echo "Level $level erfolgreich hinzugefügt. <br>";
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }
    }
    
    closeDBConnection($conn);

}
?>