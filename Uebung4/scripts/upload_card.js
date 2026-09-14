const user = await fetch("./php/player.php?function=getCurrent", { method: "get" }).then(async (response) => {
    if (response.ok) {
        let usr = await response.json();
        console.log(usr.admin)
        if (parseInt(usr.admin)) return usr;
    }

    window.location.href = "message.html?msg=Du bist nicht berechtigt diese Seite zu sehen.";
}).catch(() => {
    window.location.href = "message.html?msg=Du bist nicht berechtigt diese Seite zu sehen.";
});

document.getElementById("submit_button").addEventListener("click", () => {
    const formData = new FormData(document.getElementById("card_form"));
    const responseContainer = document.getElementById("response_text");

    let request = new XMLHttpRequest();
    request.onload = () => {
        if (request.status === 200 && request.readyState === 4) {
            responseContainer.innerHTML =
                request.responseText;
        } else {
            responseContainer.innerHTML =
                "Etwas ist schief gelaufen";
        }
    };
    request.onerror = () => {
        responseContainer.innerHTML =
            "Etwas ist schief gelaufen";
    };
    request.open("POST", "php/card.php");
    request.send(formData);

});