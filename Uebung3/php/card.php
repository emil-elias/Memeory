<?php

include 'setupDB.php';

//falls Karte übergeben, diese einfügen
//ansonsten drei Standardkarten einfügen
if (isset($_FILES['newcard-picture']) && isset($_REQUEST['newcard-name'])) {
    $bild = file_get_contents($_FILES['newcard-picture']['tmp_name']);
    $name = $_REQUEST['newcard-name'];

    insertCard($bild, $name);
} else {

    $lion = file_get_contents('../images/cards/lion.jpg');
    $lionname = "Löwe";
    insertCard($lion, $lionname);

    $penguin = file_get_contents('../images/cards/penguin.jpg');
    $penguinname = "Pinguin";
    insertCard($penguin, $penguinname);

    $dolphin = file_get_contents('../images/cards/dolphin.jpg');
    $dolphinname = "Delfin";
    insertCard($dolphin, $dolphinname);
    
}

function insertCard($bild, $name)
{
    $conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);
    $bild = mysqli_real_escape_string($conn, $bild);
    $sql = "INSERT INTO karte (bild, `name`) VALUES ('$bild', '$name')";

    if ($conn->query($sql) === TRUE) {
        echo "Karte '$name' erfolgreich hinzugefügt <br>";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

    closeDBConnection($conn);

}
?>