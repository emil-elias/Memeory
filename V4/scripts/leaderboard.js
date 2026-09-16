//Skript für das Anzeigen des Leaderboards

import TableSorter from "./tablesort.js";

let user = await fetch("./php/player.php?function=getCurrent", { method: "get" }).then((response) => {
    if (response.ok) {
        return response.json()
    } else {
        //nur für eingeloggte user sichtbar
        window.location.href = "login.html";
    }
}).catch(() => {
    window.location.href = "login.html";
});

const players = await fetch("./php/leaderboard.php", { method: "get" }).then((response) => response.json()).catch((error) => {
    console.log("Fehler beim Laden der Spieler: " + error);
    return [];
});

const player_table = document.getElementById("player_table");

players.forEach((player) => {
    let row = document.createElement("tr");
    let name = document.createElement("td");
    name.innerText = player.spielname;

    //wenn der user admin ist, dann kann er auf die einzelnen spieler klicken und sich seine spiele anschauen
    if (user && parseInt(user.admin)) {
        name.classList.add("clickable");
        name.onclick = () => {
            window.location = "./player_games_overview.html?name=" + player.spielname + "&id=" + player.id;
        }
    }

    let level = document.createElement("td");
    level.innerText = player.level;
    level.dataset.sort = player.level;

    level.classList.add("clickable");
    level.onclick = () => {
        window.location = "./level.html?level=" + player.level; //weiterleitung zur levelansicht
    }

    let xp = document.createElement("td");
    xp.innerText = player.xp;
    xp.dataset.sort = player.xp;
    row.appendChild(name);
    row.appendChild(level);
    row.appendChild(xp);

    player_table.children[0].appendChild(row);
});

new TableSorter(player_table);
