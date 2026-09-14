var passwordInput = document.getElementById("password");
var passwordRepeatInput = document.getElementById("password_repeat");

var password_info = document.getElementById("password_info");
let passwords_not_matching = document.getElementById("passwords_not_matching");

var password_is_valid = false;

/**
 * Bei Klick ins Feld Passwort Info (Bedingungen) anzeigen
 */
passwordInput.onfocus = function () {
  password_info.style.display = "block";
};

/**
 * Beim Verlassen des Feldes Info nur ausblenden, 
 * wenn Passwort den Anforderungen entspricht (oder Eingabe leer ist),
 * ansonsten eingeblendet lassen damit der User weiß was falsch ist
 */
passwordInput.onblur = function () {
  if (!password_is_valid && passwordInput.value != "") {
    passwordInput.classList.add("input_invalid"); //Für die gestrichtelte Outline
    passwordInput.setCustomValidity("Passwort genügt nicht den Anforderungen"); //wird eingeblendet, wenn der User mit nicht validem Passwort abschicken will
  } else {
    password_info.style.display = "none";
    passwordInput.classList.remove("input_invalid");
    passwordInput.setCustomValidity("");
  }
};

/**
 * Bei jedem Tastendruck checken, um live anzuzeigen ob Bedinungen erfüllt wurden
 */
passwordInput.onkeyup = function () {
  checkPassword();
}

function checkPassword() {

  let longEnough = passwordInput.value.match(/.{7}/g); //enthält mind. 7 Zeichen
  let containsNumbers = passwordInput.value.match(/\d{5}/g); //ebnthält mindestens 5 Nummern
  let containsUpperCase = passwordInput.value.match(/[A-Z]+/g); //mind. 1 Großbuchstabe
  let containsLowerCase = passwordInput.value.match(/[a-z]+/g); //mind. 1 Kleinbuchstabe

  //Farbe des Textes setzen, je nachdem ob Bedingung erfüllt (grün) oder nicht (rot)
  document.getElementById("longEnough").style.color = longEnough ? "lightgreen" : "crimson";
  document.getElementById("containsNumbers").style.color = containsNumbers ? "lightgreen" : "crimson";
  document.getElementById("containsUpperCase").style.color = containsUpperCase ? "lightgreen" : "crimson";
  document.getElementById("containsLowerCase").style.color = containsLowerCase ? "lightgreen" : "crimson";

  // Wenn alle Bedingungen erfüllt sind, globalen Boolean setzen
  if (
    longEnough &&
    containsNumbers &&
    containsUpperCase &&
    containsLowerCase
  ) {
    password_is_valid = true;
  } else {
    password_is_valid = false;
  }

}

function checkPasswordEqual() {
  return passwordRepeatInput.value == passwordInput.value ;
}

passwordRepeatInput.onfocus = () => {
  passwords_not_matching.style.display = "none";
}

/**
 * Beim verlassen der Passwort wiederholen Eingabe prüfen, ob beide Passwörter übereinstimmen
 */
passwordRepeatInput.onblur = () => {
  if (!checkPasswordEqual() && passwordRepeatInput.value != "") {
    passwords_not_matching.style.display = "block";
    passwordRepeatInput.classList.add("input_invalid");
    passwordRepeatInput.setCustomValidity("Passwörter stimmen nicht überein");
  }
  else {
    passwords_not_matching.style.display = "none";
    passwordRepeatInput.classList.remove("input_invalid");
    passwordRepeatInput.setCustomValidity("");
  }
}