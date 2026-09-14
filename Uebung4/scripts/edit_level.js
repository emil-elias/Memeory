const user = await fetch("./php/player.php?function=getCurrent", { method: "get" }).then(async (response) => {
    if (response.ok) {
        let usr = await response.json();
        console.log(usr.admin)
        if (parseInt(usr.admin)) return usr;
    }

    //nur Admins dürfen diese Seite sehen
    window.location.href = "message.html?msg=Du bist nicht berechtigt diese Seite zu sehen.";
}).catch(() => {
    window.location.href = "message.html?msg=Du bist nicht berechtigt diese Seite zu sehen.";
});

let urlParams = new URLSearchParams(window.location.search);
let levelNr = urlParams.get("level");
if (!levelNr) history.back();

let levelData;

const levels = await fetch("./php/retrieve_levels.php", { method: "get" }).then((response) => {
    if (response.ok) return response.json();
    else history.back();
}).catch(() => {
    history.back();
});


levelData = levels.find((level) => level.level == levelNr);
if (!levelData) history.back();

document.getElementById("levelnr").innerHTML = levelData.level;

document.getElementById("level_minutes").value = Math.floor(levelData.spielZeit / 60);
document.getElementById("level_seconds").value = levelData.spielZeit % 60;

document.getElementById("number_of_cards").value = levelData.anzahl_karten;
document.getElementById("level_xp").value = levelData.xp;

const responseContainer = document.getElementById("response_text");

document.getElementById("submit_button").addEventListener("click", () => {
    const formData = new FormData(document.getElementById("level_form"));
    formData.append("level_number", levelNr);

    if (document.forms.level_form.checkValidity()) {
        let request = new XMLHttpRequest();
        request.onload = () => {
            if (request.status === 200 && request.readyState === 4) {
                alert(request.responseText);
                window.location.href = "level_overview.html";
            } else {
                responseContainer.innerHTML =
                    request.responseText;
            }
        };
        request.onerror = () => {
            responseContainer.innerHTML =
                request.responseText;
        };
        request.open("POST", "php/level.php?function=edit");
        request.send(formData);

    }



});

if (levels.length == levelNr) {
    document.getElementById("delete_button").addEventListener("click", () => {
        if (confirm("Wirklich löschen?")) {
            let request = new XMLHttpRequest();

            request.onload = () => {
                if (request.status === 200 && request.readyState === 4) {
                    alert(request.responseText);
                    window.location.href = "level_overview.html";
                } else {
                    responseContainer.innerHTML =
                        request.responseText;
                }
            };
            request.onerror = () => {
                responseContainer.innerHTML =
                    request.responseText;
            };
            request.open("GET", "php/level.php?function=delete&level_number=" + levelNr);
            request.send();
        }
    });

} else {
    document.getElementById("delete_button").classList.add("subtle");
    document.getElementById("delete_button").classList.remove("outline_button_red");
    document.getElementById("delete_button").style.color = "#333"
    responseContainer.innerHTML = "Dieses Level kann nicht gelöscht werden,<br> da es nicht das letzte Level ist.";
}

