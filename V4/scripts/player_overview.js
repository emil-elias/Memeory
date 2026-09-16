//Übersicht aller Spieler für Admins

import TableSorter from "./tablesort.js";

const user = await fetch("./php/player.php?function=getCurrent", { method: "get" }).then(async (response) => {
    if (response.ok) {
        let usr = await response.json();
        console.log(usr.admin)
        if (parseInt(usr.admin)) return usr;
    }
    //Wenn der user kein Admin ist, darf er diese Seite nicht sehen
    window.location.href = "message.html?msg=Du bist nicht berechtigt diese Seite zu sehen.";
}).catch(() => {
    window.location.href = "message.html?msg=Du bist nicht berechtigt diese Seite zu sehen.";
});

let request = new XMLHttpRequest();
request.onload = () => {
    if (request.status == 200 && request.readyState == 4) {
        let players = JSON.parse(request.responseText);
        const player_table = document.getElementById("player_table");
        for (let i = 0; i < players.length; i++) {
            let row = document.createElement("tr");
            row.classList.add("clickable");
            row.onclick = () => {
                redirect("player_games_overview.html?name=" + players[i].spielname + "&id=" + players[i].id);
            }
            let name = document.createElement("td");
            name.innerText = players[i].spielname;
            let email = document.createElement("td");
            email.innerText = players[i].email;
            let level = document.createElement("td");
            level.innerText = players[i].level;
            level.dataset.sort = players[i].level;
            let xp = document.createElement("td");
            xp.innerText = players[i].xp;
            xp.dataset.sort = players[i].xp;
            let admin = document.createElement("td");
            admin.innerText = parseInt(players[i].admin) ? "Ja" : "Nein";
            admin.dataset.sort = parseInt(players[i].admin);
            row.appendChild(name);
            row.appendChild(email);
            row.appendChild(level);
            row.appendChild(xp);
            row.appendChild(admin);
            player_table.children[0].appendChild(row);


        }
        new TableSorter(player_table);
    }
}
request.open("GET", "php/retrieve_players.php");
request.send();

function redirect(path) {
    window.location = path;
}