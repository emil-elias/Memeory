<?php

include_once 'spiel.php';
include_once 'player.php';

ob_start(); 
session_start();
ob_end_clean(); 

if (isset($_REQUEST['function'])) {

    $function = $_REQUEST['function'];

    switch ($function) {
        case "start":
            $game = $_POST['game'];
            startNewGame($game);
            break;
        case "update":
            $game = $_POST['game'];
            updateGame($game);
            break;
        case "finish":
            $game = $_POST['game'];
            finishGame($game);
            break;
        case "get":
            getGame();
            break;
    }
}

//neues Spiel starten
function startNewGame($game)
{

    $_SESSION['game'] = $game;
    if (getCurrentPlayer(false) != null) {
        $gameObject = json_decode($game);
        insertPlay($gameObject->einzeln, $gameObject->spieltan, $gameObject->dauer, $gameObject->level, $gameObject->verlauf, $gameObject->initiator, $gameObject->mitspieler, $gameObject->gewinner);
    }
}

//Spielstand updaten
function updateGame($game)
{
    $_SESSION['game'] = $game;
    $gameObject = json_decode($game);
    if (getCurrentPlayer(false) != null) {
        updatePlay($gameObject->userId, $gameObject->spieltan, $gameObject->einzeln, $gameObject->dauer, $gameObject->verlauf, $gameObject->gewinner);
    }
}

//Spiel beenden und XP berechnen
function finishGame($game)
{
    unset($_SESSION['game']);
    $gameObject = json_decode($game);

    ob_start(); //echo einfangen, da wir es nicht in der Antwort haben wollen
    $user = json_decode(getCurrentPlayer(false));
    ob_end_clean();

    if ($user != null) {
        ob_start(); 
        updatePlay($gameObject->userId, $gameObject->spieltan, $gameObject->einzeln, $gameObject->dauer, $gameObject->verlauf, $gameObject->gewinner);
        ob_end_clean();
        calculateXP($game);
    }

}

//Diese Methode war usprünglich dafür geplant,
//zu schauen ob ein Spieler bereits ein spiel gestartet hatte und die Seite verlassen hat
//um es ggf wiederherzustellen
//leider hat sie nicht funktioniert
function getGame()
{
    if (isset($_SESSION['game'])) {
        echo $_SESSION['game'];
        return $_SESSION['game'];
    } else {
        header("HTTP/1.1 404 Not Found");
        exit();
    }
}

//berechnet die XP anhand der Spielzeit eines Spiels
//und legt ggf ein neues Level fest
function calculateXP($game)
{
    ob_start(); //echo einfangen, da wir es nicht in der Antwort haben wollen
    $user = json_decode(getCurrentPlayer(false));
    ob_end_clean();

    //redundant, da getCurrentPlayer schon exiten würde, 
    //aber sicher ist sicher
    if ($user == null) {
        header("HTTP/1.1 404 Not Found");
        echo " Kein Spieler gefunden. \n";
        exit();
    }

    $gameObject = json_decode($game);

    $conn = openDBConnection();

    //zunächst alle Level zum vergleichen holen
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

    //aktuelles Level des Users auslesen
    $userLevel = $levelArray[$user->level - 1];

    $newXP = $user->xp;

    //neue XP anhand der Dauer berechnen
    //desto kürzer der Spieler gebraucht hat,
    //desto mehr XP bekommt er
    if ($gameObject->dauer >= 0 && $userLevel["spielZeit"] >= $gameObject->dauer) {
        //wurde mit einer niedrigeren Spielzeit als der des aktuellen Levels gespielt, dann diese als Berechnungsgrundlage verwenden um Vorteile zu verhindern
        //Bei größeren Spielzeiten wird trotzdem die Spielzeit des aktuellen Levels genommen
        if ($userLevel["spielZeit"] > $gameObject->spielZeit) {
            $newXP +=  $gameObject->spielZeit - $gameObject->dauer;
        } else {
            $newXP += $userLevel["spielZeit"] - $gameObject->dauer;
        }
        
    }

    //0 XP haben nur ganz neue Spieler, die noch kein Spiel gespielt haben
    //hat ein Spieler immernoch 0 XP, bekommt er hier 1 XP um anzuzeigen, dass er bereits ein Spiel gespielt hat
    if ($newXP == 0) {
        $newXP = 1;
    }

    $newLevel = $user->level;

    //nachschauen, ob der Spieler ein neues Level erreicht hat
    for ($i = 0; $i < count($levelArray); $i++) {
        if ($newXP >= $levelArray[$i]["xp"]) {
            $newLevel = $levelArray[$i]["level"];
        }
    }
    
    //wir wollen allerdings keine Spieler zurückstufen,
    //es könnte ja auch sein, dass der Spieler direkt in einem sehr hohen Level gestartet ist
    //für dass er eigentlich noch nicht genug xp hat
    if ($newLevel < $user->level) {
        $newLevel = $user->level;
    }



    $sql2 = "UPDATE Spieler SET xp = $newXP, `level` = $newLevel WHERE id = $user->id and `level` = $user->level and xp = $user->xp";
    if ($conn->query($sql2) === TRUE) {
        //echo json_encode(array("xp" => $newXP, "level" => $newLevel));
    } else {
        header("HTTP/1.1 409 Conflict");
        echo "Error: " . $sql . $conn->error;
        exit();
    }

    closeDBConnection($conn);
    //Spielerdaten in der Session und im Cookie updaten
    updatePlayerData($user->id);
}

?>