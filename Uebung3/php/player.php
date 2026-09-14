<?php

include 'setupDB.php';

if(isset($_REQUEST['first_name']) && isset($_REQUEST['last_name']) && isset($_REQUEST['e-mail']) && isset($_REQUEST['password'])) {
    $name = $_REQUEST['first_name'] . " " . $_REQUEST['last_name'];
    $email = $_REQUEST['e-mail'];
    $passwort = $_REQUEST['password'];
    insertPlayer($name, $email, $passwort);
} else {
    insertPlayer("Markus Mustermann", "mustermann@uni-bremen.de", "1234");
    insertPlayer("Erna Mustermann", "emustermann@uni-bremen.de", "4567");
}

function insertPlayer($name, $email, $passwort)
{
    $conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);

    $sql1 = "SELECT * FROM Spieler WHERE email = '$email'";
    if ($conn->query($sql1)->num_rows > 0) {
        echo "Konto mit E-Mail $email ist bereits vorhanden. \n";
        return;
    }

    $sql2 = "INSERT INTO Spieler (spielname, email, passwort, `level`) VALUES ('$name', '$email', '$passwort', 1)";
    if ($conn->query($sql2) === TRUE) {
    echo "$name erfolgreich registriert \n";
    } else {
        echo "Error: " . $sql2 . $conn->error;
    }

    closeDBConnection($conn);

}
?>