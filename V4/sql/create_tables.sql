CREATE TABLE IF NOT EXISTS `Level` (
    `level` INT PRIMARY KEY,
    `anzahl_karten` INT,
    `spielZeit` INT,
    `xp` INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `Spieler` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `spielname` VARCHAR(255),
    `email` VARCHAR(255),
    `passwort` VARCHAR(255),
    `level` INT,
    `xp` INT DEFAULT 0,
    `admin` BOOLEAN,
    FOREIGN KEY (`level`) REFERENCES `Level`(`level`)
);

CREATE TABLE IF NOT EXISTS `Spiel` (
    `einzeln` BOOLEAN,
    `spieltan` Datetime,
    `level` INT,
    `dauer` INT,
    `verlauf` VARCHAR(40),
    `initiator` INT,
    `mitspieler` INT,
    `gewinner` INT,
    FOREIGN KEY (`initiator`) REFERENCES `Spieler`(id),
    FOREIGN KEY (`mitspieler`) REFERENCES `Spieler`(id),
    FOREIGN KEY (`gewinner`) REFERENCES `Spieler`(id),
    FOREIGN KEY (`level`) REFERENCES `Level`(`level`)
);

CREATE TABLE IF NOT EXISTS `Karte` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `bild` BLOB,
    `name` VARCHAR(255)
);