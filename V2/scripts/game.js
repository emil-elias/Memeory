//import { cardsList } from "./cards.js";

//wir haben hier doch noch keine Imports verwendet, weil die Seiten dann auf einem Server liegen müssen um zuverlässig zu funktionieren (CORS blockiert imports im file system context)

//alle Bilder sind CC0 bzw. Public Domain
const CARDS_LIST = [
    {
        name: "Löwe",
        image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/African_Lion_%2828376075989%29.jpg/160px-African_Lion_%2828376075989%29.jpg",
    },
    {
        name: "Pinguin",
        image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/King_penguin_in_Edinburgh_Zoo_04.jpg/320px-King_penguin_in_Edinburgh_Zoo_04.jpg",
    },
    {
        name: "Delfin",
        image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Parc_Asterix_20.jpg/320px-Parc_Asterix_20.jpg",
    },
    {
        name: "Panda",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Giant_Panda_at_Chengdu_Panda_Base.jpg/278px-Giant_Panda_at_Chengdu_Panda_Base.jpg"
    },
    {
        name: "Wildschwein",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Sus_scrofa_2_-_Otter%2C_Owl%2C_and_Wildlife_Park.jpg/160px-Sus_scrofa_2_-_Otter%2C_Owl%2C_and_Wildlife_Park.jpg"
    },
    {
        name: "Tiger",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Panthera_tigris_altaica_23_-_Buffalo_Zoo.jpg/247px-Panthera_tigris_altaica_23_-_Buffalo_Zoo.jpg"
    },
    {
        name: "Schildkröte",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/African_Spurred_Tortoise_in_Toronto.jpg/320px-African_Spurred_Tortoise_in_Toronto.jpg"
    },
    {
        name: "Eisbär",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Polar-bear-arctic-wildlife-snow-53425.jpg/320px-Polar-bear-arctic-wildlife-snow-53425.jpg"
    },
];

let cardsOpen = []; //gerade offene Karten (zum Vergleichen)

let game_field = document.getElementById("game_field");

let new_game_button = document.getElementById("generate_new_game");
new_game_button.addEventListener("click", () => generateNewGame(CARDS_LIST.length * 2));

generateNewGame(CARDS_LIST.length * 2); //standardmäßig schonmal ein Spiel mit anzahl der Karten generieren

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

                cardsOpen.push({ name: cards[i].name, element: card }); //name und element der Karte in die Liste der offenen Karten hinzufügen zum vergleichen und referenzieren

                //sind zwei Karten offen, dann vergleichen
                if (cardsOpen.length == 2) {
                    if (cardsOpen[0].name == cardsOpen[1].name) {
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