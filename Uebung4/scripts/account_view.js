//Accounddaten holen und einblenden
//Falls niemand angemeldet ist, zum Login weiterleiten
fetch("./php/player.php?function=getCurrent", { method: "get" }).then(async (response) => {
    if (response.ok) {
        const user = await response.json();
        const username = document.getElementById("username");
        const playerid = document.getElementById("playerid");
        const email = document.getElementById("email");
        const level = document.getElementById("level");
        const xp = document.getElementById("xp");

        username.innerText = user.spielname;
        playerid.innerText = user.id;
        email.innerText = user.email;
        level.innerText = user.level;
        xp.innerText = user.xp;

        document.getElementById("logout").onclick = () => {
            fetch("./php/player.php?function=logout", { method: "get" }).then((response) => {
                if (response.ok) {
                    window.location.href = "login.html";
                }
            }).catch((error) => {
                console.log("Fehler beim Logout:" + error);
            });
        }

        document.getElementById("deleteAccount").onclick = () => {
            document.getElementById("deleteConfirm").style.display = "flex";
        }

        document.getElementById("modal-yes").onclick = () => {
            fetch("./php/player.php?function=delete&id=" + user.id, { method: "get" }).then((response) => {
                if (response.ok) {
                    fetch("./php/player.php?function=logout", { method: "get" });
                    window.location.href = "message.html?msg=Dein Konto wurde erfolgreich gelöscht. Auf wiedersehen!";
                }
            }).catch((error) => {
                console.log("Fehler beim Löschen des Accounts:" + error);
            });
        }

        document.getElementById("modal-no").onclick = () => {
            document.getElementById("deleteConfirm").style.display = "none";
        }

        const modals = document.getElementsByClassName("modal");

        //bei klick außerhalb des modal contents, modal schließen
        for (let i = 0; i < modals.length; i++) {
            modals[i].onclick = (event) => {
                if (event.target == modals[i]) {
                    modals[i].style.display = "none";
                }
            }
        }

    } else window.location.href = "login.html";
}).catch(() => {
    window.location.href = "login.html";
});