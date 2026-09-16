<?php

include_once 'setupDB.php';

//Funktions Switcher
//nicht unbeding schön, aber dann brauchen wir nicht so viele einzelne php files
if (isset($_REQUEST["function"])) {


    switch ($_REQUEST["function"]) {
        case "register":
            if (isset($_REQUEST['username']) && isset($_REQUEST['e-mail']) && isset($_REQUEST['password'])) {
                $name = $_REQUEST['username'];
                $email = $_REQUEST['e-mail'];
                $passwort = hash('sha256', $_REQUEST['password']);
                insertPlayer($name, $email, $passwort);
            }
            break;
        case "login":
            if (isset($_REQUEST['email_address']) && isset($_REQUEST['password'])) {
                $email = $_REQUEST['email_address'];
                $passwort = hash('sha256', $_REQUEST['password']);
                loginPlayer($email, $passwort);
            }
            break;
        case "getCurrent":
            $checkForAdmin = isset($_REQUEST["checkForAdmin"]);
            $userId = isset($_REQUEST["checkForUserId"]) ? $_REQUEST["checkForUserId"] : null;
            getCurrentPlayer($checkForAdmin, $userId);
            break;
        case "getPlayer":
            if (isset($_REQUEST["id"])) {
                $id = $_REQUEST["id"];
                getPlayer($id);
            }
            break;
        case "logout":
            logoutPlayer();
            break;
        case "edit":
            if (isset($_REQUEST['id']) && isset($_REQUEST['username']) && isset($_REQUEST['e-mail']) && isset($_REQUEST['password'])) {
                $id = $_REQUEST['id'];
                $name = $_REQUEST['username'];
                $email = $_REQUEST['e-mail'];
                $password = hash('sha256', $_REQUEST['password']);
                editPlayer($id, $name, $email, $password);
            }
            break;
        case "delete":
            if (isset($_REQUEST['id'])) {
                $id = $_REQUEST['id'];
                deletePlayer($id);
            }
            break;
        case "changePassword":
            if (isset($_REQUEST['password']) && isset($_REQUEST['oldPassword'])) {
                $newPassword = hash('sha256', $_REQUEST['password']);
                $oldPassword = hash('sha256', $_REQUEST['oldPassword']);	
                changePassword($oldPassword, $newPassword);
            }
            break;
        case "confirmPassword":
            if (isset($_REQUEST['passwordToBeConfirmed'])) {
                $password = hash('sha256', $_REQUEST['passwordToBeConfirmed']);
                confirmPassword($password);
            }
            break;
        case "setLevel":
            if (isset($_REQUEST['level'])) {
                $level = $_REQUEST['level'];
                setLevel($level);
            }
            break;
    }


}


//Spieler erstellen
function insertPlayer($name, $email, $passwort)
{
    $conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);

    //testen ob spieler mit username bereits vorhanden
    $sql0 = "SELECT * FROM Spieler WHERE spielname = '$name'";
    if ($conn->query($sql0)->num_rows > 0) {
        header("HTTP/1.1 409 Conflict");
        echo "Spielername $name ist bereits vergeben. \n";
        exit();
    }

    //testen ob spieler mit email bereits vorhanden
    $sql1 = "SELECT * FROM Spieler WHERE email = '$email'";
    if ($conn->query($sql1)->num_rows > 0) {
        header("HTTP/1.1 409 Conflict");
        echo "Konto mit E-Mail $email ist bereits vorhanden. \n";
        exit();
    }

    //falls nicht, spieler einfügen
    $sql2 = "INSERT INTO Spieler (spielname, email, passwort, `level`) VALUES ('$name', '$email', '$passwort', 1)";
    if ($conn->query($sql2) === TRUE) {
        echo "$name erfolgreich registriert \n";
        loginPlayer($email, $passwort);
    } else {
        echo "Error: " . $sql2 . $conn->error;
    }

    closeDBConnection($conn);

}

//Funktion zum bestätigen des Passwortes des akutell eingeloggten users
//gibt 403 zurück, falls passwörter nicht übereinstimmen, 404 wenn user nicht eingeloggt
function confirmPassword($password)
{
    ob_start();
    $user = json_decode(getCurrentPlayer(false));
    ob_end_clean();

    if ($user == null) {
        header("HTTP/1.1 404 Not Found");
        echo " Kein Spieler gefunden. \n";
        exit();
    }

    $conn = openDBConnection();
    $sql = "SELECT passwort FROM Spieler WHERE id = $user->id";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {

            if ($row["passwort"] == $password) {
                echo "true";
            } else {
                header("HTTP/1.1 403 Forbidden");
                exit();
            }
        }
    } else {
        header("HTTP/1.1 404 Not Found");
        exit();
    }

    closeDBConnection($conn);
}

//Spieler einloggen
//gibt 403 zurück falls passwort falsch
//404 falls konto nicht vorhanden
function loginPlayer($email, $password)
{

    $conn = openDBConnection();

    //je nachdem ob sich spieler mit email oder spielname einloggen will
    if (str_contains($email, "@")) {
        $sql0 = "SELECT * FROM Spieler WHERE email = '$email'";
    } else {
        $sql0 = "SELECT * FROM Spieler WHERE spielname = '$email'";
    }

    $result = $conn->query($sql0);
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            //passwort vergleichen
            if ($row["passwort"] == $password) {
                //Session und Cookie setzen
                session_start();
                $_SESSION["id"] = $row["id"];
                $_SESSION["spielname"] = $row["spielname"];
                $_SESSION["email"] = $row["email"];
                $_SESSION["level"] = $row["level"];
                $_SESSION["admin"] = $row["admin"];
                $_SESSION["xp"] = $row["xp"];

                $id = $row["id"];
                $spielname = $row["spielname"];
                $email = $row["email"];
                $level = $row["level"];
                $user = array("id" => $id, "spielname" => $spielname, "email" => $email, "level" => $level, "xp" => $row["xp"]);
                $userJSON = json_encode($user);
                //httponly cookie erstellen und userdaten (außer passwort und adminstatus) darin speichern
                //um user auch über sessions hinaus eingeloggt lassen zu können
                //die user daten werden base64 encoded, damit sie nicht so einfach gelesen oder geändert werden können (auch wenn es das natürlich nicht unmöglich macht, nur etwas umständlicher)
                setcookie("user", base64_encode($userJSON), time() + (1000 * 365 * 24 * 60 * 60), "/", null, true, true);
                header('Content-Type: application/json');
                echo $userJSON;

            } else {
                //passwort falsch
                header("HTTP/1.1 403 Forbidden");
                exit();
            }


        }
    } else {
        //konto gibt es nicht
        header("HTTP/1.1 404 Not Found");
        exit();
    }

    closeDBConnection($conn);

}

//updated Spielerdaten in der Session und im Cookie
//indem sie neu aus der Datenbank geholt werden
function updatePlayerData($id)
{
    $conn = openDBConnection();

    $sql = "SELECT * FROM Spieler WHERE id = $id";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {

            ob_start();
            session_start();
            ob_end_clean();
            $_SESSION["id"] = $row["id"];
            $_SESSION["spielname"] = $row["spielname"];
            $_SESSION["email"] = $row["email"];
            $_SESSION["level"] = $row["level"];
            $_SESSION["xp"] = $row["xp"];

            $id = $row["id"];
            $spielname = $row["spielname"];
            $email = $row["email"];
            $level = $row["level"];
            $user = array("id" => $id, "spielname" => $spielname, "email" => $email, "level" => $level, "xp" => $row["xp"]);
            $userJSON = json_encode($user);
            //httponly cookie erstellen und userdaten (außer passwort und adminstatus) darin speichern
            //um user auch über sessions hinaus eingeloggt lassen zu können
            //die user daten werden base64 encoded, damit sie nicht so einfach gelesen oder geändert werden können (auch wenn es das natürlich nicht unmöglich macht, nur etwas umständlicher)
            setcookie("user", base64_encode($userJSON), time() + (1000 * 365 * 24 * 60 * 60), "/", null, true, true);
            header('Content-Type: application/json');
            echo $userJSON;



        }
    }

    closeDBConnection($conn);

}

//Spieler ausloggen
//Session und Cookie löschen
function logoutPlayer()
{
    session_start();
    setcookie("user", "", time() - 3600, "/", null, true, true);
    session_destroy();
}

//Passwort ändern
//dabei mit altem Passwort vergleichen
function changePassword($oldPassword, $newPassword)
{
    confirmPassword($oldPassword); //schmeißt 403 wenn passwörter nicht übereinstimmen und verlässt skript

    ob_start();
    $user = json_decode(getCurrentPlayer(false));
    ob_end_clean();

    if ($user == null) {
        header("HTTP/1.1 404 Not Found");
        echo " Kein Spieler gefunden. \n";
        exit();
    }

    $conn = openDBConnection();
    $sql = "UPDATE Spieler SET passwort = '$newPassword' WHERE id = $user->id";
    if ($conn->query($sql) === TRUE) {
        echo "Passwort erfolgreich geändert \n";
    } else {
        header("HTTP/1.1 409 Conflict");
        echo "Error: " . $sql . $conn->error;
        exit();
    }

    closeDBConnection($conn);
}

//Alle Spielerdaten ausgeben (außer Passwort)
//nur wenn diese Funktion vom Spieler selbst oder einem Admin aufgerufen wird
function getPlayer($id) {

    ob_start();
    $user = json_decode(getCurrentPlayer(false));
    ob_end_clean();

    if ($user-> id != $id && $user->admin == 0) {
        header("HTTP/1.1 403 Forbidden");
        echo "nicht berechtigt \n";
        exit();
    }

    $conn = openDBConnection();

    $sql = "SELECT * FROM Spieler WHERE id = $id";
    $result = $conn->query($sql);

    $player = array();

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $player = array("id" => $row["id"], "spielname" => $row["spielname"], "email" => $row["email"], "level" => $row["level"], "xp" => $row["xp"],"admin" => $row["admin"]);
        }
    }

    header('Content-Type: application/json');
    echo json_encode($player, JSON_PRETTY_PRINT);

    closeDBConnection($conn);
}

//aktuell eingeloggten Spieler ausgeben
//loggt Spieler ein, falls Cookie vorhanden
//gibt 404 zurück, falls kein Cookie vorhanden -> kein Spieler angemeldet
//die parameter checkForAdmin und userId waren urpsrünglich Flags dafür, 
//dass nur eine Antwort zurückgegeben werden soll, wenn der Spieler ein Admin ist oder eine bestimmte ID hat
//wird aber nicht mehr benutzt
function getCurrentPlayer($checkForAdmin, $userId = null)
{
    session_start();

    //Falls noch keine Session gestartet wurde,
    //dann kann ein user auf Basis des User Cookies eingeloggt werden, falls er vorhanden ist
    //Ansonsten wird 404 zurückgegeben
    if (!isset($_SESSION["id"])) {
        if (isset($_COOKIE["user"])) {
            $user = json_decode(base64_decode($_COOKIE["user"]));
            $id = $user->id;
            $spielname = $user->spielname;
            $email = $user->email;
            $level = $user->level;
            $xp = $user->xp;

            //wir müssen eh die Datenbank für den Admin status fragen (wenn man den im cookie speichern würde könnte man das theoretisch einfach darin ändern)
            //deswegen können wir zur sicherheit auch einfach alle kontodaten aus dem cookie abfragen und mit der datenbank abgleichen
            //falls irgendwas davon nicht stimmt, ist der Cookie invalid
            $sql = "SELECT * FROM Spieler WHERE id = $id AND spielname = '$spielname' AND email = '$email' AND `level` = $level AND xp = $xp";
            $conn = openDBConnection();
            $result = $conn->query($sql);
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $_SESSION["id"] = $row["id"];
                    $_SESSION["spielname"] = $row["spielname"];
                    $_SESSION["email"] = $row["email"];
                    $_SESSION["level"] = $row["level"];
                    $_SESSION["admin"] = $row["admin"];
                    $_SESSION["xp"] = $row["xp"];
                }
                closeDBConnection($conn);
            } else {
                closeDBConnection($conn);
                header("HTTP/1.1 404 Not Found");
                exit();
            }
        } else {
            header("HTTP/1.1 404 Not Found");
            exit();
        }

    }

    $id = $_SESSION["id"];
    $spielname = $_SESSION["spielname"];
    $email = $_SESSION["email"];
    $level = $_SESSION["level"];
    $admin = $_SESSION["admin"];
    $xp = $_SESSION["xp"];

    //outdated
    /*if ($checkForAdmin) {
        $conn = openDBConnection();
        $sql = "SELECT admin FROM Spieler WHERE id = $id";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $admin = $row["admin"];
            }
        }
        closeDBConnection($conn);
    }*/

    /*if ($checkForAdmin && $admin == 0 && $userId != $id) {
        header("HTTP/1.1 403 Forbidden");
        exit();
    }*/

    $user = array("id" => $id, "spielname" => $spielname, "email" => $email, "level" => $level, "xp" => $xp,"admin" => $admin);
    $userJSON = json_encode($user);
    header('Content-Type: application/json');
    echo $userJSON;
    return $userJSON;
}


//ermöglicht es einem Spieler, username und email adresse zu bearbeiten, aber nur wenn er das richtige passwort eingibt
function editPlayer($id, $name, $email, $password)
{

    confirmPassword($password); //403 falls passwort falsch

    ob_start();
    $currentPlayer = json_decode(getCurrentPlayer(false));
    ob_end_clean();

    //falls der aktuell eingeloggte Spieler nicht die richtige id hat oder kein admin ist, dann darf er die Daten nicht bearbeiten
    if ($currentPlayer == null || $currentPlayer->id != $id && $currentPlayer->admin == 0) {
        header("HTTP/1.1 403 Forbidden");
        echo " ?? Du bist nicht der Spieler mit der ID $id, du bist nicht berechtigt diesen Account zu bearbeiten. \n";
        exit();
    }

    $conn = openDBConnection();

    //schauen, ob neuer username bereits vergeben ist
    $sql0 = "SELECT * FROM Spieler WHERE spielname = '$name'";
    $result0 = $conn->query($sql0);
    if ($result0->num_rows > 0) {

        while ($row = $result0->fetch_assoc()) {
            if ($row["id"] != $id) {
                header("HTTP/1.1 409 Conflict");
                echo "Spielername $name ist bereits vergeben. \n";
                exit();
            }
        }
    }

    //schauen ob neue email adresse bereits vergeben ist
    $sql1 = "SELECT * FROM Spieler WHERE email = '$email'";
    $result1 = $conn->query($sql1);
    if ($result1->num_rows > 0) {
        while ($row = $result1->fetch_assoc()) {
            if ($row["id"] != $id) {
                header("HTTP/1.1 409 Conflict");
                echo "Konto mit E-Mail $email ist bereits vorhanden. \n";
                exit();
            }
        }
    }

    $sql = "UPDATE Spieler SET spielname = '$name', email = '$email' WHERE id = $id";

    if ($conn->query($sql) === TRUE) {
        echo "Spieler erfolgreich bearbeitet \n";
    } else {
        header("HTTP/1.1 409 Conflict");
        echo "Error: " . $sql . $conn->error;
        exit();
    }

    closeDBConnection($conn);

    updatePlayerData($id); //aktualisiere Spielerdaten in Session und Cookie
}

//Level des eingeloggten Spielers setzen, falls er noch kein Spiel gespielt hat
function setLevel($level) {
    
        ob_start();
        $currentPlayer = json_decode(getCurrentPlayer(false));
        ob_end_clean();
    
        //Wenn der Spieler bereits spiele gespielt hat, darf er sein Level nicht mehr ändern
        if ($currentPlayer == null || $currentPlayer->xp > 0) {
            header("HTTP/1.1 403 Forbidden");
            echo " Du kannst dein Level nicht mehr ändern \n";
            exit();
        }
    
        $conn = openDBConnection();
    
        $sql = "UPDATE Spieler SET `level` = $level, `xp` = 1 WHERE id = $currentPlayer->id";
    
        if ($conn->query($sql) === TRUE) {
            echo "Level erfolgreich geändert \n";
        } else {
            header("HTTP/1.1 409 Conflict");
            echo "Error: " . $sql . $conn->error;
            exit();
        }
    
        closeDBConnection($conn);
    
        updatePlayerData($currentPlayer->id); //aktualisiere Spielerdaten in Session und Cookie
}

function deletePlayer($id)
{
    $conn = openDBConnection();


    ob_start();
    $currentPlayer = json_decode(getCurrentPlayer(false));
    ob_end_clean();

    //checken ob user der den user löschen will auch der user selber ist (oder admin)
    //um zu verhindern dass andere user andere Konten einfach löschen können
    if ($currentPlayer == null || $currentPlayer->id != $id && $currentPlayer->admin == 0) {
        header("HTTP/1.1 403 Forbidden");
        echo " ?? Du bist nicht der Spieler mit der ID $id, du bist nicht berechtigt diesen Account zu löschen. \n";
        exit();
    }

    $sql1 = "DELETE FROM Spiel WHERE `initiator` = $id OR `mitspieler` = $id";
    if ($conn->query($sql1) === TRUE) {
        $sql2 = "DELETE FROM Spieler WHERE id = $id";
        if ($conn->query($sql2) === TRUE) {
            echo "Spieler erfolgreich gelöscht \n";
        } else {
            header("HTTP/1.1 409 Conflict");
            echo "Error: " . $sql2 . $conn->error;
        }
    } else {
        header("HTTP/1.1 409 Conflict");
        echo "Error: " . $sql1 . $conn->error;
    }

    closeDBConnection($conn);
}
?>