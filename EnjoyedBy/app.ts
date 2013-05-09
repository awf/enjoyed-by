function getOffsetRect(elem) {
    // (1)
    var box = elem.getBoundingClientRect()

    var body = document.body
    var docElem = document.documentElement

    // (2)
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft

    // (3)
    var clientTop = docElem.clientTop || body.clientTop || 0
    var clientLeft = docElem.clientLeft || body.clientLeft || 0

    // (4)
    var top = box.top + scrollTop - clientTop
    var left = box.left + scrollLeft - clientLeft

    return { top: Math.round(top), left: Math.round(left), width: box.width, height: box.height }
}

function assert(x: bool) {
    if (x) return;

    throw 'assert failed';
}

function assertn(x: any) {
    assert(x != null);
}

function elt(id: string): HTMLElement {
    return document.getElementById(id);
}

function test_onload() {
    elt('test').innerHTML = '';
}

//----

function findSelfOrParent(e: HTMLElement, tag: string) {
    var p = e;
    for (; ;) {
        if (p == null)
            return p;

        if (p.tagName == tag)
            return p;

        if (p.parentElement == p)
            throw "zoiks";

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
    dropdown_menu: HTMLDivElement;
    newprop_1_html: string;
    newprop_0_html: string;
    newprop_frac_html: string;

    constructor() {
        this.table_expenses = <HTMLTableElement>elt('table_expenses');
        // (<HTMLTableElement>elt('design-time-expenses')).innerHTML = '';
        var button_add_item = elt('button_add_item');
        var button_add_person = elt('button_add_person');
        this.dropdown_menu = <HTMLDivElement>elt('dropdown_menu');
        this.content = <HTMLDivElement>elt('content');
        this.newprop_1_html = elt('newprop-proto-1').outerHTML;
        this.newprop_0_html = elt('newprop-proto-0').outerHTML;
        this.newprop_frac_html = elt('newprop-proto-frac').outerHTML;

        this.make_select_html();
        this.dropdown_hide();

        button_add_item.onclick = () => this.add_item();
        button_add_person.onclick = () => this.add_person();

        var url_params = document.location.search;
        if (url_params == '') {
            if (0)
                // Make a demo

                url_params = 'person0=Andrew&person1=Veggie&person2=Pioneer&' +
                'item0=Beef&amt0=10&cur0=GBP&payer0=Andrew&prop0_0=1&prop0_1=0&prop0_2=1&' +
                'item1=Wine&amt1=14&cur1=GBP&payer1=Andrew&prop1_0=1&prop1_1=1&prop1_2=0&' +
                'item2=Nuts&amt2=6&cur2=GBP&payer2=Veggie&prop2_0=0.5&prop2_1=1&prop2_2=1&done=1';
            else {
                // empty page...
                this.add_person();
                this.add_person();
                this.add_person();
                this.add_item();
            }
        }

        if (url_params != '') {
            // Parse url parameters to build tableau
            var qs = url_params.split("+").join(" ");

            var params = {};
            var re = /[?&]?([^=]+)=([^&]*)/g;

            var matches;
            while (matches = re.exec(qs))
                params[decodeURIComponent(matches[1])] = decodeURIComponent(matches[2]);

            // First count people.  Brute force, as huge numbers of people will kill anything else anyway;
            var nPeople = 0;
            var person;
            var people2id = {};
            while ((person = params['person' + nPeople]) != undefined) {
                people2id[person] = nPeople;
                this.add_person();
                (<HTMLInputElement>this.itemCell(-1, nPeople).firstChild).value = person;
                ++nPeople;
            }

            this.make_select_html();

            // Now add items.  Each is encoded thus:
            //  'item1=Wine&amt1=14&cur1=GBP&payer1=Andrew&prop1_0=1&prop1_1=1&prop1_2=0&' +
            var nItems = 0;
            var item;
            while ((item = params['item' + nItems]) != undefined) {
                var i = nItems++;
                this.add_item();
                (<HTMLInputElement>this.itemCell(i, -4).firstChild).value = item;
                (<HTMLInputElement>this.itemCell(i, -3).firstChild).value = params['amt' + i];
                (<HTMLInputElement>this.itemCell(i, -2).firstChild).value = params['cur' + i];
                (<HTMLSelectElement>this.itemCell(i, -1).firstChild).selectedIndex = people2id[params['payer' + i]];
                for (var c = 0; c < nPeople; ++c) {
                    var td = this.itemCell(i, c);
                    var propval = params['p' + i + '_' + c]; 
                    if (propval == undefined) // awf fixme remove this in due course (when Valdez folk pay)
                        propval = params['prop' + i + '_' + c];
                    if (propval == 1)
                        td.innerHTML = this.newprop_1_html;
                    else if (propval == 0)
                        td.innerHTML = this.newprop_0_html;
                    else {
                        td.innerHTML = this.newprop_frac_html;
                        (<HTMLInputElement>td.firstChild).value = propval;
                    }
                    this.set_proportion_handlers(td);
                }
            }
        }

        this.update_all();
    }

    set_change_handler(he: HTMLElement, will_change_people_names: bool = false) {
        he.onchange = (e: Event) => this.changed_element(e, will_change_people_names);
    }
    set_proportion_handlers(td: HTMLTableCellElement) {
        td.onclick = (e: MouseEvent) => this.propClick(e);
        (<HTMLInputElement>td.firstChild).onchange = (e: Event) => this.changed_element(e, false);
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

    totCellIndex(i: number, p: number) {
        return p + 2 /* button + colspan4 header */;
    }

    totCell(i: number, p: number) {
        return tblcell(this.table_expenses, 2 + this.nItems() + i, this.totCellIndex(i,p));
    }

    make_select_html() {
        var nPeople = this.nPeople();

        this.select_html = '<select class="payer-select">';
        for (var c = 0; c < nPeople; ++c) {
            var person = (<HTMLInputElement>tblcell(this.table_expenses, 1, 4 + c).firstChild).value;
            this.select_html += "<option>" + person + "</option>";
        }
        this.select_html += '</select>';
    }

    dropdown_hide() {
        this.dropdown_menu.style.display = 'none';
        //this.dropdown_menu.style.left = "" + 0 + "px";
        //this.dropdown_menu.style.top = "" + 0 + "px";
    }

    save_string: string;

    update_all() {
        var tbl = this.table_expenses;
        var row1 = tblrow(tbl, 1);
        var nPeople = this.nPeople();

        this.save_string = '';

        var people: { [s: string]: number; } = {};
        for (var c = 0; c < nPeople; ++c) {
            var cell = tblcell(tbl, 1, c+4);
            var input = <HTMLInputElement>cell.firstChild;
            people[input.value] = c + 1;
            this.save_string += "person" + c + "=" + encodeURIComponent(input.value) + '&';
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
            this.save_string += "item" + item_ind + "=" + encodeURIComponent(item) + '&';

            // Set amount to 2 dp
            var amount_ie = <HTMLInputElement>cel(1).firstChild;
            this.save_string += "amt" + item_ind + "=" + encodeURIComponent(amount_ie.value) + '&';
            var amount = -1;
            if (amount_ie.value != '') {
                amount = parseFloat(amount_ie.value);
            } else {
                amount = 0;  // this special case is OK...
            }

            if (amount >= 0) {
                amount_ie.className = 'amount-td';
                amounts[item_ind] = amount;
                amount_ie.value = amount.toFixed(2);
            } else {
                amount_ie.className = 'amount-td-inval';
                all_valid = false;
            }

            // Currency
            var cur: string = (<HTMLInputElement>cel(2).firstChild).value;
            this.save_string += "cur" + item_ind + "=" + encodeURIComponent(cur) + '&';
            currencies[item_ind] = cur;

            // Validate payer
            var payer_ie = <HTMLSelectElement>cel(3).firstChild;
            var pid = people[payer_ie.value];
            if (!pid) {
                payer_ie.className = 'payer-select-inval';
                all_valid = false;
            } else {
                payer_ie.className = 'payer-select';
                payers[item_ind] = pid;
            }
            this.save_string += "payer" + item_ind + "=" + encodeURIComponent(payer_ie.value) + '&';

            // Fix proportions
            for (var c = 0; c < nPeople; ++c) {
                var prop_cell = cel(4 + c);
                var prop_ie = <HTMLInputElement>prop_cell.firstChild;
                this.save_string += "p" + item_ind + "_" + c + "=" + encodeURIComponent(prop_ie.value) + '&';
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
        this.save_string += 'done=1';

        var url = document.URL.split('?')[0] + '?' + this.save_string;
        (<HTMLAnchorElement>elt('save_link')).href = url;
        // document.location.search = this.save_string;

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
                //(<HTMLInputElement>this.itemCell(i, p).firstChild).title = 'Enjoyed: ' + (amount*prop).toFixed(2) + ' ' + currencies[i];
                //(<HTMLInputElement>this.itemCell(i, p).firstChild).onmouseover = (e) => msg((<HTMLInputElement>e.target).title);
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
        this.make_select_html();
        var nItems = this.nItems();
        for (var i = 0; i < nItems; ++i) {
            var paidby_select = <HTMLSelectElement>this.itemCell(i, -1).firstChild;
            var last = paidby_select.selectedIndex;
            if (deletedPerson != -1)
                if (last == deletedPerson)
                    last = -1;
                else if (last > deletedPerson)
                    last -= 1;
            this.itemCell(i, -1).innerHTML = this.select_html;
            paidby_select = <HTMLSelectElement>this.itemCell(i, -1).firstChild;
            paidby_select.selectedIndex = last;
            this.set_change_handler(paidby_select);
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

    // Click on a proportion selector
    propClick(e: MouseEvent) {
        var he = <HTMLElement>e.target;
        if (he.tagName == 'INPUT')
            if ((<HTMLInputElement>he).type == 'text')
            return;
        
        var td = <HTMLTableCellElement>findSelfOrParent(he, 'TD');

        var rect = getOffsetRect(td);

        var nodeList = this.dropdown_menu.getElementsByTagName("a");
        for (var i = 0; i < nodeList.length; ++i)
            (<HTMLElement>nodeList[i]).onclick = (e: MouseEvent) => this.propPopupClick(e, td);

        this.dropdown_menu.style.display = 'block';
        this.dropdown_menu.style.left = "" + (rect.left - 1) + "px"; // 1 is borderwidth of dropdown - that of td
        this.dropdown_menu.style.top = "" + (rect.top - 1) + "px";
        this.dropdown_menu.style.width = td.style.width;
        this.dropdown_menu.onclick = (e: MouseEvent) => this.propPopupClick(e, td);
    }

    propPopupClick(e: MouseEvent, target_td: HTMLTableCellElement) {
        // Hide popup
        this.dropdown_hide();

        // Copy element
        var he = <HTMLElement>e.target;
        var td = <HTMLTableCellElement>findSelfOrParent(he, 'TD');
        if (td != null) {
            var nodeList = td.getElementsByTagName('INPUT');
            assert(nodeList.length == 1);

            var input = <HTMLInputElement>nodeList[0];

            assert(input.tagName == 'INPUT');

            target_td.innerHTML = input.outerHTML;

            input.focus(); // trying to avoid resetting document scroll....
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
        this.set_change_handler(ie, true);

        // Add proportions column to all item rows
        var nItems = this.nItems();
        for (var i = 0; i < nItems; ++i) {
            // Add at second-last column
            var ie = <HTMLInputElement>addcell(this.itemRow(i), this.newprop_1_html, old_nPeople + 4);
            this.set_proportion_handlers(<HTMLTableCellElement>ie.parentElement);
        }

        // Add column to the total rows
        for (var t = 0; t < 3; ++t) {
            addcell(this.totRow(t), 'tot', this.totCellIndex(t, old_nPeople));
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
            this.totRow(t).deleteCell(this.totCellIndex(t, personNumber));
        
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
        this.a(row, "<input class='amount-td' placeholder='0.00'/>");
        this.a(row, "<input class='currency-td' placeholder='ECU'/>");
        this.a(row, this.select_html);
        var nPeople = this.nPeople();
        for (var p = 0; p < nPeople; ++p) {
            var ie = this.a(row, this.newprop_1_html);
            this.set_proportion_handlers(<HTMLTableCellElement>ie.parentElement);
        }
        var b = addcell(row, '<button id="button_del_item">x</button>');
        this.add_del_handlers(<HTMLButtonElement>b, false);

        (<HTMLInputElement>this.itemRow(old_nItems).cells[0].firstChild).focus();

        this.update_all();

        // save button must be first in the html to accept "enter" (it really seems to be true..)
        // http://stackoverflow.com/questions/4763638/enter-triggers-button-click
        // The "type=button" trick works on the other buttons, but not then on the input fields
        var add_button = elt('button_add_item');
        var rect = getOffsetRect(add_button);
        elt('save_button').style.top = "" + (rect.top + rect.height + 3) + "px";
        elt('save_button').style.left= ""+ rect.left + "px";
    }

    del_item(e: MouseEvent) {
        this.clear_timeouts();
        var row = <HTMLTableRowElement>((<HTMLButtonElement>e.target).parentElement.parentElement);
        this.table_expenses.deleteRow(row.rowIndex);
        this.update_all();
    }
}

window.onload = () => {
    var test = elt('test');
    if (test) { test.innerHTML = ''; }
    var eb = new EnjoyedBy();
};
