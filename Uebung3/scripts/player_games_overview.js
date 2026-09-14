//übergebene Parameter aus URL holen und in HTML einsetzen
const urlParams = new URLSearchParams(window.location.search);
const firstname = urlParams.get("firstname");
const lastname = urlParams.get("lastname");
document.getElementById("firstname").innerHTML = firstname;
document.getElementById("lastname").innerHTML = lastname;

//namen in Tabelle einsetzen
//alle elemente wo der name eingesetzt werden soll haben die klasse insert_playername
const playernames = document.getElementsByClassName("insert_playername");
for (const element of playernames) {
    element.innerHTML = firstname + " " + lastname;
}

const games_table = document.getElementById("games_table");

//Children der Tabelle (Zeilen) holen und HTML Collection in ein Array umwandeln
//anscheinend hat ein table element immer per default ein tbody child, deswegen muss man von tbody die children auswählen
let tableRows = Array.from(games_table.children[0].children);
tableRows.shift(); //erste Row löschen, weil sich darin nur die Überschriften befinden, die logischerweise nicht mit sortiert werden sollen

//spielstatistik counter
let wins = 0;
let losses = 0;
let quit = 0;
let expired = 0;

//counter je nach spielverlauf entsprechend erhöhen
tableRows.forEach((element) => {
    if (element.cells[6].innerText == "abgebrochen") quit++;
    else if (element.cells[6].innerText == "abgelaufen") expired++;
    else if (element.cells[5].innerText == firstname + " " + lastname)
        wins++;
    else losses++;
});

//Statistiken in HTML einsetzen
document.getElementById("games_won").innerHTML = `${wins} (${(wins / tableRows.length) * 100
    }%)`;
document.getElementById("games_lost").innerHTML = `${losses} (${(losses / tableRows.length) * 100
    }%)`;
document.getElementById("games_quit").innerHTML = `${quit} (${(quit / tableRows.length) * 100
    }%)`;
document.getElementById("games_expired").innerHTML = `${expired} (${(expired / tableRows.length) * 100
    }%)`;

//Chart.js Chart mit Spieldaten erstellen
const chart = document.getElementById("chart");

new Chart(chart, {
    type: "doughnut",
    data: {
        labels: ["Gewonnen", "Verloren", "Abgebrochen", "Abgelaufen"],
        datasets: [
            {
                data: [wins, losses, quit, expired],
                backgroundColor: ["lightgreen", "crimson", "orange", "#0FE5F0"],
                borderWidth: 0,
            },
        ],
    },
    options: {
        plugins: {
            legend: {
                display: false,
                labels: {
                    color: "white",
                },
            },
        },
    },
});