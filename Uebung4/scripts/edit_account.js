//Skript zum ändern der Accountdaten

fetch("./php/player.php?function=getCurrent", { method: "get" }).then(async (response) => {

    //nur wenn user eingeloggt ist
    if (response.ok) {

        const user = await response.json();

        //aktuellen Spielernamen und Emailadresse in die Felder eintragen
        const username = document.getElementById("username");
        const email = document.getElementById("email_address");
        username.value = user.spielname;
        email.value = user.email;

        document.getElementById("confirmPassword").onclick = () => {
            const password = document.getElementById("passwordToBeConfirmed").value;

            if (document.forms.registerForm.checkValidity()) {
                const formData = new FormData(document.getElementById("register_form"));
                formData.append("password", password); //passwort zur Konfirmation mitsenden
                let request = new XMLHttpRequest();
                request.onload = () => {
                    if (request.status === 200 && request.readyState === 4) {
                        window.location = "account.html"
                    } else if (request.status === 403) {
                        //kommt 403 zurück, war das alte Passwort falsch
                        document.getElementById("passwordConfirm").style.display = "none";
                        alert("Das Passwort ist nicht korrekt");
                    }
                    else {
                        document.getElementById("passwordConfirm").style.display = "none";
                        alert(request.responseText);
                        
                    }
                };
                request.onerror = () => {
                    alert("Etwas ist schief gelaufen");
                };
                request.open("POST", "php/player.php?function=edit&id=" + user.id);
                request.send(formData);
            }

        }

        //beim klick auf den submit button passwort check durchführen zur Konfirmation
        document.getElementById("submit_button").addEventListener("click", () => {
            //Passwort Confirm Dialog öffnen
            //ist ein extra Dialog um evtl. Missverständnisse zu vermeiden,
            //man hätte auch ein extra Feld ins Formular einbauen können
            //aber nicht dass Nutzer dann denken sie könnten dort ihr Passwort ändern
            document.getElementById("passwordConfirm").style.display = "flex";

        });

        document.getElementById("closePasswordConfirm").onclick = () => {
            //Möchte der Nutzer das passwort nicht bestätigen, eine Seite zurück wo er herkam
            history.back();
        }

    } else window.location.href = "login.html"; //ansonsten zum login weiterleiten
}).catch(() => {
    window.location.href = "login.html";
});