import { BACKUP_CARDS_LIST } from "./cards.js";

let USER = undefined; //wird aus der Datenbank geladen

let LEVELS = [] //werden aus der Datenbank geladen

let PLAYER_LEVEL = { level: 1, anzahl_karten: 6, spielZeit: 60, xp: 0 }; //level des Spielers (wird aus der Datenbank geladen)

let TIMER = 60; //in Sekunden
let TIMER_INTERVAL; //intervall, dass den Timer aktualisiert
let TIMER_START = new Date().getTime(); //zeitpunkt, an dem das Spiel gestartet wurde

let CARDS_LIST = []; //Liste der Karten, die im Spiel verwendet werden

let CARDS_OPEN = []; //gerade offene Karten (zum Vergleichen)
let FOUND_PAIRS = 0; //gefundene Paare

let GAME_FIELD = document.getElementById("game_field"); //Spielfeld
let RESULT_SCREEN = document.getElementById("result_screen"); //Screen, der nach dem Spiel angezeigt wird

let NEW_GAME_BUTTON = document.getElementById("generate_new_game"); //Button zum generieren eines neuen Spiels (wird während des Spiels zu einem Aufgeben/Abbrechen-Button)

let TIMER_ELEMENT = document.getElementById("timer"); //HTML Element, in das der aktuelle Timer Wert hineingeschrieben wird

let LEVEL_UP_MODAL = document.getElementById("levelup"); //Modal, das angezeigt wird, wenn der Spieler ein neues Level erreicht hat
let CANCEL_GAME_MODAL = document.getElementById("cancelGameModal"); //Confirmation Dialog, der angezeigt wird, wenn der Spieler auf aufgeben drückt

const MODALS = document.getElementsByClassName("modal");

//wenn man außerhalb eines Modals klickt, soll es geschlossen werden
for (let i = 0; i < MODALS.length; i++) {
    MODALS[i].onclick = (event) => {
        if (event.target == MODALS[i]) {
            MODALS[i].style.display = "none";
        }
    }
}

let GAME_RUNNING = false; //status, ob gerade ein Spiel läuft
let CUSTOM_GAME = false; //status, ob es sich dabei um ein spiel mit custom einstellungen handelt

let CUSTOM_GAME_DURATION = PLAYER_LEVEL.spielZeit; //dauer eines custom games

const GAME_DURATION_SETTER = document.getElementById("setGameDuration"); //Eingabe Feld für die Spielzeit
const CARD_NUMBER_SETTER = document.getElementById("selectNumberOfCards"); //Eingabefeld für die Anzahl der Karten

//Auswahl an Gifs, die angezeigt werden, wenn der Spieler gewonnen hat
const WON_GIFS = [
    `<iframe src="https://giphy.com/embed/111ebonMs90YLu" width="480" height="360" frameBorder="0" class="giphy-embed" allowFullScreen> </iframe>
    <p><a href="https://giphy.com/gifs/thumbs-up-111ebonMs90YLu">via GIPHY</a></p>`,

]

//Auswahl an Gifs, die angezeigt werden, wenn der Spieler verloren hat
const LOST_GIFS = [
    `<iframe src="https://giphy.com/embed/6yRVg0HWzgS88" width="473" height="480" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>
    <p><a href="https://giphy.com/gifs/facepalm-simon-cowell-6yRVg0HWzgS88">via GIPHY</a></p>`,
    `<iframe src="https://giphy.com/embed/pK6k4BNalmx44CQj3v" width="480" height="400" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/theoffice-episode-1-the-office-tv-pK6k4BNalmx44CQj3v">via GIPHY</a></p>`,
    `<iframe src="https://giphy.com/embed/kKLmEOQy45G4QzFPOO" width="480" height="270" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/cbc-schittscreek-schitts-creek-kKLmEOQy45G4QzFPOO">via GIPHY</a></p>`,
    `<iframe src="https://giphy.com/embed/3ELtfmA4Apkju" width="480" height="333" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/just-blinking-3ELtfmA4Apkju">via GIPHY</a></p>`

]

//wenn der spieler auf den cancelGame button (im cancelGameModal) klickt
//wird das spiel abgebrochen und ein neues generiert
document.getElementById("cancelGame").onclick = () => {
    if (GAME_RUNNING) updateGameSession("abgebrochen"); //falls spiel gerade noch läuft, status auf abgebrochen updaten
    GAME_RUNNING = false;
    //anzahl karten und spielzeit können wieder gesetzt werden
    CARD_NUMBER_SETTER.disabled = false;
    GAME_DURATION_SETTER.disabled = false;
    //generateNewGame(PLAYER_LEVEL.anzahl_karten, PLAYER_LEVEL.spielZeit)
    generateNewGameFromCurrentSettings(); //neues spiel mit aktuellen einstellungen generieren
    CANCEL_GAME_MODAL.style.display = "none"; //modal schließen
}

//doch nicht abbrechen? modal schließen
document.getElementById("cancelCancelGame").onclick = () => {
    CANCEL_GAME_MODAL.style.display = "none";
}




window.onload = async () => {
    CARDS_LIST = await retrieveCards(); //Karten laden
    USER = await retrieveUser(); //user laden (falls angemeldet)
    LEVELS = await retrieveLevels(); //levels laden
    PLAYER_LEVEL = determinePlayerLevel(LEVELS); //Spieler level herausfinden
    insertCardNumberOptions(CARDS_LIST.length * 2, PLAYER_LEVEL); //Möglichkeiten für anzahl karten einfügen, abhängig davon wie viele Karten überhaupt zur Verfügung stehen

    //game duration ist zunächst aktueles level des spielers
    GAME_DURATION_SETTER.value = ("00" + Math.floor(PLAYER_LEVEL.spielZeit / 60)).slice(-2) + ":" + ("00" + PLAYER_LEVEL.spielZeit % 60).slice(-2);
    GAME_DURATION_SETTER.addEventListener("change", () => {
        //sollte der wert geändert werden, wird ein neues spiel mit diesen einstellungen generiert
        generateNewGameFromCurrentSettings();
    });

    //wenn ein user noch 0 xp hat, hat er noch kein spiel gespielt und soll sein level festlegen
    if (USER && parseInt(USER.xp) == 0) {
        document.getElementById("levelSelectModal").style.display = "flex";
        for (let i = 0; i < LEVELS.length; i++) {
            //optionen hinzufügen
            let option = document.createElement("option");
            option.value = LEVELS[i].level;
            option.innerText = "Level " + LEVELS[i].level + " (" + LEVELS[i].anzahl_karten + " Karten, " + ("00" + Math.floor(LEVELS[i].spielZeit / 60)).slice(-2) + ":" + ("00" + LEVELS[i].spielZeit % 60).slice(-2) + " Zeit)";
            document.getElementById("levelSelect").appendChild(option);
            //level festlegen
            document.getElementById("confirmLevel").addEventListener("click", () => {
                fetch("./php/player.php?function=setLevel&level=" + document.getElementById("levelSelect").value, { method: "get" }).then((response) => {
                    if (response.ok) {
                        window.location.reload();
                    } else {
                        document.getElementById("levelSelectModal").style.display = "none";
                    }
                }).catch((error) => {
                    console.log(error);
                    document.getElementById("levelSelectModal").style.display = "none";
                });
            }
            );

        }
    }

    //generateNewGame(PLAYER_LEVEL.anzahl_karten, PLAYER_LEVEL.spielZeit); //standardmäßig schonmal ein Spiel mit anzahl der Karten generieren
    generateNewGameFromCurrentSettings(); //neues spiel generieren

    //wenn der new game button im laufenden spiel gedrückt wird, kommt der spiel abbrechen dialog
    //ansonsten wird einfach ein neues spiel generiert
    NEW_GAME_BUTTON.addEventListener("click", () => {
        if (GAME_RUNNING) CANCEL_GAME_MODAL.style.display = "flex";
        else {
            //generateNewGame(PLAYER_LEVEL.anzahl_karten, PLAYER_LEVEL.spielZeit)
            generateNewGameFromCurrentSettings();
            CANCEL_GAME_MODAL.style.display = "none";
        }


    });

}

//was passieren soll bevor die seite verlassen oder neu geladen werden soll
//zeigt einen warnungs dialog an
addEventListener('beforeunload', (event) => {

    event.preventDefault();

    //falls noch ein spiel läuft muss es abgebrochen und der status auf abgebrochen geupdatet werden
    //bevor die seite geschlossen wird
    if (GAME_RUNNING) {
        updateGameSession("abgebrochen");
        return event.returnValue = '';
    } else return undefined;



});

//generiert ein neues spiel basierend auf einer anzahl karten und einer dauer
function generateNewGame(number_of_cards, duration) {

    //duration und card number setter setzen, damit sie den richtigen wert anzeigen
    GAME_DURATION_SETTER.value = ("00" + Math.floor(duration / 60)).slice(-2) + ":" + ("00" + duration % 60).slice(-2);
    CARD_NUMBER_SETTER.value = number_of_cards;

    //falls es sich um kein custom game mehr handelt, brauchen wir die option zum zurückkehren zum aktuellen level nicht mehr
    if (!CUSTOM_GAME && CARD_NUMBER_SETTER.lastChild.value == "currentLevel") {
        CARD_NUMBER_SETTER.lastChild.remove();
        document.getElementById("levelnr").innerHTML = "Level " + PLAYER_LEVEL.level;
    }

    let cards = [...CARDS_LIST]; //kartenliste klonen

    cards = cards.sort((a, b) => 0.5 - Math.random()); //random sortieren
    cards = cards.slice(0, number_of_cards / 2); //nur die ersten n/2 karten nehmen, den rest brauchen wir nicht

    GAME_FIELD.style.display = "grid";
    RESULT_SCREEN.style.display = "none"; //result screen ausblenden falls er eingblendet war
    NEW_GAME_BUTTON.style.display = "none"; //aufgeben button zunächst ausblenden
    NEW_GAME_BUTTON.innerHTML = "Abbrechen";
    NEW_GAME_BUTTON.classList.add("outline_button_red");
    //document.getElementById("levelnr").innerHTML = "Level " + PLAYER_LEVEL.level;

    //grid anpassen an die anzahl der karten
    let rows = Math.floor(Math.sqrt(number_of_cards));
    let cols = number_of_cards / rows;
    GAME_FIELD.style.gridTemplateRows = "repeat(" + rows + ", 1fr)";
    GAME_FIELD.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";


    clearInterval(TIMER_INTERVAL); //falls noch ein Timer interval läuft, clearen
    TIMER = duration; //Timer zurücksetzen
    let minutes = Math.floor(TIMER / 60);
    let seconds = TIMER % 60;
    TIMER_ELEMENT.innerHTML = ("00" + minutes).slice(-2) + ":" + ("00" + seconds).slice(-2); //Zeit ins timer element schreiben
    FOUND_PAIRS = 0; //gefundene paare zurücksetzen

    //Karten duplizieren
    let length = cards.length;
    for (let i = 0; i < length; i++) {
        cards.push(cards[i]);
        //bilder schonmal möglichst in den cache preloaden
        //damit sie nicht beim aufdecken das erste mal geladen werden müssen (auch wenn sie eh klein sind)
        var img = new Image();
        img.src = cards[i].image;
    }

    cards = cards.sort((a, b) => 0.5 - Math.random()); //Karten random sortieren

    GAME_FIELD.innerHTML = ""; //game field leeren um es neu zu füllen
    CARDS_OPEN = []; //offene Karten zurücksetzen

    let activeTimeout; //gerade aktives timeout, falls karten aufgedeckt wurden

    for (let i = 0; i < number_of_cards; i++) {
        //alle Karten erstellen und an das Gamefield anhängen
        let card = document.createElement("div");
        let back = document.createElement("div"); //rückseite der Karte
        card.classList.add("card");
        back.classList.add("back");
        if (number_of_cards > 24) {
            card.classList.add("smallCard");

        }
        card.dataset.index = i;
        card.appendChild(back);
        GAME_FIELD.appendChild(card);

        //bei Klick auf Karte, jeweilige Karte umdrehen
        card.addEventListener("click", () => {
            turnAround();
            //falls das Spiel noch nicht läuft, starten
            if (TIMER == duration && !GAME_RUNNING) {
                startGameSession();
            }
        });

        //was beim umdrehen einer karte passiert
        function turnAround() {

            //funktion zum wieder umdrehen der offenen karten
            let closeCards = () => {
                CARDS_OPEN.forEach((card) => {
                    card.element.classList.remove("flipped"); //Karte wieder zurückdrehen
                    card.element.ontransitionend = () => {
                        card.element.lastChild.remove(); //bild wieder entfernen nachdem animation vorbei ist
                        card.element.ontransitionend = () => { }; //danach ontransitionend wieder zurücksetzen, sonst werden die bilder nach dem öffnen sofort wieder gelöscht
                    }
                });
                CARDS_OPEN = [];
            }

            //funktion zum entfernen der offenen karten vom Spielfeld
            let removeCards = () => {
                CARDS_OPEN[0].element.style.visibility = "hidden"; //ausblenden
                CARDS_OPEN[1].element.style.visibility = "hidden";
                FOUND_PAIRS++;
                //sind alle karten gefunden, spiel beenden
                if (FOUND_PAIRS == number_of_cards / 2) {
                    finishGameSession(true); //true = gewonnen
                    clearInterval(TIMER_INTERVAL); //timer intervall beenden
                    //gamefield ausblenden um result screen anzuzeigen
                    GAME_FIELD.style.display = "none";
                    RESULT_SCREEN.style.display = "block";
                    //eines der won gifs anzeigen
                    RESULT_SCREEN.innerHTML = `
                                ${WON_GIFS[Math.floor(Math.random() * WON_GIFS.length)]}
                                <br>
                                <p>Glückwunsch, du hast alle ${number_of_cards / 2} Paare in ${duration - TIMER} Sekunden gefunden!</p>
                                `;
                    //der new game button soll jetzt nicht mehr rot sein
                    NEW_GAME_BUTTON.classList.remove("outline_button_red");
                    NEW_GAME_BUTTON.innerHTML = "Noch einmal spielen";
                }
                CARDS_OPEN = []; //offene Karten zurücksetzen

            }

            //karte nur öffnen wenn nicht schon 2 Karten offen und die Karte nicht bereits schon geöffnet wurde (dann hätte sie eine child node, nämlich das img)
            if (CARDS_OPEN.length < 2 && card.children.length == 1) {

                //bild erstellen und an Karte anhängen um es anzuzeigen
                let img = document.createElement("img");
                img.src = cards[i].image; //entsprechendes Bild aus der Liste nehmen	
                img.alt = cards[i].name;
                card.appendChild(img);

                card.classList.add("flipped"); //Klasse flipped dreht die Karte um

                CARDS_OPEN.push({ id: cards[i].id, element: card }); //name und element der Karte in die Liste der offenen Karten hinzufügen zum vergleichen und referenzieren

                //sind zwei Karten offen, dann vergleichen
                if (CARDS_OPEN.length == 2) {
                    if (CARDS_OPEN[0].id == CARDS_OPEN[1].id) {
                        //wenn karten gleich, dann vom Spielfeld nehmen (nach 3s, damit genug zeit zum anschauen bleibt)
                        activeTimeout = setTimeout(removeCards, 3000);
                    } else {
                        //ansonsten wieder umdrehen nach 3 sekunden
                        activeTimeout = setTimeout(closeCards, 3000);
                    }
                }
            } else if (CARDS_OPEN.length == 2 && card.children.length == 2) { //falls schon zwei karten offen sind, kann man auf eine der beiden klicken um sie schneller wieder umzudrehen
                if (CARDS_OPEN[0].id == CARDS_OPEN[1].id) {
                    //gleiche karten löschen
                    removeCards();
                    clearTimeout(activeTimeout); //aktives löschen timeout clearen, sonst wird evtl nach 3s eine andere offene karte gelöscht
                } else {
                    closeCards(); //ungleiche karten abdecken
                    clearTimeout(activeTimeout); //aktives umdrehen timeout clearen, sonst wird evtl nach 3s eine andere offene karte wieder umgedreht
                }
            }

        }

    }

}

//startet ein spiel
function startGameSession() {
    GAME_RUNNING = true;
    NEW_GAME_BUTTON.style.display = "block";

    TIMER_START = new Date().getTime(); //startzeit setzen

    //kartenanzahl und dauer können während das spiel läuft nicht geändert werden
    CARD_NUMBER_SETTER.disabled = true;
    GAME_DURATION_SETTER.disabled = true;

    //timer interval starten
    TIMER_INTERVAL = setInterval(() => {
        TIMER = CUSTOM_GAME_DURATION - Math.floor((new Date().getTime() - TIMER_START) / 1000); //timer updaten, nur so umständlich weil ich dem interval nicht traue (könnte theoretisch länger als eine sekunde dauern)
        let minutes = Math.floor(TIMER / 60);
        let seconds = TIMER % 60;
        TIMER_ELEMENT.innerHTML = ("00" + minutes).slice(-2) + ":" + ("00" + seconds).slice(-2);
        //wenn timer abgelaufen, spiel verloren
        if (TIMER <= 0) {
            finishGameSession(false);
            clearInterval(TIMER_INTERVAL);
            GAME_FIELD.style.display = "none";
            RESULT_SCREEN.style.display = "block";
            TIMER_ELEMENT.innerHTML = "00:00";
            //eines der lost gifs anzeigen
            RESULT_SCREEN.innerHTML = `
            ${LOST_GIFS[Math.floor(Math.random() * LOST_GIFS.length)]}
            <br>
            <p>Du hast es leider nicht geschafft... Versuch es nochmal!</p>`;
            NEW_GAME_BUTTON.classList.remove("outline_button_red");
            NEW_GAME_BUTTON.innerHTML = "Noch einmal versuchen";

        }
    }, 1000);

    //gameobject erstellen und an die datenbank senden
    let date = new Date(TIMER_START);
    //datum muss ins richtige format für die datenbank umgewandelt werden
    let dateString = date.getFullYear() + "-" + ("00" + (date.getMonth() + 1)).slice(-2) + "-" + ("00" + date.getDate()).slice(-2) + " " + ("00" + date.getHours()).slice(-2) + ":" + ("00" + date.getMinutes()).slice(-2) + ":" + ("00" + date.getSeconds()).slice(-2);
    let gameData = new FormData();
    let gameObj = {
        userId: USER ? USER.id : null,
        einzeln: 1,
        level: PLAYER_LEVEL.level,
        spielZeit: CUSTOM_GAME_DURATION,
        spieltan: dateString,
        dauer: 0,
        verlauf: "laufend",
        initiator: USER ? USER.id : null,
        mitspieler: null,
        gewinner: null
    }
    gameData.append("game", JSON.stringify(gameObj));
    let startRequest = new XMLHttpRequest();
    startRequest.onreadystatechange = () => {
        console.log(startRequest.responseText);
    }
    startRequest.open("POST", "./php/gameSession.php?function=start");
    startRequest.send(gameData);
    console.log(gameObj);

}

//updated ein spiel
function updateGameSession(status) {
    let date = new Date(TIMER_START);
    let dateString = date.getFullYear() + "-" + ("00" + (date.getMonth() + 1)).slice(-2) + "-" + ("00" + date.getDate()).slice(-2) + " " + ("00" + date.getHours()).slice(-2) + ":" + ("00" + date.getMinutes()).slice(-2) + ":" + ("00" + date.getSeconds()).slice(-2);
    let gameData = new FormData();
    let gameObj = {
        userId: USER ? USER.id : null,
        einzeln: 1,
        level: PLAYER_LEVEL.level,
        spielZeit: CUSTOM_GAME_DURATION,
        spieltan: dateString,
        dauer: CUSTOM_GAME_DURATION - TIMER,
        verlauf: status,
        initiator: USER ? USER.id : null,
        mitspieler: null,
        gewinner: null
    }
    gameData.append("game", JSON.stringify(gameObj));
    let startRequest = new XMLHttpRequest();
    startRequest.onreadystatechange = () => {
        console.log(startRequest.responseText);
    }
    startRequest.open("POST", "./php/gameSession.php?function=update");
    startRequest.send(gameData);
    console.log(gameObj);
}

//beendet ein spiel
//jenachdem ob es gewonnen oder verloren wurde
function finishGameSession(won) {
    GAME_RUNNING = false;
    //einstellungen können wieder vorgenommen werden
    CARD_NUMBER_SETTER.disabled = false;
    GAME_DURATION_SETTER.disabled = false;
    let date = new Date(TIMER_START);
    let dateString = date.getFullYear() + "-" + ("00" + (date.getMonth() + 1)).slice(-2) + "-" + ("00" + date.getDate()).slice(-2) + " " + ("00" + date.getHours()).slice(-2) + ":" + ("00" + date.getMinutes()).slice(-2) + ":" + ("00" + date.getSeconds()).slice(-2);
    let gameData = new FormData();
    let gameObj = {
        userId: USER ? USER.id : null,
        einzeln: 1,
        level: PLAYER_LEVEL.level,
        spielZeit: CUSTOM_GAME_DURATION,
        spieltan: dateString,
        dauer: CUSTOM_GAME_DURATION - TIMER,
        verlauf: "beendet",
        initiator: USER ? USER.id : null,
        mitspieler: null,
        gewinner: won && USER ? USER.id : null
    }
    gameData.append("game", JSON.stringify(gameObj));
    let startRequest = new XMLHttpRequest();
    startRequest.onreadystatechange = async () => {
        if (startRequest.status === 200 && startRequest.readyState === 4) {
            try {
                let oldLevel = USER.level;
                USER = JSON.parse(startRequest.responseText);
                //falls der server zurückmeldet, dass der user ein neues level erreicht hat, dies anzeigen
                if (parseInt(USER.level) > parseInt(oldLevel)) {
                    LEVEL_UP_MODAL.style.display = "flex";
                    document.getElementById("leveluptext").innerHTML = "&#127881; Du bist aufgestiegen! <br> Willkommen in Level " + USER.level + "!";
                    document.getElementById("closeLevelupModal").onclick = () => {
                        LEVEL_UP_MODAL.style.display = "none";
                    }
                    document.getElementById("newGame").onclick = () => {
                        CUSTOM_GAME = false;
                        generateNewGame(PLAYER_LEVEL.anzahl_karten, PLAYER_LEVEL.spielZeit);
                        LEVEL_UP_MODAL.style.display = "none";
                    }
                    PLAYER_LEVEL = determinePlayerLevel(LEVELS);
                    document.getElementById("levelnr").innerHTML = "Level " + PLAYER_LEVEL.level;
                }

            } catch (error) {
                console.log(error);
            }

        }
    }
    startRequest.open("POST", "./php/gameSession.php?function=finish");
    startRequest.send(gameData);
    console.log(gameObj);

}

//holt die karten aus der datenbank
//verwendet backup karten falls verbindung fehlschlägt oder die karten liste leer ist
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

//holt die levels aus der datenbank
async function retrieveLevels() {

    let levels = [];

    try {

        let levelData = await fetch("php/retrieve_levels.php", { method: "GET" });
        levels = await levelData.json();

    } catch (error) {
        levels = [];
    }

    return levels;

}

//findet das level des Spielers heraus
function determinePlayerLevel(levels) {

    let playerLevel = { level: 1, anzahl_karten: 6, spielZeit: 60, xp: 0 };

    if (levels.length == 0) return playerLevel;

    if (USER) {
        playerLevel = levels[USER.level - 1];
    } else {
        playerLevel = levels[0];
    }

    //document.getElementById("levelnr").innerHTML = "Level "+PLAYER_LEVEL.level;

    return playerLevel;
}

//holt den aktuell angemeldeten user
//undefined wenn nicht angemeldet
async function retrieveUser() {

    const user = await fetch("./php/player.php?function=getCurrent", { method: "get" }).then((response) => {
        if (response.ok) return response.json();
        else return undefined;
    }).catch((error) => {
        console.log("Fehler beim Abrufen des Users:" + error);
        return undefined;
    });

    return user;
}

//fügt die optionen für die anzahl der karten hinzu
//abhängig davon wie viele karten überhaupt zur Verfügung stehen
//und welches level der spieler hat
function insertCardNumberOptions(number_of_cards, PLAYER_LEVEL) {

    let i = 6; //minimum 6 karten, alles darunter wäre etwas sinnfrei

    while (i <= number_of_cards) {
        CARD_NUMBER_SETTER.appendChild(new Option(i + " Karten", i));
        //hardcoded, diese anzahl an karten gibt ein gefülltes grid aus
        //ansonsten wäre eine reihe kürzer als die anderen, was nicht so schön aussieht
        if (i >= 8 && i < 24) i += 4;
        else if (i >= 24 && i < 36) i += 6;
        else i += 2;
    }

    CARD_NUMBER_SETTER.value = PLAYER_LEVEL.anzahl_karten;

    //beim ändern neues spiel generieren
    CARD_NUMBER_SETTER.addEventListener("change", () => {

        //falls wieder das aktuelle level ausgewählt wurde, 
        //einstellungen des levels übernehmen,
        //option kann ausgeblendet werden
        if (CARD_NUMBER_SETTER.value == "currentLevel") {
            CARD_NUMBER_SETTER.value = PLAYER_LEVEL.anzahl_karten;
            CARD_NUMBER_SETTER.removeChild(CARD_NUMBER_SETTER.lastChild);
            GAME_DURATION_SETTER.value = ("00" + Math.floor(PLAYER_LEVEL.spielZeit / 60)).slice(-2) + ":" + ("00" + PLAYER_LEVEL.spielZeit % 60).slice(-2);
        }

        generateNewGameFromCurrentSettings();

    });

}

//neues spiel basierend auf aktuellen einstellungen (dauer, anzahl karten) generieren
function generateNewGameFromCurrentSettings() {

    let value = GAME_DURATION_SETTER.value; //gewünschte zeit

    const regex = /^[0-9:]+$/; //darf nur ziffern und ":" enthalten

    if (!regex.test(value)) return;

    let duration = 0;

    if (value.includes(":")) { //falls im mm:ss format, müssen die minuten in sekunden extrahiert werden
        let minutes = value.split(":")[0];
        if (minutes[0] == "0") minutes = minutes.slice(1); //leading 0 entfernen, sonst wird diese als erster int geparsed
        let seconds = value.split(":")[1];
        if (seconds[0] == "0") seconds = seconds.slice(1);

        duration = parseInt(minutes) * 60 + parseInt(seconds);
    } else { 
        //ansonsten kann man den wert einfach übernehmen, allerdings ist es für den user schöner ihn im mm:ss format anzuzeigen, deswegen wird er automatisch umgewandelt
        duration = parseInt(value);
        GAME_DURATION_SETTER.value = ("00" + Math.floor(duration / 60)).slice(-2) + ":" + ("00" + duration % 60).slice(-2);
    }

    CUSTOM_GAME_DURATION = duration;

    generateNewGame(CARD_NUMBER_SETTER.value, duration);

    //falls zeit und anzahl karten übereinstimmern, befindet sich der spieler wieder im aktuellen level
    if (CARD_NUMBER_SETTER.value == PLAYER_LEVEL.anzahl_karten && duration == PLAYER_LEVEL.spielZeit) {
        document.getElementById("levelnr").innerHTML = "Level " + PLAYER_LEVEL.level;
        CUSTOM_GAME = false;
    } else {
        //ansonsten ist es ein benutzerdefiniertes spiel
        document.getElementById("levelnr").innerHTML = "Benutzerdefiniert";
        CUSTOM_GAME = true;
        if (CARD_NUMBER_SETTER.lastChild.value != "currentLevel") CARD_NUMBER_SETTER.appendChild(new Option("Level " + PLAYER_LEVEL.level, "currentLevel"));
    }
}

