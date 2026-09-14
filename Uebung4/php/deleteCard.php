<?php
include_once 'setupDB.php';
include_once 'player.php';

// Check if the card_id parameter is received through POST
if(isset($_POST['card_id'])) {
    $card_id = $_POST['card_id'];

    // Call the deleteCard function with the card ID
    deleteCard($card_id);
} else {
    echo "Ein Fehler ist aufgetreten, unbekannte Karte."; // Return an error message if card_id is not provided
}

function deleteCard($id)
{
    ob_start();
    $user = json_decode(getCurrentPlayer(false));
    ob_end_clean();

    //nur admins dürfen karten löschen
    if ($user->admin == 0) {
        header("HTTP/1.1 401 Unauthorized");
        echo "Keine Berechtigung";
        exit();
    }

    $conn = openDBConnection() or die("Connect failed: %s\n" . $conn->error);

    // prepared statement to delete the card with the given ID
    $sql = "DELETE FROM karte WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id); // "i" indicates the parameter is an integer
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo "Karte erfolgreich entfernt";
    } else {
        echo "Error: " . $conn->error;
    }

    closeDBConnection($conn);
}
?>