//Skript für die Levelansicht

import TableSorter from "./tablesort.js";

const urlParams = new URLSearchParams(window.location.search);
const level = urlParams.get("level"); //gefragtes level aus der url auslesen

const levelData = await fetch("./php/retrieve_level_data.php?level=" + level, { method: "get" }).then((response) => response.json()).catch((error) => {
    console.log("Fehler beim Laden der Level: " + error);
    history.back();
}); //leveldaten aus der datenbank holen

let user = await fetch("./php/player.php?function=getCurrent", { method: "get" }).then((response) => {
    if (response.ok) {
        return response.json()
    } else {
        //nur für eingloggte user sichtbar
        window.location.href = "login.html";
    }
}).catch(() => {
    window.location.href = "login.html";
});

if (user && parseInt(user.admin)) {
    //admins bekommen die Option, ein Level zu bearbeiten
    document.getElementById("editLevelButton").style.display = "block";
    document.getElementById("editLevelButton").href = "./edit_level.html?level=" + level;
}  

//Daten eintragen
document.getElementById("levelnr").innerHTML = levelData.level.level;
document.getElementById("card_number").innerHTML = levelData.level.anzahl_karten;
document.getElementById("level_time").innerHTML = levelData.level.spielZeit;
document.getElementById("level_xp").innerHTML = levelData.level.xp;
document.getElementById("playernr").innerHTML = `${levelData.players.length} Spieler ${levelData.players.length == 1 ? "ist" : "sind"} in Level ${levelData.level.level}`;


const player_table = document.getElementById("player_table");

if (levelData.players.length > 0) {
    //Spielertabelle füllen
    levelData.players.forEach((player) => {
        let row = document.createElement("tr");
        if (user && parseInt(user.admin)) {
            //admins können auf die spieler klicken und sich ihre spiele anschauen
            row.classList.add("clickable");
            row.onclick = () => {
                window.location = "./player_games_overview.html?name=" + player.spielname + "&id=" + player.id;
            }
        }

        let name = document.createElement("td");
        name.innerText = player.spielname;
        let xp = document.createElement("td");
        xp.innerText = player.xp;
        xp.dataset.sort = player.xp;
        row.appendChild(name);
        row.appendChild(xp);
        player_table.children[0].appendChild(row);
    });

    new TableSorter(player_table);
} else {
    player_table.style.display = "none";
}