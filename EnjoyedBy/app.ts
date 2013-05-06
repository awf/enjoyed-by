
function togglevis(e: HTMLElement) {
    e.style.display  = e.style.display != "block" ? "block" : "none";
    dlog('elt[' + e.toString() + '] -> [' + e.style.display + ']');
}

function ddclick(e: Event) {
    togglevis(elt('ddul'));
}

function ddselect(e: Event) {
    var element = <HTMLElement>e.target;
    var ul = <HTMLUListElement>findSelfOrParent(element, 'ul');
    var dl = <HTMLDListElement>findSelfOrParent(element, 'dl');
    var a = <HTMLAnchorElement>findSelfOrParent(element, 'a');
    togglevis(ul);
    (<HTMLAnchorElement>dl.firstElementChild.firstChild).innerHTML = a.innerHTML;
}

//----

function findSelfOrParent(e: HTMLElement, tag: string) {
    var p = e;
    for (; ;) {
        if (p.parentElement == p)
            throw "zoiks";

        if (p == null)
            return p;

        if (p.tagName.toLowerCase() == tag)
            return p;

        p = p.parentElement;
    }
}

function make_element(html: string): HTMLElement {
    var div = <HTMLDivElement>document.createElement('div');
    div.innerHTML = html;
    return <HTMLElement>div.firstChild;
}

function tblrow(tbl: HTMLTableElement, index: number): HTMLTableRowElement {
    return <HTMLTableRowElement>tbl.rows[index];
}

function tblcell(tbl: HTMLTableElement, r: number, c: number): HTMLTableCellElement {
    return <HTMLTableCellElement>(<HTMLTableRowElement>tbl.rows[r]).cells[c];
}

function elt(id: string): HTMLElement {
    return document.getElementById(id);
}

function log(s: string) {
    elt('content').innerHTML += "log:" + s + "<br/>";
}

function dlog(s: string) {
    elt('log').innerHTML += "log:" + s + "<br/>";
}

function msg(s: string) {
    elt('content').className = 'message-div';
    elt('content').innerHTML = s;
}

function warn(s: string) {
    elt('content').className = 'message-div-active-2';
    elt('content').innerHTML = s;
    setTimeout(() => {
        elt('content').className = 'message-div-active-1';
        setTimeout(() => {
            elt('content').className = 'message-div';
        }, 100);
    }, 100);
}

function table_delete_row(tbl: HTMLTableElement, row: HTMLTableRowElement) {
    var rowCount: number = tbl.rows.length;
    var foundRow = -1;
    for (var i = 0; i < rowCount - 1; ++i)
        if (tbl.rows[i] == row) {
            foundRow = i;
            break;
        }
    if (foundRow == -1) {
        warn("BAD FRONTROW");
        return;
    }
    tbl.deleteRow(foundRow);

}

function addcell(row: HTMLTableRowElement, s: string, loc? = -1): HTMLElement {
    var cell = <HTMLTableCellElement> row.insertCell(loc == -1 ? row.cells.length : loc);
    var e = make_element(s);
    cell.appendChild(e);
    return e;
}


class EnjoyedBy {
    table_expenses: HTMLTableElement;
    content: HTMLDivElement;
    //select_element: HTMLSelectElement;
    select_html: string;

    constructor() {
        this.table_expenses = <HTMLTableElement>elt('table_expenses');
        // (<HTMLTableElement>elt('design-time-expenses')).innerHTML = '';
        var button_add_item = elt('button_add_item');
        var button_add_person = elt('button_add_person');
        this.content = <HTMLDivElement>elt('content');

        button_add_item.onclick = () => this.add_item();
        button_add_person.onclick = () => this.add_person();

        // If using the demo, add input handlers...
        var tbl = this.table_expenses;
        var nPeople = this.nPeople();
        for (var c = 0; c < nPeople; ++c) {
            // Person inputs on row 1
            var ie = <HTMLInputElement>(tblcell(tbl, 1, c + 4).firstChild);
            ie.onchange = (e: Event) => this.changed_element(e, true);

            // and add "delete" buttons on last row
            tblcell(tbl, tbl.rows.length - 1, c + 1).innerHTML = '<button class="x-button">x</button>';
            this.add_del_handlers(<HTMLButtonElement>tblcell(tbl, tbl.rows.length - 1, c + 1).firstChild, true);
        }

        this.make_select_element();

        var nItems = this.nItems();
        for (var ii = 0; ii < nItems; ++ii) {
            // Replace dummy input from default.htm with new person selector
            this.itemCell(ii, -1).innerHTML = this.select_html;
            (<HTMLSelectElement>this.itemCell(ii, -1).firstChild).selectedIndex = (ii == 2 ? 1 : 0);  // Make veggie pay for third item 
            // Replace event handlers on item rows.
            for (var c = -4; c < nPeople; ++c) {
                var ie = <HTMLInputElement>(this.itemCell(ii, c).firstChild);
                ie.onchange = (e: Event) => this.changed_element(e, c==-1);
            }
            this.add_del_handlers(<HTMLButtonElement>(this.itemCell(ii, nPeople).firstChild), false);
        }
        
       this.update_all();
    }

    nItems() {
        return this.table_expenses.rows.length - 2 /* headers */ - 3 /* totals */ - 1 /* delete buttons */;
    }

    nPeople() {
        return tblrow(this.table_expenses,1).cells.length - 5 /* item, amt, cur, payer , delete button */;
    }

    itemRow(i: number) {
        return tblrow(this.table_expenses, 2 + i);
    }

    itemCell(i: number, person: number) {
        return tblcell(this.table_expenses, 2 + i, 4+person);
    }

    totRow(i: number) {
        return tblrow(this.table_expenses, 2 + this.nItems() + i);
    }

    totCell(i: number, p: number) {
        return tblcell(this.table_expenses, 2 + this.nItems() + i, p + 2 /* button + colspan4 header */);
    }

    make_select_element() {
        var nPeople = this.nPeople();

        this.select_html = '<select id="person-select">';
        for (var c = 0; c < nPeople; ++c) {
            var person = (<HTMLInputElement>tblcell(this.table_expenses, 1, 4 + c).firstChild).value;
            this.select_html += "<option>" + person + "</option>";
        }
        this.select_html += '</select>';

        //select_element = <HTMLSelectElement>make_element(this.select_html);
    }

    update_all() {
        var tbl = this.table_expenses;
        var row1 = tblrow(tbl, 1);
        var nPeople = this.nPeople();

        var people: { [s: string]: number; } = {};
        for (var c = 0; c < nPeople; ++c) {
            var cell = tblcell(tbl, 1, c+4);
            var input = <HTMLInputElement>cell.firstChild;
            people[input.value] = c + 1;
        }

        var nItems = this.nItems();

        var proportions: number[][] = new Array(nItems);
        var payers: number[] = new Array(nItems);
        var amounts: number[] = new Array(nItems);
        var currencies: string[] = new Array(nItems);

        // Loop over itemrows
        var all_valid = true;
        for (var item_ind = 0; item_ind < nItems; ++item_ind) {
            proportions[item_ind] = new Array(nPeople);
            var row = this.itemRow(item_ind);
            function cel(c: number) { return <HTMLTableCellElement>row.cells[c]; }

            // Item description
            var item: string = (<HTMLInputElement>cel(0).firstChild).value;

            // Set amount to 2 dp
            var amount_ie = <HTMLInputElement>cel(1).firstChild;
            var amount = 0;
            if (amount_ie.value != '') {
                var amount: number = parseFloat(amount_ie.value);
            }
            if (amount > 0) {
                amount_ie.className = 'amount-td';
                amounts[item_ind] = amount;
                amount_ie.value = amount.toFixed(2);
            } else {
                amount_ie.className = 'amount-td-inval';
                all_valid = false;
            }

            // Currency
            var cur: string = (<HTMLInputElement>cel(2).firstChild).value;
            currencies[item_ind] = cur;

            // Validate payer
            var payer_ie = <HTMLInputElement>cel(3).firstChild;
            var pid = people[payer_ie.value];
            if (!pid) {
                payer_ie.className = 'person-select-inval';
                all_valid = false;
            } else {
                payer_ie.className = 'person-select';
                payers[item_ind] = pid;
            }

            // Fix proportions
            for (var c = 0; c < nPeople; ++c) {
                var prop_cell = cel(4 + c);
                var prop_ie = <HTMLInputElement>prop_cell.firstChild;
                var prop = parseFloat(prop_ie.value);
                if (prop >= 0) { // note must fail for nan
                    prop_cell.className = 'prop-td';
                    proportions[item_ind][c] = prop;
                }
                else {
                    prop_cell.className = 'prop-td-inval';
                    all_valid = false;
                }
            }
        }

        if (!all_valid) {
            warn('Invalid fields: Totals not computed');
            for (var t = 0; t < 3; ++t)
                for (var c = 0; c < nPeople; ++c) {
                    this.totCell(t, c).className = 'tot-td-inval';
                    this.totCell(t, c).innerHTML = '';
                }
            return;
        }

        // all valid.  First set style on total cells, then compute...
        elt('content').innerHTML = '';

        var total_enjoyed: number[] = new Array(nPeople);
        var total_paid: number[] = new Array(nPeople);

        for (var p = 0; p < nPeople; ++p) {
            total_enjoyed[p] = 0;
            total_paid[p] = 0;
        }
        for (var i = 0; i < nItems; ++i) {
            var amount = amounts[i];
            total_paid[payers[i] - 1] += amount;

            var propsum = 0;
            for (var p = 0; p < nPeople; ++p)
                propsum += proportions[i][p];
            for (var p = 0; p < nPeople; ++p) {
                var prop = proportions[i][p] / propsum;
                total_enjoyed[p] += amount * prop;
                (<HTMLInputElement>this.itemCell(i, p).firstChild).title = 'Enjoyed: ' + (amount*prop).toFixed(2) + ' ' + currencies[i];
                (<HTMLInputElement>this.itemCell(i, p).firstChild).onmouseover = (e) => msg((<HTMLInputElement>e.target).title);
            }
        }

        for (var t = 0; t < 3; ++t)
            for (var c = 0; c < nPeople; ++c)
                this.totCell(t, c).className = 'tot-td';

        for (var c = 0; c < nPeople; ++c) {
            this.totCell(0, c).innerHTML = total_enjoyed[c].toFixed(2);
            this.totCell(1, c).innerHTML = total_paid[c].toFixed(2);
            this.totCell(2, c).innerHTML = (total_paid[c] - total_enjoyed[c]).toFixed(2);
        }
    }
    
    // Update the "enjoyed by" td's colspan
    update_enjoyed_by() {
        var nPeople = this.nPeople();
        var eb_td = <HTMLTableCellElement>elt('eb-td');
        eb_td.colSpan = nPeople > 0 ? nPeople : 1; // zero colspan not allowed, let's just leave the table improper
    }

    update_name_selectors(deletedPerson: number = -1) {
        this.make_select_element();
        var nItems = this.nItems();
        for (var i = 0; i < nItems; ++i) {
            var s = <HTMLSelectElement>this.itemCell(i, -1).firstChild;
            var last = s.selectedIndex;
            if (deletedPerson != -1)
                if (last == deletedPerson)
                    last = -1;
                else if (last > deletedPerson)
                    last -= 1;
            this.itemCell(i, -1).innerHTML = this.select_html;
            s = <HTMLSelectElement>this.itemCell(i, -1).firstChild;
            s.selectedIndex = last;
        }
    }

    changed_element(e: Event, names_changed: bool = false) {
        var ie = <HTMLInputElement>e.target;
        //log('change [' + e.target + '] -> ' + ie.value);
        if (names_changed) {
            this.update_name_selectors();
        }
        this.update_all();
    }


    onclick_timeout: number[] = new Array();
    clear_timeouts() {
        while (this.onclick_timeout.length > 0)
            clearTimeout(this.onclick_timeout.pop());
    }

    mouse_is_down: bool;

    // Horrid bool is because the continuation doesn't appear to define "this" sensibly.
    add_del_handlers(b: HTMLButtonElement, person: bool) {
        // Publish a warning on single-click, but wait to ensure the double click didn't happen.
        b.onclick = () => {
            this.onclick_timeout.push(setTimeout(() => warn('Need to double-click or long-click to delete'), 200));
        }
        // Long dwell on mousedown will also delete
        b.onmouseup = () => {
            this.mouse_is_down = false;
        }
        b.onmousedown = (e: MouseEvent) => {
            this.mouse_is_down = true;
            this.onclick_timeout.push(setTimeout(() => {
                // If we come back 700ms later, and mouse is still down, delete...
                if (this.mouse_is_down)
                    if (person)
                        this.del_person(e);
                    else
                        this.del_item(e);
            }, 750));
        }
        
        b.ondblclick = (e: MouseEvent) => {
            if (person)
                this.del_person(e);
            else
                this.del_item(e);
        }
    }

    add_person() {
        // And add a column to the items table.
        var tbl = this.table_expenses;
        var row1 = tblrow(tbl, 1);
        var old_nPeople = this.nPeople();
        var val = 'Person' + (old_nPeople + 1);

        // People cells in row 1
        var ie = <HTMLInputElement>addcell(row1, '<input class="person-td" type="text" value="' + val + '"/>', old_nPeople + 4);
        ie.onchange = (e: Event) => this.changed_element(e, true);

        // Add column to all item rows
        var nItems = this.nItems();
        for (var i = 0; i < nItems; ++i) {
            // Add at second-last column
            var ie = <HTMLInputElement>addcell(this.itemRow(i), '<input class="prop-td" type="text" value="1" />', old_nPeople + 4);
            ie.onchange = (e: Event) => this.changed_element(e);
        }

        // Add column to the total rows
        for (var t = 0; t < 3; ++t) {
            addcell(this.totRow(t), 'tot', old_nPeople + 2);
            this.totCell(t, old_nPeople).className = 'tot-td';
        }

        // Add delete button to last row
        var e = addcell(tblrow(tbl, tbl.rows.length - 1), '<button class="x-button">x</button>', old_nPeople + 1);
        e.parentElement.className = 'tot-td';
        this.add_del_handlers(<HTMLButtonElement>e, true);

        this.update_name_selectors();
        this.update_enjoyed_by();
        this.update_all();
    }

    del_person(e: MouseEvent) {
        this.clear_timeouts();

        var cell = <HTMLTableCellElement>(<HTMLElement>e.target).parentElement
        var personNumber = cell.cellIndex - 1; // we're on the last row. Person 0 is cell 1
        dlog('deleting person' + personNumber);
        if (this.nPeople() <= 1) {
            warn("Won't delete the last person.  Just change their name?");
            return;
        }

        // And delete columns from expenses
        var tbl = this.table_expenses;
        // People cells in row 1
        tblrow(tbl, 1).deleteCell(personNumber + 4);
        // Del column from all item rows
        var nItems = this.nItems();
        for (var i = 0; i < nItems; ++i)
            this.itemRow(i).deleteCell(personNumber + 4);
        // Delete total on 2nd last row
        for (var t = 0; t < 3; ++t)
            this.totRow(t).deleteCell(personNumber + 2);
        
        // Delete button on last row
        tblrow(tbl, tbl.rows.length - 1).deleteCell(personNumber + 1);

        this.update_name_selectors(personNumber);
        this.update_enjoyed_by();
        this.update_all();
    }

    // Can't make this a function in add_item as the this is mangled.
    a(row: HTMLTableRowElement, s: string) {
        var ie = <HTMLInputElement>addcell(row, s);
        ie.onchange = (e: Event) => this.changed_element(e);
        return ie;
    }

    add_item() {
        var tbl = this.table_expenses;
        var old_nItems = this.nItems();
        var row = <HTMLTableRowElement> tbl.insertRow(2 + old_nItems);
        var itemNumber = (old_nItems + 1).toString();
        var count = 0;

        this.a(row, "<input class='item-td' placeholder='item" + itemNumber + "'/>");
        this.a(row, "<input class='amount-td' placeholder='e.g. 1.00'/>").parentElement;
        this.a(row, "<input class='currency-td' placeholder='e.g. GBP'/>");
        this.a(row, this.select_html);
        var nPeople = this.nPeople();
        for (var p = 0; p < nPeople; ++p) {
            this.a(row, "<input class='prop-td' value='1'/>");
        }
        var b = addcell(row, '<button id="button_del_item">x</button>');
        this.add_del_handlers(<HTMLButtonElement>b, false);

        (<HTMLInputElement>this.itemRow(old_nItems).cells[0].firstChild).focus();

        this.update_all();
    }

    del_item(e: MouseEvent) {
        this.clear_timeouts();
        var row = <HTMLTableRowElement>((<HTMLButtonElement>e.target).parentElement.parentElement);
        this.table_expenses.deleteRow(row.rowIndex);
        this.update_all();
    }
}

window.onload = () => {
    var eb = new EnjoyedBy();
};