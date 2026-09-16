//Skript für die Kartenübersicht

let cards = await fetch("php/retrieve_cards.php", { method: "GET" }).then((response) => response.json()).catch((error) =>  {
    console.log("Fehler beim Laden der Karten: " + error);
    return [];
});
let user = await fetch("./php/player.php?function=getCurrent", { method: "get" }).then((response) => {
    if (response.ok) {
        return response.json()
    }
}).catch(() => {
    return undefined;
});

//wenn der eingeloggte user ein Admin ist, dann wird der Button zum Karten hochladen angezeigt
//ansonsten natürlich nicht
if (user && parseInt(user.admin)) { //parseInt, weil der Wert im JSON als String übergeben wird
    document.getElementById("uploadCardButton").style.display = "block";
    document.getElementById("uploadCardButton").href = "./upload_card.html";
}

let card_table = document.getElementById("card_table");
let deleteCardModal = document.getElementById("deleteCardModal");

//Alle Karten werden in die Tabelle eingefügt
cards.forEach(card => {
    let name = card.name;
    let image = "data:image/png;base64," + card.image;

    let row = document.createElement("tr");

    //Name
    let nameField = document.createElement("td");
    nameField.innerHTML = name;
    row.appendChild(nameField);

    //Bild
    let imageField = document.createElement("td");
    let imageElement = document.createElement("img");
    imageElement.src = image;
    imageElement.alt = name;
    imageField.appendChild(imageElement);
    row.appendChild(imageField);

    //Button zum Löschen
    //dieser wird ebenfalls nur für Admins angezeigt
    let deleteField = document.createElement("td");
    if (user && parseInt(user.admin)) {

        let deleteButton = document.createElement("button");
        deleteButton.innerHTML = "Löschen";
        deleteButton.id = "delete_button";
        deleteButton.classList.add("outline_button_red")
        deleteField.appendChild(deleteButton);

        //Bestätigungsdialog aufrufen und nur löschen, wenn user ja klickt
        deleteButton.addEventListener("click", () => {
            deleteCardModal.style.display = "flex";
            document.getElementById("deleteCardWarning").innerHTML = "Möchtest du die Karte " + name + " wirklich löschen?";
            document.getElementById("deleteCard").addEventListener("click", () => {
                let request = new XMLHttpRequest();
                let formData = new FormData();
                formData.append("card_id", card.id);

                request.onload = () => {
                    if (request.status === 200 && request.readyState === 4) {
                        alert(request.responseText);
                        location.reload();  //reloading page to update shown cards
                    } else {
                        alert("Etwas ist schief gelaufen");
                    }
                };

                request.onerror = () => {
                    alert("Etwas ist schief gelaufen");
                };

                request.open("POST", "php/deleteCard.php");
                request.send(formData);
                deleteCardModal.style.display = "none";
            }

            );


        });

        document.getElementById("dontDeleteCard").addEventListener("click", () => {
            deleteCardModal.style.display = "none";
        });



    }
    row.appendChild(deleteField);


    card_table.appendChild(row);
});