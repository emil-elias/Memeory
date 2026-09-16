CREATE TABLE IF NOT EXISTS `Level` (
    `level` INT PRIMARY KEY,
    `anzahl_karten` INT,
    `spielZeit` INT
);

CREATE TABLE IF NOT EXISTS `Spieler` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `spielname` VARCHAR(20),
    `email` VARCHAR(40),
    `passwort` VARCHAR(40),
    `level` INT,
    FOREIGN KEY (`level`) REFERENCES `Level`(`level`)
);

CREATE TABLE IF NOT EXISTS `Spiel` (
    `einzeln` BOOLEAN,
    `spieltan` Datetime,
    `dauer` INT,
    `verlauf` VARCHAR(40),
    `initiator` INT,
    `mitspieler` INT,
    `gewinner` INT,
    FOREIGN KEY (`initiator`) REFERENCES `Spieler`(id),
    FOREIGN KEY (`mitspieler`) REFERENCES `Spieler`(id),
    FOREIGN KEY (`gewinner`) REFERENCES `Spieler`(id)
);

CREATE TABLE IF NOT EXISTS `Karte` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `bild` BLOB,
    `name` VARCHAR(20)
);