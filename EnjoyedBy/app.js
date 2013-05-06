function make_element(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
}
function tblrow(tbl, index) {
    return tbl.rows[index];
}
function tblcell(tbl, r, c) {
    return (tbl.rows[r]).cells[c];
}
function elt(id) {
    return document.getElementById(id);
}
function log(s) {
    elt('content').innerHTML += "log:" + s + "<br/>";
}
function dlog(s) {
    elt('log').innerHTML += "log:" + s + "<br/>";
}
function msg(s) {
    elt('content').className = 'message-div';
    elt('content').innerHTML = s;
}
function warn(s) {
    elt('content').className = 'message-div-active-2';
    elt('content').innerHTML = s;
    setTimeout(function () {
        elt('content').className = 'message-div-active-1';
        setTimeout(function () {
            elt('content').className = 'message-div';
        }, 100);
    }, 100);
}
function table_delete_row(tbl, row) {
    var rowCount = tbl.rows.length;
    var foundRow = -1;
    for(var i = 0; i < rowCount - 1; ++i) {
        if(tbl.rows[i] == row) {
            foundRow = i;
            break;
        }
    }
    if(foundRow == -1) {
        warn("BAD FRONTROW");
        return;
    }
    tbl.deleteRow(foundRow);
}
function addcell(row, s, loc) {
    if (typeof loc === "undefined") { loc = -1; }
    var cell = row.insertCell(loc == -1 ? row.cells.length : loc);
    var e = make_element(s);
    cell.appendChild(e);
    return e;
}
var EnjoyedBy = (function () {
    function EnjoyedBy() {
        var _this = this;
        this.onclick_timeout = new Array();
        this.table_expenses = elt('table_expenses');
        var button_add_item = elt('button_add_item');
        var button_add_person = elt('button_add_person');
        this.content = elt('content');
        button_add_item.onclick = function () {
            return _this.add_item();
        };
        button_add_person.onclick = function () {
            return _this.add_person();
        };
        var tbl = this.table_expenses;
        var nPeople = this.nPeople();
        for(var c = 0; c < nPeople; ++c) {
            var ie = (tblcell(tbl, 1, c + 4).firstChild);
            ie.onchange = function (e) {
                return _this.changed_element(e, true);
            };
            tblcell(tbl, tbl.rows.length - 1, c + 1).innerHTML = '<button class="x-button">x</button>';
            this.add_del_handlers(tblcell(tbl, tbl.rows.length - 1, c + 1).firstChild, true);
        }
        this.make_select_element();
        var nItems = this.nItems();
        for(var ii = 0; ii < nItems; ++ii) {
            this.itemCell(ii, -1).innerHTML = this.select_html;
            (this.itemCell(ii, -1).firstChild).selectedIndex = (ii == 2 ? 1 : 0);
            for(var c = -4; c < nPeople; ++c) {
                var ie = (this.itemCell(ii, c).firstChild);
                ie.onchange = function (e) {
                    return _this.changed_element(e, c == -1);
                };
            }
            this.add_del_handlers((this.itemCell(ii, nPeople).firstChild), false);
        }
        this.update_all();
    }
    EnjoyedBy.prototype.nItems = function () {
        return this.table_expenses.rows.length - 2 - 3 - 1;
    };
    EnjoyedBy.prototype.nPeople = function () {
        return tblrow(this.table_expenses, 1).cells.length - 5;
    };
    EnjoyedBy.prototype.itemRow = function (i) {
        return tblrow(this.table_expenses, 2 + i);
    };
    EnjoyedBy.prototype.itemCell = function (i, person) {
        return tblcell(this.table_expenses, 2 + i, 4 + person);
    };
    EnjoyedBy.prototype.totRow = function (i) {
        return tblrow(this.table_expenses, 2 + this.nItems() + i);
    };
    EnjoyedBy.prototype.totCell = function (i, p) {
        return tblcell(this.table_expenses, 2 + this.nItems() + i, p + 2);
    };
    EnjoyedBy.prototype.make_select_element = function () {
        var nPeople = this.nPeople();
        this.select_html = '<select id="person-select">';
        for(var c = 0; c < nPeople; ++c) {
            var person = (tblcell(this.table_expenses, 1, 4 + c).firstChild).value;
            this.select_html += "<option>" + person + "</option>";
        }
        this.select_html += '</select>';
    };
    EnjoyedBy.prototype.update_all = function () {
        var tbl = this.table_expenses;
        var row1 = tblrow(tbl, 1);
        var nPeople = this.nPeople();
        var people = {
        };
        for(var c = 0; c < nPeople; ++c) {
            var cell = tblcell(tbl, 1, c + 4);
            var input = cell.firstChild;
            people[input.value] = c + 1;
        }
        var nItems = this.nItems();
        var proportions = new Array(nItems);
        var payers = new Array(nItems);
        var amounts = new Array(nItems);
        var currencies = new Array(nItems);
        var all_valid = true;
        for(var item_ind = 0; item_ind < nItems; ++item_ind) {
            proportions[item_ind] = new Array(nPeople);
            var row = this.itemRow(item_ind);
            function cel(c) {
                return row.cells[c];
            }
            var item = (cel(0).firstChild).value;
            var amount_ie = cel(1).firstChild;
            var amount = 0;
            if(amount_ie.value != '') {
                var amount = parseFloat(amount_ie.value);
            }
            if(amount > 0) {
                amount_ie.className = 'amount-td';
                amounts[item_ind] = amount;
                amount_ie.value = amount.toFixed(2);
            } else {
                amount_ie.className = 'amount-td-inval';
                all_valid = false;
            }
            var cur = (cel(2).firstChild).value;
            currencies[item_ind] = cur;
            var payer_ie = cel(3).firstChild;
            var pid = people[payer_ie.value];
            if(!pid) {
                payer_ie.className = 'person-select-inval';
                all_valid = false;
            } else {
                payer_ie.className = 'person-select';
                payers[item_ind] = pid;
            }
            for(var c = 0; c < nPeople; ++c) {
                var prop_cell = cel(4 + c);
                var prop_ie = prop_cell.firstChild;
                var prop = parseFloat(prop_ie.value);
                if(prop >= 0) {
                    prop_cell.className = 'prop-td';
                    proportions[item_ind][c] = prop;
                } else {
                    prop_cell.className = 'prop-td-inval';
                    all_valid = false;
                }
            }
        }
        if(!all_valid) {
            warn('Invalid fields: Totals not computed');
            for(var t = 0; t < 3; ++t) {
                for(var c = 0; c < nPeople; ++c) {
                    this.totCell(t, c).className = 'tot-td-inval';
                    this.totCell(t, c).innerHTML = '';
                }
            }
            return;
        }
        elt('content').innerHTML = '';
        var total_enjoyed = new Array(nPeople);
        var total_paid = new Array(nPeople);
        for(var p = 0; p < nPeople; ++p) {
            total_enjoyed[p] = 0;
            total_paid[p] = 0;
        }
        for(var i = 0; i < nItems; ++i) {
            var amount = amounts[i];
            total_paid[payers[i] - 1] += amount;
            var propsum = 0;
            for(var p = 0; p < nPeople; ++p) {
                propsum += proportions[i][p];
            }
            for(var p = 0; p < nPeople; ++p) {
                var prop = proportions[i][p] / propsum;
                total_enjoyed[p] += amount * prop;
                (this.itemCell(i, p).firstChild).title = 'Enjoyed: ' + (amount * prop).toFixed(2) + ' ' + currencies[i];
                (this.itemCell(i, p).firstChild).onmouseover = function (e) {
                    return msg((e.target).title);
                };
            }
        }
        for(var t = 0; t < 3; ++t) {
            for(var c = 0; c < nPeople; ++c) {
                this.totCell(t, c).className = 'tot-td';
            }
        }
        for(var c = 0; c < nPeople; ++c) {
            this.totCell(0, c).innerHTML = total_enjoyed[c].toFixed(2);
            this.totCell(1, c).innerHTML = total_paid[c].toFixed(2);
            this.totCell(2, c).innerHTML = (total_paid[c] - total_enjoyed[c]).toFixed(2);
        }
    };
    EnjoyedBy.prototype.update_enjoyed_by = function () {
        var nPeople = this.nPeople();
        var eb_td = elt('eb-td');
        eb_td.colSpan = nPeople > 0 ? nPeople : 1;
    };
    EnjoyedBy.prototype.update_name_selectors = function (deletedPerson) {
        if (typeof deletedPerson === "undefined") { deletedPerson = -1; }
        this.make_select_element();
        var nItems = this.nItems();
        for(var i = 0; i < nItems; ++i) {
            var s = this.itemCell(i, -1).firstChild;
            var last = s.selectedIndex;
            if(deletedPerson != -1) {
                if(last == deletedPerson) {
                    last = -1;
                } else if(last > deletedPerson) {
                    last -= 1;
                }
            }
            this.itemCell(i, -1).innerHTML = this.select_html;
            s = this.itemCell(i, -1).firstChild;
            s.selectedIndex = last;
        }
    };
    EnjoyedBy.prototype.changed_element = function (e, names_changed) {
        if (typeof names_changed === "undefined") { names_changed = false; }
        var ie = e.target;
        if(names_changed) {
            this.update_name_selectors();
        }
        this.update_all();
    };
    EnjoyedBy.prototype.clear_timeouts = function () {
        while(this.onclick_timeout.length > 0) {
            clearTimeout(this.onclick_timeout.pop());
        }
    };
    EnjoyedBy.prototype.add_del_handlers = function (b, person) {
        var _this = this;
        b.onclick = function () {
            _this.onclick_timeout.push(setTimeout(function () {
                return warn('Need to double-click or long-click to delete');
            }, 200));
        };
        b.onmouseup = function () {
            _this.mouse_is_down = false;
        };
        b.onmousedown = function (e) {
            _this.mouse_is_down = true;
            _this.onclick_timeout.push(setTimeout(function () {
                if(_this.mouse_is_down) {
                    if(person) {
                        _this.del_person(e);
                    } else {
                        _this.del_item(e);
                    }
                }
            }, 750));
        };
        b.ondblclick = function (e) {
            if(person) {
                _this.del_person(e);
            } else {
                _this.del_item(e);
            }
        };
    };
    EnjoyedBy.prototype.add_person = function () {
        var _this = this;
        var tbl = this.table_expenses;
        var row1 = tblrow(tbl, 1);
        var old_nPeople = this.nPeople();
        var val = 'Person' + (old_nPeople + 1);
        var ie = addcell(row1, '<input class="person-td" type="text" value="' + val + '"/>', old_nPeople + 4);
        ie.onchange = function (e) {
            return _this.changed_element(e, true);
        };
        var nItems = this.nItems();
        for(var i = 0; i < nItems; ++i) {
            var ie = addcell(this.itemRow(i), '<input class="prop-td" type="text" value="1" />', old_nPeople + 4);
            ie.onchange = function (e) {
                return _this.changed_element(e);
            };
        }
        for(var t = 0; t < 3; ++t) {
            addcell(this.totRow(t), 'tot', old_nPeople + 2);
            this.totCell(t, old_nPeople).className = 'tot-td';
        }
        var e = addcell(tblrow(tbl, tbl.rows.length - 1), '<button class="x-button">x</button>', old_nPeople + 1);
        e.parentElement.className = 'tot-td';
        this.add_del_handlers(e, true);
        this.update_name_selectors();
        this.update_enjoyed_by();
        this.update_all();
    };
    EnjoyedBy.prototype.del_person = function (e) {
        this.clear_timeouts();
        var cell = (e.target).parentElement;
        var personNumber = cell.cellIndex - 1;
        dlog('deleting person' + personNumber);
        if(this.nPeople() <= 1) {
            warn("Won't delete the last person.  Just change their name?");
            return;
        }
        var tbl = this.table_expenses;
        tblrow(tbl, 1).deleteCell(personNumber + 4);
        var nItems = this.nItems();
        for(var i = 0; i < nItems; ++i) {
            this.itemRow(i).deleteCell(personNumber + 4);
        }
        for(var t = 0; t < 3; ++t) {
            this.totRow(t).deleteCell(personNumber + 2);
        }
        tblrow(tbl, tbl.rows.length - 1).deleteCell(personNumber + 1);
        this.update_name_selectors(personNumber);
        this.update_enjoyed_by();
        this.update_all();
    };
    EnjoyedBy.prototype.a = function (row, s) {
        var _this = this;
        var ie = addcell(row, s);
        ie.onchange = function (e) {
            return _this.changed_element(e);
        };
        return ie;
    };
    EnjoyedBy.prototype.add_item = function () {
        var tbl = this.table_expenses;
        var old_nItems = this.nItems();
        var row = tbl.insertRow(2 + old_nItems);
        var itemNumber = (old_nItems + 1).toString();
        var count = 0;
        this.a(row, "<input class='item-td' placeholder='item" + itemNumber + "'/>");
        this.a(row, "<input class='amount-td' placeholder='e.g. 1.00'/>").parentElement;
        this.a(row, "<input class='currency-td' placeholder='e.g. GBP'/>");
        this.a(row, this.select_html);
        var nPeople = this.nPeople();
        for(var p = 0; p < nPeople; ++p) {
            this.a(row, "<input class='prop-td' value='1'/>");
        }
        var b = addcell(row, '<button id="button_del_item">x</button>');
        this.add_del_handlers(b, false);
        (this.itemRow(old_nItems).cells[0].firstChild).focus();
        this.update_all();
    };
    EnjoyedBy.prototype.del_item = function (e) {
        this.clear_timeouts();
        var row = ((e.target).parentElement.parentElement);
        this.table_expenses.deleteRow(row.rowIndex);
        this.update_all();
    };
    return EnjoyedBy;
})();
window.onload = function () {
    var eb = new EnjoyedBy();
};