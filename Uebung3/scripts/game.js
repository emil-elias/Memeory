import { BACKUP_CARDS_LIST } from "./cards.js";

let CARDS_LIST = [];

let cardsOpen = []; //gerade offene Karten (zum Vergleichen)

let game_field = document.getElementById("game_field");

let new_game_button = document.getElementById("generate_new_game");
new_game_button.addEventListener("click", () => generateNewGame(CARDS_LIST.length * 2));

window.onload = async () => {
    CARDS_LIST = await retrieveCards();
    generateNewGame(CARDS_LIST.length * 2); //standardmäßig schonmal ein Spiel mit anzahl der Karten generieren
}

function generateNewGame(number_of_cards) {

    let cards = [...CARDS_LIST];

    //Karten duplizieren
    let length = cards.length;
    for (let i = 0; i < length; i++) {
        cards.push(cards[i]);
        //bilder schonmal möglichst in den cache preloaden
        //damit sie nicht beim aufdecken das erste mal geladen werden müssen
        var img = new Image();
        img.src = cards[i].image;
    }

    cards = cards.sort((a, b) => 0.5 - Math.random()); //Karten random sortieren

    game_field.innerHTML = ""; //game field leeren um es neu zu füllen
    cardsOpen = []; //offene Karten zurücksetzen

    for (let i = 0; i < number_of_cards; i++) {
        //alle Karten erstellen und an das Gamefield anhängen
        let card = document.createElement("div");
        let back = document.createElement("div"); //rückseite der Karte
        card.classList.add("card");
        back.classList.add("back");
        card.dataset.index = i;
        card.appendChild(back);
        game_field.appendChild(card);

        //bei Klick auf Karte, jeweilige Karte umdrehen
        card.addEventListener("click", () => turnAround());

        function turnAround() {
            //nur öffnen wenn nicht schon 2 Karten offen und die Karte nicht bereits schon geöffnet wurde (dann hätte sie eine child node, nämlich das img)
            if (cardsOpen.length < 2 && card.children.length == 1) {


                //bild erstellen und an Karte anhängen um es anzuzeigen
                let img = document.createElement("img");
                img.src = cards[i].image; //entsprechendes Bild aus der Liste nehmen	
                img.alt = cards[i].name;
                card.appendChild(img);

                card.classList.add("flipped"); //Klasse flipped dreht die Karte um

                cardsOpen.push({ id: cards[i].id, element: card }); //name und element der Karte in die Liste der offenen Karten hinzufügen zum vergleichen und referenzieren

                //sind zwei Karten offen, dann vergleichen
                if (cardsOpen.length == 2) {
                    if (cardsOpen[0].id == cardsOpen[1].id) {
                        //wenn karten gleich, dann vom Spielfeld nehmen (nach 2s, damit genug zeit zum anschauen bleibt)
                        setTimeout(() => {
                            cardsOpen[0].element.style.visibility = "hidden"; //ausblenden
                            cardsOpen[1].element.style.visibility = "hidden";
                            cardsOpen = []; //offene Karten zurücksetzen
                        }, 3000);
                    } else {

                        let closeCards = () => {
                            cardsOpen.forEach((card) => {
                                card.element.classList.remove("flipped"); //Karte wieder zurückdrehen
                                card.element.ontransitionend = () => {
                                    card.element.lastChild.remove(); //bild wieder entfernen nachdem animation vorbei
                                    card.element.ontransitionend = () => { }; //danach wieder zurücksetzen, sonst werden die bilder nach dem öffnen sofort wieder gelöscht
                                }
                            });
                            cardsOpen = [];
                        }

                        setTimeout(closeCards, 3000);
                    }
                }
            }
        }

    }

}

async function retrieveCards() {

    let cardsList = [];

    try {

        let cards = await fetch("php/retrieve_cards.php", { method: "GET" });
        cards = await cards.json();

        cards.forEach(card => {

            let id = card.id;
            let name = card.name;
            let image = "data:image/png;base64," + card.image;
            cardsList.push({ id, image, name });
        });

        if (cardsList.length == 0) {
            cardsList = BACKUP_CARDS_LIST;
        }

    } catch (error) {
        cardsList = BACKUP_CARDS_LIST;
    }

    return cardsList;

}