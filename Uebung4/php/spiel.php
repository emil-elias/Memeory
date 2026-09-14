<?php

include_once 'setupDB.php';
include_once 'player.php';

if (isset($_REQUEST["function"])) {

    $function = $_REQUEST["function"];

    switch ($function) {
        case "getPlayerPlays":
            if (isset($_REQUEST["id"])) {
                $player_id = $_REQUEST["id"];
                getPlayerPlays($player_id);
            }
            break;
        case "getAllGames":
            getAllGames();
            break;
    }
} 

//neues Spiel starten/einfügen
function insertPlay($einzeln, $spieltan, $dauer, $level, $verlauf, $initiator, $mitspieler, $gewinner)
{

    $conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);
    $sql = $conn->prepare("INSERT INTO Spiel (einzeln, spieltan, `level`, dauer, verlauf, `initiator`, `mitspieler`, `gewinner`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $sql->bind_param("isiissii", $einzeln, $spieltan, $level, $dauer, $verlauf, $initiator, $mitspieler, $gewinner);

    $result = $sql->execute();

    if ($result) {
        echo "Spiel am $spieltan erfolgreich hinzugefügt \n";
    } else {
        echo "Error: " . $sql->error;
    }

    $sql->close();

    closeDBConnection($conn);


}

//Spielstand updaten
function updatePlay($id, $spieltan, $einzeln, $dauer, $verlauf, $gewinner, $echo=true)
{

    $conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);

    $sql = "UPDATE Spiel SET einzeln = ?, dauer = ?, verlauf = ?, gewinner = ? WHERE `initiator` = ? AND spieltan = ?";

    $stmt = $conn->prepare($sql);

    $stmt->bind_param("iissis", $einzeln, $dauer, $verlauf, $gewinner, $id, $spieltan);

    $result = $stmt->execute();

    if ($echo) {
        if ($result) {
            echo "Spiel erfolgreich geupdatet";
        } else {
            header("HTTP/1.1 409 Conflict");
            exit();
        }
    }
    

    closeDBConnection($conn);


}

//Alle Spiele eines Spielers ausgeben
//nur für admins oder den spieler selber
function getPlayerPlays($player_id)
{
    ob_start();
    $user = json_decode(getCurrentPlayer(false));
    ob_end_clean();

    if ($user->admin == 0 && $user->id != $player_id) {
        header("HTTP/1.1 401 Unauthorized");
        echo "Keine Berechtigung";
        exit();
    }

    $conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);

    //$sql0 = "SELECT spielname FROM spieler WHERE id = $player_id";
    //$spielname = $conn->query($sql0)->fetch_assoc()["spielname"];

    //$sql1 = "SELECT * FROM `Spiel` WHERE `initiator` = $player_id OR `mitspieler` = $player_id";

    $sql2 = "SELECT 
    g.einzeln,
    g.spieltan,
    g.level,
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
            if ($mitspieler["id"] == null)
                $mitspieler = null;
            $gewinner = [
                "id" => $row["gewinner_id"],
                "spielname" => $row["gewinner_spielname"],
                "level" => $row["gewinner_level"]
            ];
            if ($gewinner["id"] == null)
                $gewinner = null;
            $play["initiator"] = $iniator;
            $play["mitspieler"] = $mitspieler;
            $play["gewinner"] = $gewinner;
            $playDate = strtotime($play["spieltan"]);
            if ($play["verlauf"] == "laufend" && time() - $playDate >= 3600) {
                updatePlay($play["initiator_id"], $play["spieltan"], $play["einzeln"], $play["dauer"], "abgelaufen", null, false);
                $play["verlauf"] = "abgelaufen";
            }
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


    }

    header('Content-Type: application/json');
    echo json_encode($plays, JSON_PRETTY_PRINT);

    closeDBConnection($conn);



}

//Alle Spiele von allen Spielern
//nur für admins
function getAllGames()
{
   
    ob_start();
    $user = json_decode(getCurrentPlayer(false));
    ob_end_clean();

    if ($user->admin == 0) {
        header("HTTP/1.1 401 Unauthorized");
        echo "Keine Berechtigung";
        exit();
    }


    $conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);

    $sql2 = "SELECT 
    g.einzeln,
    g.spieltan,
    g.level,
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
            if ($mitspieler["id"] == null)
                $mitspieler = null;
            $gewinner = [
                "id" => $row["gewinner_id"],
                "spielname" => $row["gewinner_spielname"],
                "level" => $row["gewinner_level"]
            ];
            if ($gewinner["id"] == null)
                $gewinner = null;
            $play["initiator"] = $iniator;
            $play["mitspieler"] = $mitspieler;
            $play["gewinner"] = $gewinner;
            $playDate = strtotime($play["spieltan"]);
            if ($play["verlauf"] == "laufend" && time() - $playDate >= 3600) {
                updatePlay($play["initiator_id"], $play["spieltan"], $play["einzeln"], $play["dauer"], "abgelaufen", null, false);
                $play["verlauf"] = "abgelaufen";
            }
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


    }

    header('Content-Type: application/json');
    echo json_encode($plays, JSON_PRETTY_PRINT);

    closeDBConnection($conn);

}

?>