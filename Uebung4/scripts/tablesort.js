//Eine Hilfsklasse zum Sortieren von Tabellen

//die Idee war das möglichst modular aufzubauen um es beliebig in mehrere Tabellen einbinden zu können, deswegen ist es ein extra script
//Tabellen die sortiert werden können sollen, müssen die Klasse "sortable" haben 
//und die Spalten entsprechend die Klasse sort_number oder sort_date (später vielleicht noch andere klassen für andere typen falls notwendig)
//Im entprechenden Table Header muss ein data-col Attribut gesetzt werden, welches dem Skript sagt, welche Spalte es für die Sortierung auslesen muss
//außerdem muss jedes Element in einer Spalte ein data-sort Attribut haben, welches den Sortierwert festlegt

export default class TableSorter {

    sortReversed = false; //boolean um zu wissen ob die Tabelle gerade aufsteigend oder absteigend sortiert werden soll, wechselt bei jedem klick

    constructor(table) { //es muss eine tabelle übergeben werden


        //Children der Tabelle (Zeilen) holen und HTML Collection in ein Array umwandeln
        //anscheinend hat ein table element immer per default ein tbody child, deswegen muss man von tbody die children auswählen
        let tableRows = Array.from(table.children[0].children);
        tableRows.shift(); //erste Row löschen, weil sich darin nur die Überschriften befinden, die logischerweise nicht mit sortiert werden sollen

        const sort_numbers = table.getElementsByClassName("sort_number"); //alle Elemente/Spalten mit der Klasse "sort_number" holen
        const sort_dates = table.getElementsByClassName("sort_date"); //alle Elemente/Spalten mit der Klasse "sort_date" holen

        for (const element of sort_numbers) {
            element.addEventListener("click", () => {

                //spaltenindex aus data attribut holen (um zu wissen wo man auslesen muss)
                let col = parseInt(element.dataset.col);
                this.sortTable(tableRows, (a, b) => {

                    //Comparator zum Vergleichen von Nummern an die sortTable methode übergeben
                    const levelA = parseInt(a.cells[col].dataset.sort);
                    const levelB = parseInt(b.cells[col].dataset.sort);

                    return levelA - levelB;
                });
            }
            );
        }

        for (const element of sort_dates) {
            element.addEventListener("click", () => {

                let col = parseInt(element.dataset.col);
                this.sortTable(tableRows, (a, b) => {

                    //Comparator zum Vergleichen von Daten an die sortTable methode übergeben
                    const dateA = parseDate(a.cells[col].innerText);
                    const dateB = parseDate(b.cells[col].innerText);

                    return dateA - dateB;
                });
            }
            );
        }


    }



    //sortiert die übergebenen <tr>s nach dem übergebenen Comparator und hängt sie wieder an das entsprechende parent element (in diesem fall die table) an
    sortTable(tableRows, comparator) {

        tableRows.sort(comparator); //sortieren nach comparator

        if (this.sortReversed) {
            tableRows.reverse();
            this.sortReversed = false;
        } else {
            this.sortReversed = true;
        }

        //sortierte <tr>s wieder an die table anhängen
        for (let i = 0; i < tableRows.length; i++) {
            // parent node (in diesem fall die tabelle) speichern um die Rows später wieder anhängen zu können
            var parent = tableRows[i].parentNode;
            // von der ursprünglichen position entfernen
            var detatchedItem = parent.removeChild(tableRows[i]);
            // und wieder anhängen 
            // da wir über die bereits sortierte liste iterieren, werden so alle elemente entsprechend in der sortierten reihenfolge wieder angehängt
            parent.appendChild(detatchedItem);
        }
    }

    //wandelt europäisches Datum (tt.mm.jjjj) in Datum in Millisekunden seit 1.1.1970 um
    //für Date Comparator zum Vergleichen
    parseDate(input) {
        //var parts = input.match(/(\d+)/g); //Teile des Datums herausfiltern (jeweils zwischen den Punkten)
        // Tag, Monat, Jahr
        // Monat ist parts[1]-1 weil die Monate 0-based indexiert werden
        //return new Date(parts[2], parts[1] - 1, parts[0]).getTime(); //getTime liefert die Millisekunden seit 1.1.70
        return new Date(input).getTime();
    }

}