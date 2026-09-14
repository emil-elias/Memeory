<?php

include 'setupDB.php';

//Achtung: Dies setzt vorraus, dass bereits Spieler mit den IDs 1 und 2 existieren
insertPlay(1, "2020-01-01 12:00:00", 60, "beendet", 1, null, 1);
insertPlay(0, "2020-01-01 13:00:00", 120, "beendet", 1, 2, 2);
insertPlay(1, "2020-01-01 14:00:00", 180, "beendet", 1, null, 1);
insertPlay(0, "2020-01-01 15:00:00", 240, "abgebrochen", 2, 1, null);
insertPlay(1, "2020-01-01 16:00:00", 300, "abgelaufen", 2, null, null);

getPlayerPlays(1);

function insertPlay($einzeln, $spieltan, $dauer, $verlauf, $initiator, $mitspieler, $gewinner)
{

    $conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);
    $sql = $conn->prepare("INSERT INTO Spiel (einzeln, spieltan, dauer, verlauf, `initiator`, `mitspieler`, `gewinner`) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $sql->bind_param("isissii", $einzeln, $spieltan, $dauer, $verlauf, $initiator, $mitspieler, $gewinner);

    if ($sql->execute()) {
        echo "Spiel am $spieltan erfolgreich hinzugefügt \n";
    } else {
        echo "Error: " . $sql->error;
    }

    $sql->close();

    closeDBConnection($conn);


}

function getPlayerPlays($player_id)
{

    $conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);

    $sql0 = "SELECT spielname FROM spieler WHERE id = $player_id";
    $spielname = $conn->query($sql0)->fetch_assoc()["spielname"];

    //$sql1 = "SELECT * FROM `Spiel` WHERE `initiator` = $player_id OR `mitspieler` = $player_id";

    $sql2 = "SELECT 
    g.einzeln,
    g.spieltan,
    g.dauer,
    g.verlauf,
    i.id AS initiator_id,
    i.spielname AS initiator_spielname,
    i.level AS initiator_level,
    m.id AS mitspieler_id,
    m.spielname AS mitspieler_spielname,
    m.level AS mitspieler_level,
    w.id AS gewinner_id,
    w.spielname AS gewinner_spielname,
    w.level AS gewinner_level
  FROM spiel g
  LEFT JOIN spieler i ON g.`initiator` = i.id
  LEFT JOIN spieler m ON g.mitspieler = m.id
  LEFT JOIN spieler w ON g.gewinner = w.id
  WHERE i.id = $player_id OR m.id = $player_id
  ORDER BY g.spieltan DESC";

    $result = $conn->query($sql2);
    $plays = array();
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $play = $row;
            $iniator = [
                "id" => $row["initiator_id"],
                "spielname" => $row["initiator_spielname"],
                "level" => $row["initiator_level"]
            ];
            $mitspieler = [
                "id" => $row["mitspieler_id"],
                "spielname" => $row["mitspieler_spielname"],
                "level" => $row["mitspieler_level"]
            ];
            if ($mitspieler["id"] == null) $mitspieler = null;
            $gewinner = [
                "id" => $row["gewinner_id"],
                "spielname" => $row["gewinner_spielname"],
                "level" => $row["gewinner_level"]
            ];
            if  ($gewinner["id"] == null) $gewinner = null;
            $play["initiator"] = $iniator;
            $play["mitspieler"] = $mitspieler;
            $play["gewinner"] = $gewinner;
            unset($play["initiator_id"]);
            unset($play["initiator_spielname"]);
            unset($play["initiator_level"]);
            unset($play["mitspieler_id"]);
            unset($play["mitspieler_spielname"]);
            unset($play["mitspieler_level"]);
            unset($play["gewinner_id"]);
            unset($play["gewinner_spielname"]);
            unset($play["gewinner_level"]);
            $plays[] = $play;
        }

        echo "$result->num_rows Spiele von $spielname: \n";
        header('Content-Type: application/json');
        echo json_encode($plays, JSON_PRETTY_PRINT);
    } else {
        echo "Keine Spiele für $spielname: \n";
    }

    closeDBConnection($conn);



}

?>