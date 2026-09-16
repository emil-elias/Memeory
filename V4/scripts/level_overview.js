//Skript für die Levelübersicht

let levels = await fetch("php/retrieve_levels.php", { method: "GET" }).then((response) => response.json()).catch((error) => {
    console.log("Fehler beim Laden der Level: " + error);
    return [];
});
let user = await fetch("./php/player.php?function=getCurrent", { method: "get" }).then((response) => {
    if (response.ok) {
        return response.json()
    }
}).catch((error) => {
    console.log("Fehler beim Laden des Users" + error);
    return undefined;
});

//admins bekommen die Option, ein neues Level hinzuzufügen
if (user && parseInt(user.admin)) {
    document.getElementById("addLevelButton").style.display = "block";
    document.getElementById("addLevelButton").href = "./add_level.html";
}

let level_table = document.getElementById("level_table");

levels.forEach(level => {
    let lvl = level.level;
    let card_number = level.anzahl_karten;
    let gametime = level.spielZeit;
    let xp = level.xp;

    let row = document.createElement("tr");

    //Level
    let lvlField = document.createElement("td");
    lvlField.innerHTML = lvl;
    row.appendChild(lvlField);

    //Gametime
    let gametimeField = document.createElement("td");

    //converting to mm:ss format
    var date = new Date(0);
    date.setSeconds(gametime); // specify value for SECONDS here
    var timeString = date.toISOString().substring(14, 19);

    gametimeField.innerHTML = timeString;
    row.appendChild(gametimeField);

    //Card Number
    let cardnumField = document.createElement("td");
    cardnumField.innerHTML = card_number;
    row.appendChild(cardnumField);

    let xpField = document.createElement("td");
    xpField.innerHTML = xp;
    row.appendChild(xpField);

    if (user) {
        lvlField.addEventListener("click", () => {
            window.location = "./level.html?level=" + lvl; //link zur levelansicht, nur für eingeloggte user
        });
        gametimeField.addEventListener("click", () => {
            window.location = "./level.html?level=" + lvl; 
        });
        cardnumField.addEventListener("click", () => {
            window.location = "./level.html?level=" + lvl; 
        });
        xpField.addEventListener("click", () => {
            window.location = "./level.html?level=" + lvl; 
        });
        row.classList.add("clickable");
    }

    let deleteField = document.createElement("td");

    if (user && parseInt(user.admin)) {
        //admins können level bearbeiten
        
        deleteField.style.backgroundColor = "#111";
        let deleteButton = document.createElement("button");
        deleteButton.innerHTML = "Bearbeiten";	
        deleteButton.classList.add("outline_button_blue");
        deleteField.appendChild(deleteButton);
        

        deleteButton.addEventListener("click", () => {
            window.location = "./edit_level.html?level=" + lvl;
        });
    }
    
    row.appendChild(deleteField);

    level_table.appendChild(row);
});