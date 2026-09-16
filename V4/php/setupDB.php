<?php

//Funktionen für die Verbindung mit der Datenbank

function openDBConnection()
 {
 $dbhost = "localhost";
 $dbuser = "root";
 $dbpass = "";
 $db = "memory";
 $connection = new mysqli($dbhost, $dbuser, $dbpass,$db) or die("Connect failed: %s\n". $connection -> error);

 //Tabellen erstellen, falls sie noch nicht existieren
 $create_tables = file_get_contents("../sql/create_tables.sql");
 if($connection->multi_query($create_tables)) {
     while(mysqli_next_result($connection)){;}
 }
 
 return $connection;
 }
 
function closeDBConnection($connection)
 {
 $connection -> close();
 }
   
?>
