<?php

include_once 'setupDB.php';
include_once 'player.php';

//falls Karte übergeben, diese einfügen
if (isset($_FILES['newcard-picture']) && isset($_REQUEST['newcard-name'])) {
    $bild = file_get_contents($_FILES['newcard-picture']['tmp_name']);
    $name = $_REQUEST['newcard-name'];

    insertCard($bild, $name);
} 

function insertCard($bild, $name)
{
    ob_start();
    $user = json_decode(getCurrentPlayer(false));
    ob_end_clean();

    //nur admins dürfen karten einfügen
    if ($user->admin == 0) {
        header("HTTP/1.1 401 Unauthorized");
        echo "Keine Berechtigung";
        exit();
    }

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