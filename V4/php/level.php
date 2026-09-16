<?php

include_once 'setupDB.php';
include_once 'player.php';


if (isset($_REQUEST["function"])) {

    $function = $_REQUEST["function"];

    switch ($function) {
        case "insert":
            if (isset($_REQUEST['level_number']) && isset($_REQUEST['number_of_cards']) && isset($_REQUEST['level_minutes']) && isset($_REQUEST['level_seconds']) && isset($_REQUEST['level_xp'])) {
                $level = $_REQUEST['level_number'];
                $anzahl_karten = $_REQUEST['number_of_cards'];
                $spielzeit = $_REQUEST['level_minutes'] * 60 + $_REQUEST['level_seconds'];
                $xp = $_REQUEST['level_xp'];

                insertLevel($level, $anzahl_karten, $spielzeit, $xp);

            }

            break;
        case "edit":
            if (isset($_REQUEST['level_number']) && isset($_REQUEST['number_of_cards']) && isset($_REQUEST['level_minutes']) && isset($_REQUEST['level_seconds']) && isset($_REQUEST['level_xp'])) {
                $level = $_REQUEST['level_number'];
                $anzahl_karten = $_REQUEST['number_of_cards'];
                $spielzeit = $_REQUEST['level_minutes'] * 60 + $_REQUEST['level_seconds'];
                $xp = $_REQUEST['level_xp'];

                editLevel($level, $anzahl_karten, $spielzeit, $xp);


            }
            break;
        case "delete":
            if (isset($_REQUEST['level_number'])) {
                $level = $_REQUEST['level_number'];

                deleteLevel($level);

            }
            break;
    }
}


function insertLevel($level, $anzahl_karten, $spielzeit, $xp)
{

    ob_start();
    $user = json_decode(getCurrentPlayer(false));
    ob_end_clean();

    //nur admins dürfen level einfügen
    if ($user->admin == 0) {
        header("HTTP/1.1 401 Unauthorized");
        echo "Keine Berechtigung";
        exit();
    }

    $conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);
    $sql = "SELECT * FROM `Level` WHERE `level` = $level";
    if ($conn->query($sql)->num_rows > 0) {
        echo "Level mit Nummer $level ist bereits vorhanden. <br>";
    } else {
        $sql = "INSERT INTO `level` (`level`, anzahl_karten, spielzeit, xp) VALUES ($level, $anzahl_karten, $spielzeit, $xp)";
        if ($conn->query($sql) === TRUE) {
            echo "Level $level erfolgreich hinzugefügt. <br>";
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }
    }

    closeDBConnection($conn);

}

function editLevel($level, $anzahl_karten, $spielzeit, $xp)
{

    ob_start();
    $user = json_decode(getCurrentPlayer(false));
    ob_end_clean();

    //nur admins dürfen level bearbeiten
    if ($user->admin == 0) {
        header("HTTP/1.1 401 Unauthorized");
        echo "Keine Berechtigung";
        exit();
    }

    $conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);
    $sql = "SELECT * FROM `Level` WHERE `level` = $level";
    if ($conn->query($sql)->num_rows > 0) {
        $sql2 = "UPDATE `level` SET anzahl_karten = $anzahl_karten, spielzeit = $spielzeit, xp = $xp WHERE `level` = $level";
        if ($conn->query($sql2) === TRUE) {
            echo "Level $level erfolgreich geändert.";
        } else {
            echo "Error: " . $sql2 . "<br>" . $conn->error;
        }
    } else {
        header("HTTP/1.1 404 Not Found");
        echo "Level mit Nummer $level ist nicht vorhanden. <br>";
        exit();
    }

    closeDBConnection($conn);

}

function deleteLevel($number)
{

    ob_start();
    $user = json_decode(getCurrentPlayer(false));
    ob_end_clean();

    //nur admins dürfen level löschen
    if ($user->admin == 0) {
        header("HTTP/1.1 401 Unauthorized");
        echo "Keine Berechtigung";
        exit();
    }

    $conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);
    $sql = "SELECT * FROM `Level`";
    $result = $conn->query($sql);
    if ($number != $result->num_rows) {
        header("HTTP/1.1 409 Conflict");
        echo "Level $number kann nicht gelöscht werden, da es nicht das letzte Level ist. <br> Du musst zuerst höhrere Level löschen.";
        exit();
    } else {
        //Alle Spieler mit dem Level müssen ein Level zurückgestuft werden, bevor es gelöscht werden kann
        $sql2 = "UPDATE `spieler` SET `level` = $number - 1 WHERE `level` = $number";
        if ($conn->query($sql2) === TRUE) {
            $sql3 = "DELETE FROM `level` WHERE `level` = $number";
            if ($conn->query($sql3) === TRUE) {
                echo "Level $number erfolgreich gelöscht.";
            } else {
                echo "Error: " . $sql . "<br>" . $conn->error;
            }
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }


        closeDBConnection($conn);
    }

}
?>