//Skript für die Spielübersicht aller Spiele fpr Admins

import TableSorter from "./tablesort.js";

const user = await fetch("./php/player.php?function=getCurrent", { method: "get" }).then(async (response) => {
    if (response.ok) {
        let usr = await response.json();
        if (parseInt(usr.admin)) return usr;
    } 
    //Wenn der user kein Admin ist, darf er diese Seite nicht sehen
    window.location.href = "message.html?msg=Du bist nicht berechtigt diese Seite zu sehen.";
}).catch(() => {
    window.location.href = "message.html?msg=Du bist nicht berechtigt diese Seite zu sehen.";
});

const games = await fetch("./php/spiel.php?function=getAllGames", { method: "get" }).then((response) => response.json()).catch((error) => {
    console.log("Fehler beim Laden der Spiele: " + error);
    return [];
});

const games_table = document.getElementById("games_table");

games.forEach((game) => {
    //neue Zeile erstellen
    let row = document.createElement("tr");

    let gameDate = new Date(game.spieltan);
    let dateField = document.createElement("td");
    dateField.dataset.sort = gameDate.getTime(); //Zeitstempel als Sortierkriterium
    dateField.innerHTML = gameDate.toLocaleDateString() + " " + gameDate.toLocaleTimeString();
    row.appendChild(dateField);

    let levelField = document.createElement("td");
    levelField.dataset.sort = game.initiator.level; //Level als Sortierkriterium
    levelField.innerHTML = game.level;
    row.appendChild(levelField);

    let durationField = document.createElement("td");
    durationField.dataset.sort = game.dauer; //Dauer als Sortierkriterium
    let minutes = Math.floor(game.dauer/60);
    let seconds = game.dauer%60;
    durationField.innerHTML = ("00" + minutes).slice(-2) + ":" + ("00" + seconds).slice(-2);
    row.appendChild(durationField);

    let gameType = document.createElement("td");
    gameType.dataset.sort = parseInt(game.einzeln); //Spieltyp (Einzelspieler ja/nein) als Sortierkriterium
    gameType.innerHTML = parseInt(game.einzeln) ? "Einzelspieler" : "Mehrspieler";
    row.appendChild(gameType);

    let initiatorField = document.createElement("td");
    initiatorField.innerHTML = game.initiator.spielname;
    initiatorField.classList.add("clickable");
    initiatorField.addEventListener("click", () => {
            window.location = "./player_games_overview.html?name=" + game.initiator.spielname + "&id=" + game.initiator.id; //weiterleitung zur die Spielübersicht des Initiators
        });
    row.appendChild(initiatorField);

    let opponentField = document.createElement("td");
    opponentField.innerHTML = game.mitspieler ? game.mitspieler.spielname : "";
    if (game.mitspieler) {
        opponentField.classList.add("clickable");
        opponentField.addEventListener("click", () => {
            window.location = "./player_games_overview.html?name=" + game.mitspieler.spielname + "&id=" + game.mitspieler.id; //weiterleitung zur die Spielübersicht des Gegners
        });
    }
    row.appendChild(opponentField);

    let winnerField = document.createElement("td");
    winnerField.innerHTML = game.gewinner ? game.gewinner.spielname : "";
    if (game.gewinner) {
        winnerField.classList.add("clickable");
        winnerField.addEventListener("click", () => {
            window.location = "./player_games_overview.html?name=" + game.gewinner.spielname + "&id=" + game.gewinner.id; //weiterleitung zur die Spielübersicht des Gewinners
        });
    }
    
    row.appendChild(winnerField);

    let statusField = document.createElement("td");
    statusField.innerHTML = game.verlauf;
    row.appendChild(statusField);

    //Zeile der Tabelle hinzufügen
    games_table.children[0].appendChild(row);

});

if (games.length > 0) {
    new TableSorter(games_table); //neuen TableSort initieren falls Spiele existieren, um die Tabelle sortieren zu können
}
