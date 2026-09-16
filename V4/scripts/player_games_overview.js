//Spielübersicht eines Spielers

import TableSorter from "./tablesort.js";

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id"); //Spieler id über url

//checken, ob user eingeloggt ist, ob er die richtige id hat oder ob er admin ist
//falls nicht, darf er nicht zugreifen und wird zurückgeschickt
const user = await fetch("./php/player.php?function=getCurrent", { method: "get" }).then(async (response) => {
    if (response.ok) {
        let usr = await response.json();
        console.log(usr.admin)
        if (parseInt(usr.admin) || parseInt(usr.id) == id) return usr;
    }

    window.location.href = "message.html?msg=Du bist nicht berechtigt diese Seite zu sehen.";
}).catch(() => {
    window.location.href = "message.html?msg=Du bist nicht berechtigt diese Seite zu sehen.";
});

//spielerdaten und spiele des spielers holen
const playerData = await fetch("./php/player.php?function=getPlayer&id=" + id, { method: "get" }).then((response) => {
    if (response.ok) return response.json();
}).catch((error) => {
    console.log("Fehler beim Laden der Spielerdaten: " + error);
    return undefined;
});
const playerGames = await fetch("./php/spiel.php?function=getPlayerPlays&id=" + id, { method: "get" }).then((response) => response.json()).catch((error) => {
    console.log("Fehler beim Laden der Spiele: " + error);
    return [];
});
const playerName = urlParams.get("name");

//übergebene Parameter aus URL holen und in HTML einsetzen
document.getElementById("playername").innerHTML = playerName;
document.getElementById("playerid").innerHTML = id;
document.getElementById("email").innerHTML = playerData ? playerData.email : "unbekannt";
document.getElementById("level").innerHTML = playerData ? playerData.level : "unbekannt";
document.getElementById("xp").innerHTML = playerData ? playerData.xp : "unbekannt";

//die Tabelle mit den Spielen
const games_table = document.getElementById("games_table");

//spielstatistik counter
let wins = 0;
let losses = 0;
let quit = 0;
let expired = 0;

//Tabelle mit Spielen füllen
playerGames.forEach((game) => {
    //neue Zeile erstellen
    let row = document.createElement("tr");

    let gameDate = new Date(game.spieltan);
    let dateField = document.createElement("td");
    dateField.dataset.sort = gameDate.getTime(); //Zeitstempel in ms als Sortierkriterium
    dateField.innerHTML = gameDate.toLocaleDateString() + " " + gameDate.toLocaleTimeString();
    row.appendChild(dateField);

    let levelField = document.createElement("td");
    levelField.dataset.sort = game.level; //Level als Sortierkriterium
    levelField.innerHTML = game.level;
    row.appendChild(levelField);

    let durationField = document.createElement("td");
    durationField.dataset.sort = game.dauer; //Dauer als Sortierkriterium
    let minutes = Math.floor(game.dauer / 60);
    let seconds = game.dauer % 60;
    durationField.innerHTML = ("00" + minutes).slice(-2) + ":" + ("00" + seconds).slice(-2);
    row.appendChild(durationField);

    let gameType = document.createElement("td");
    gameType.dataset.sort = parseInt(game.einzeln); //Spieltyp (Einzelspieler ja/nein) als Sortierkriterium
    gameType.innerHTML = parseInt(game.einzeln) ? "Einzelspieler" : "Mehrspieler";
    row.appendChild(gameType);

    let initiatorField = document.createElement("td");
    initiatorField.innerHTML = game.initiator.spielname;
    //admins können hier auch etwaige andere initiatoren anklicken und sich deren spiele anschauen, wenn es sich nicht eh um den aktuelle angeschauten spieler handelt
    if (parseInt(user.admin) && game.initiator.spielname != playerName) {
        initiatorField.classList.add("clickable");
        initiatorField.addEventListener("click", () => {
            window.location = "./player_games_overview.html?name=" + game.initiator.spielname + "&id=" + game.initiator.id;
        });
    }
    row.appendChild(initiatorField);

    let opponentField = document.createElement("td");
    opponentField.innerHTML = game.mitspieler ? game.mitspieler.spielname : "";
    if (parseInt(user.admin) && game.mitspieler && game.mitspieler.spielname != playerName) {
        opponentField.classList.add("clickable");
        opponentField.addEventListener("click", () => {
            window.location = "./player_games_overview.html?name=" + game.mitspieler.spielname + "&id=" + game.mitspieler.id;
        });
    }
    row.appendChild(opponentField);

    let winnerField = document.createElement("td");
    winnerField.innerHTML = game.gewinner ? game.gewinner.spielname : "";
    if (parseInt(user.admin) && game.gewinner && game.gewinner.spielname != playerName) {
        winnerField.classList.add("clickable");
        winnerField.addEventListener("click", () => {
            window.location = "./player_games_overview.html?name=" + game.gewinner.spielname + "&id=" + game.gewinner.id;
        });
    }
    row.appendChild(winnerField);

    let statusField = document.createElement("td");
    statusField.innerHTML = game.verlauf == "beendet" ? game.gewinner && game.gewinner.id == user.id ? "gewonnen" : "verloren" : game.verlauf;
    row.appendChild(statusField);

    //counter je nach spielverlauf entsprechend erhöhen
    if (game.verlauf == "abgebrochen") {
        quit++;
        row.style.background = "rgba(255,165,0,1)";
        row.style.color = "#111"
    }
    else if (game.verlauf == "abgelaufen") {
        expired++;
        row.style.background = "rgba(15,229,240,1)";
        row.style.color = "#111"
    }
    else if (game.gewinner?.spielname.trim() == playerName.trim()) {
        wins++;
        row.style.background = "rgba(144,238,144,1)";
        row.style.color = "#111"
    }
    else {
        losses++;
        row.style.background = "rgba(220,20,60,1)";
        
    }

    //Zeile der Tabelle hinzufügen
    games_table.children[0].appendChild(row);

});


//Children der Tabelle (Zeilen) holen und HTML Collection in ein Array umwandeln
//anscheinend hat ein table element immer per default ein tbody child, deswegen muss man von tbody die children auswählen
let tableRows = Array.from(games_table.children[0].children);
tableRows.shift(); //erste Row löschen, weil sich darin nur die Überschriften befinden, die logischerweise nicht mit sortiert werden sollen

if (playerGames.length > 0) {
    //Statistiken in HTML einsetzen
    let numGames = playerGames.length == 0 ? 1 : playerGames.length;
    document.getElementById("games_won").innerHTML = `${wins} (${((wins / numGames) * 100).toFixed(2)
        }%)`;
    document.getElementById("games_lost").innerHTML = `${losses} (${((losses / numGames) * 100).toFixed(2)
        }%)`;
    document.getElementById("games_quit").innerHTML = `${quit} (${((quit / numGames) * 100).toFixed(2)
        }%)`;
    document.getElementById("games_expired").innerHTML = `${expired} (${((expired / numGames) * 100).toFixed(2)
        }%)`;

    //Chart.js Chart mit Spieldaten erstellen
    const chart = document.getElementById("chart");

    new Chart(chart, {
        type: "doughnut",
        data: {
            labels: ["Gewonnen", "Verloren", "Abgebrochen", "Abgelaufen"],
            datasets: [
                {
                    data: [wins, losses, quit, expired],
                    backgroundColor: ["lightgreen", "crimson", "orange", "#0FE5F0"],
                    borderWidth: 0,
                },
            ],
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                    labels: {
                        color: "white",
                    },
                },
            },
        },
    });

    new TableSorter(games_table)
} else {
    //Spieler hat noch keine Spiele gespielt
    document.getElementById("statsContainer").style.display = "none";
    games_table.style.display = "none";
    document.getElementById("spacer").style.display = "none";
    document.getElementById("disclaimer").innerHTML = "Dieser Spieler hat noch keine Spiele gespielt.";
}



