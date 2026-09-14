//Skript für die Passwortänderung

document.getElementById("submit_button").addEventListener("click", () => {

    if (document.forms.registerForm.checkValidity()) {
        const formData = new FormData(document.getElementById("register_form"));
        let request = new XMLHttpRequest();
        request.onload = () => {
            if (request.status === 200 && request.readyState === 4) {
                alert("Passwort erfolgreich geändert");
                window.location = "account.html";
            } else if (request.status === 403) {
                //kommt 403 zurück, war das alte Passwort falsch
                alert("Das aktuelle Passwort ist nicht korrekt");
            }
            else {
                alert(request.responseText);
            }
        };
        request.onerror = () => {
            alert("Etwas ist schief gelaufen");
        };
        request.open("POST", "php/player.php?function=changePassword");
        request.send(formData);
    } 


});