//Erstellt die Navbar und fügt sie als erstes Kind in den Body ein
//Links werden abhängig davon gesetzt, ob der Nutzer eingeloggt ist oder nicht

const user = await fetch("./php/player.php?function=getCurrent", { method: "get" }).then((response) => {
    if (response.ok) return response.json();
}).catch((error) => {
    console.log("Fehler beim Laden des Users" + error);
    return undefined;
});

const body = document.querySelector("body");

const navbarWrapper = document.createElement("nav");
navbarWrapper.classList.add("navbarWrapper");

const navbar = document.createElement("nav");
navbar.classList.add("navbar");

const logoLink = document.createElement("a");
logoLink.href = "./index.html";
logoLink.classList.add("nav_container");
logoLink.style.textDecoration = "none";

const logo = document.createElement("img");
logo.src = "./images/memory-logo.png";
logo.alt = "Memory Logo";
logo.height = "35";
logoLink.appendChild(logo);
logoLink.innerHTML += ' <h1>Meme<span style="color: white">ory</span></h1>';

const navLinks = document.createElement("div");
navLinks.classList.add("nav_container");

const navLink1 = document.createElement("a");
navLink1.href = "./index.html";
navLink1.innerHTML = "<button class='outline_button_blue navbar_button'>Spielen</button>";
navLinks.appendChild(navLink1);

const navLink2 = document.createElement("div");
navLink2.id = "navLink2";
navLink2.classList.add("submenuTrigger");
navLink2.innerHTML = "Übersicht";


const indicator = document.createElement("div");
indicator.classList.add("indicator");
indicator.innerHTML = `
<i class="bi bi-caret-up-fill"></i>
`;
navLink2.appendChild(indicator);

navLinks.appendChild(navLink2);




const navLink3 = document.createElement("a");
navLink3.innerHTML = user ? "Konto" : "Anmelden";
if (user) navLink3.href = "./account.html";
else navLink3.href = "./login.html";
navLinks.appendChild(navLink3);

navbar.appendChild(logoLink);
navbar.appendChild(navLinks);

const overviewOptions = document.createElement("nav");
overviewOptions.classList.add("submenu");
overviewOptions.style.display = "none";

const submenuLinks = document.createElement("section");
submenuLinks.classList.add("nav_container");
submenuLinks.innerHTML += `
<a href='./leaderboard.html'>Leaderboard</a>
<a href='./card_library.html'>Karten</a>
<a href='./level_overview.html'>Level</a>
`;


if (user && parseInt(user.admin)) {
    submenuLinks.innerHTML += `
    <a href='./player_overview.html'>Spielerübersicht</a>
    <a href='./game_overview.html'>Alle Spiele</a>`;
}

if (user) {
    submenuLinks.innerHTML += `<a href='./player_games_overview.html?id=${user.id}&name=${user.spielname}'>Deine Spiele</a>`;
}



overviewOptions.appendChild(submenuLinks);

navLink2.addEventListener("click", () => {
    if (overviewOptions.style.display == "none") {
        overviewOptions.style.display = "flex";
        indicator.style.display = "block";
    } else {
        overviewOptions.style.display = "none";
        indicator.style.display = "none";
    }
});

navbarWrapper.appendChild(navbar);
navbarWrapper.appendChild(overviewOptions);


body.insertBefore(navbarWrapper, body.firstChild);


