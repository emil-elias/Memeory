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

const levels = await fetch("./php/retrieve_levels.php", { method: "get" }).then((response) => {
    if (response.ok) return response.json();
}).catch(() => {
    return undefined;
});

if (levels) {
    document.getElementById("level_number").value = levels.length + 1;
    document.getElementById("level_number").disabled = true;
}

document.getElementById("submit_button").addEventListener("click", () => {
    const formData = new FormData(document.getElementById("level_form"));
    if (document.getElementById("level_number").disabled) formData.append("level_number", levels.length + 1);
    const responseContainer = document.getElementById("response_text");

    if (document.forms.level_form.checkValidity()) {
        let request = new XMLHttpRequest();
        request.onload = () => {
            if (request.status === 200 && request.readyState === 4) {
                responseContainer.innerHTML =
                    request.responseText;
                document.getElementById("level_number").value = parseInt(document.getElementById("level_number").value) + 1;
            } else {
                responseContainer.innerHTML =
                    "Etwas ist schief gelaufen";
            }
        };
        request.onerror = () => {
            responseContainer.innerHTML =
                "Etwas ist schief gelaufen";
        };
        request.open("POST", "php/level.php?function=insert");
        request.send(formData);

    }



});