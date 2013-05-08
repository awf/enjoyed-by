function assert(x) {
    if(x) {
        return;
    }
    throw 'assert failed';
}
function assertn(x) {
    assert(x != null);
}
function elt(id) {
    return document.getElementById(id);
}
function test_onload() {
    elt('test').innerHTML = '';
}
function findSelfOrParent(e, tag) {
    var p = e;
    for(; ; ) {
        if(p == null) {
            return p;
        }
        if(p.tagName == tag) {
            return p;
        }
        if(p.parentElement == p) {
            throw "zoiks";
        }
        p = p.parentElement;
    }
}
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
        this.dropdown_menu = elt('dropdown_menu');
        this.content = elt('content');
        this.newprop_1_html = elt('newprop-proto-1').outerHTML;
        this.newprop_0_html = elt('newprop-proto-0').outerHTML;
        this.newprop_frac_html = elt('newprop-proto-frac').outerHTML;
        this.make_select_html();
        this.dropdown_hide();
        button_add_item.onclick = function () {
            return _this.add_item();
        };
        button_add_person.onclick = function () {
            return _this.add_person();
        };
        var url_params = document.location.search;
        if(url_params == '') {
            if(0) {
                url_params = 'person0=Andrew&person1=Veggie&person2=Pioneer&' + 'item0=Beef&amt0=10&cur0=GBP&payer0=Andrew&prop0_0=1&prop0_1=0&prop0_2=1&' + 'item1=Wine&amt1=14&cur1=GBP&payer1=Andrew&prop1_0=1&prop1_1=1&prop1_2=0&' + 'item2=Nuts&amt2=6&cur2=GBP&payer2=Veggie&prop2_0=0.5&prop2_1=1&prop2_2=1&done=1';
            } else {
                this.add_person();
                this.add_person();
                this.add_person();
                this.add_item();
            }
        }
        if(url_params != '') {
            var qs = url_params.split("+").join(" ");
            var params = {
            };
            var re = /[?&]?([^=]+)=([^&]*)/g;
            var matches;
            while(matches = re.exec(qs)) {
                params[decodeURIComponent(matches[1])] = decodeURIComponent(matches[2]);
            }
            var nPeople = 0;
            var person;
            var people2id = {
            };
            while((person = params['person' + nPeople]) != undefined) {
                people2id[person] = nPeople;
                this.add_person();
                (this.itemCell(-1, nPeople).firstChild).value = person;
                ++nPeople;
            }
            this.make_select_html();
            var nItems = 0;
            var item;
            while((item = params['item' + nItems]) != undefined) {
                var i = nItems++;
                this.add_item();
                (this.itemCell(i, -4).firstChild).value = item;
                (this.itemCell(i, -3).firstChild).value = params['amt' + i];
                (this.itemCell(i, -2).firstChild).value = params['cur' + i];
                (this.itemCell(i, -1).firstChild).selectedIndex = people2id[params['payer' + i]];
                for(var c = 0; c < nPeople; ++c) {
                    var td = this.itemCell(i, c);
                    var propval = params['prop' + i + '_' + c];
                    if(propval == 1) {
                        td.innerHTML = this.newprop_1_html;
                    } else if(propval == 0) {
                        td.innerHTML = this.newprop_0_html;
                    } else {
                        td.innerHTML = this.newprop_frac_html;
                        (td.firstChild).value = propval;
                    }
                    this.set_proportion_handlers(td);
                }
            }
        }
        this.update_all();
    }
    EnjoyedBy.prototype.set_change_handler = function (he, will_change_people_names) {
        if (typeof will_change_people_names === "undefined") { will_change_people_names = false; }
        var _this = this;
        he.onchange = function (e) {
            return _this.changed_element(e, will_change_people_names);
        };
    };
    EnjoyedBy.prototype.set_proportion_handlers = function (td) {
        var _this = this;
        td.onclick = function (e) {
            return _this.propClick(e);
        };
        (td.firstChild).onchange = function (e) {
            return _this.changed_element(e, false);
        };
    };
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
    EnjoyedBy.prototype.totCellIndex = function (i, p) {
        return p + 2;
    };
    EnjoyedBy.prototype.totCell = function (i, p) {
        return tblcell(this.table_expenses, 2 + this.nItems() + i, this.totCellIndex(i, p));
    };
    EnjoyedBy.prototype.make_select_html = function () {
        var nPeople = this.nPeople();
        this.select_html = '<select class="payer-select">';
        for(var c = 0; c < nPeople; ++c) {
            var person = (tblcell(this.table_expenses, 1, 4 + c).firstChild).value;
            this.select_html += "<option>" + person + "</option>";
        }
        this.select_html += '</select>';
    };
    EnjoyedBy.prototype.dropdown_hide = function () {
        this.dropdown_menu.style.left = "" + 0 + "px";
        this.dropdown_menu.style.top = "" + 0 + "px";
        this.dropdown_menu.style.display = 'none';
    };
    EnjoyedBy.prototype.update_all = function () {
        var tbl = this.table_expenses;
        var row1 = tblrow(tbl, 1);
        var nPeople = this.nPeople();
        this.save_string = '';
        var people = {
        };
        for(var c = 0; c < nPeople; ++c) {
            var cell = tblcell(tbl, 1, c + 4);
            var input = cell.firstChild;
            people[input.value] = c + 1;
            this.save_string += "person" + c + "=" + encodeURIComponent(input.value) + '&';
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
            this.save_string += "item" + item_ind + "=" + encodeURIComponent(item) + '&';
            var amount_ie = cel(1).firstChild;
            this.save_string += "amt" + item_ind + "=" + encodeURIComponent(amount_ie.value) + '&';
            var amount = -1;
            if(amount_ie.value != '') {
                amount = parseFloat(amount_ie.value);
            } else {
                amount = 0;
            }
            if(amount >= 0) {
                amount_ie.className = 'amount-td';
                amounts[item_ind] = amount;
                amount_ie.value = amount.toFixed(2);
            } else {
                amount_ie.className = 'amount-td-inval';
                all_valid = false;
            }
            var cur = (cel(2).firstChild).value;
            this.save_string += "cur" + item_ind + "=" + encodeURIComponent(cur) + '&';
            currencies[item_ind] = cur;
            var payer_ie = cel(3).firstChild;
            var pid = people[payer_ie.value];
            if(!pid) {
                payer_ie.className = 'payer-select-inval';
                all_valid = false;
            } else {
                payer_ie.className = 'payer-select';
                payers[item_ind] = pid;
            }
            this.save_string += "payer" + item_ind + "=" + encodeURIComponent(payer_ie.value) + '&';
            for(var c = 0; c < nPeople; ++c) {
                var prop_cell = cel(4 + c);
                var prop_ie = prop_cell.firstChild;
                this.save_string += "prop" + item_ind + "_" + c + "=" + encodeURIComponent(prop_ie.value) + '&';
                var prop = parseFloat(prop_ie.value);
                if(prop >= 0) {
                    prop_cell.className = 'prop-td';
                    proportions[item_ind][c] = prop;
                } else {
                    prop_cell.className = 'prop-td-inval';
                    all_valid = false;
                }
            }
            elt('save_link').innerHTML = '<a href="' + document.URL.split('?')[0] + '?' + this.save_string + '">permalink</a>';
        }
        this.save_string += 'done=1';
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
        this.make_select_html();
        var nItems = this.nItems();
        for(var i = 0; i < nItems; ++i) {
            var paidby_select = this.itemCell(i, -1).firstChild;
            var last = paidby_select.selectedIndex;
            if(deletedPerson != -1) {
                if(last == deletedPerson) {
                    last = -1;
                } else if(last > deletedPerson) {
                    last -= 1;
                }
            }
            this.itemCell(i, -1).innerHTML = this.select_html;
            paidby_select = this.itemCell(i, -1).firstChild;
            paidby_select.selectedIndex = last;
            this.set_change_handler(paidby_select);
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
    EnjoyedBy.prototype.propClick = function (e) {
        var _this = this;
        var he = e.target;
        if(he.tagName == 'INPUT') {
            if((he).type == 'text') {
                return;
            }
        }
        var td = findSelfOrParent(he, 'TD');
        var rect = td.getBoundingClientRect();
        var nodeList = this.dropdown_menu.getElementsByTagName("a");
        for(var i = 0; i < nodeList.length; ++i) {
            (nodeList[i]).onclick = function (e) {
                return _this.propPopupClick(e, td);
            };
        }
        this.dropdown_menu.style.display = 'block';
        this.dropdown_menu.style.left = "" + (rect.left - 2) + "px";
        this.dropdown_menu.style.top = "" + (rect.top - 2) + "px";
        this.dropdown_menu.onclick = function (e) {
            return _this.propPopupClick(e, td);
        };
    };
    EnjoyedBy.prototype.propPopupClick = function (e, target_td) {
        var he = e.target;
        var td = findSelfOrParent(he, 'TD');
        if(td != null) {
            var nodeList = td.getElementsByTagName('INPUT');
            assert(nodeList.length == 1);
            var input = nodeList[0];
            assert(input.tagName == 'INPUT');
            target_td.innerHTML = input.outerHTML;
        }
        this.dropdown_hide();
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
        var tbl = this.table_expenses;
        var row1 = tblrow(tbl, 1);
        var old_nPeople = this.nPeople();
        var val = 'Person' + (old_nPeople + 1);
        var ie = addcell(row1, '<input class="person-td" type="text" value="' + val + '"/>', old_nPeople + 4);
        this.set_change_handler(ie, true);
        var nItems = this.nItems();
        for(var i = 0; i < nItems; ++i) {
            var ie = addcell(this.itemRow(i), this.newprop_1_html, old_nPeople + 4);
            this.set_proportion_handlers(ie.parentElement);
        }
        for(var t = 0; t < 3; ++t) {
            addcell(this.totRow(t), 'tot', this.totCellIndex(t, old_nPeople));
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
            this.totRow(t).deleteCell(this.totCellIndex(t, personNumber));
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
        this.a(row, "<input class='amount-td' placeholder='0.00'/>");
        this.a(row, "<input class='currency-td' placeholder='ECU'/>");
        this.a(row, this.select_html);
        var nPeople = this.nPeople();
        for(var p = 0; p < nPeople; ++p) {
            var ie = this.a(row, this.newprop_1_html);
            this.set_proportion_handlers(ie.parentElement);
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
    var test = elt('test');
    if(test) {
        test.innerHTML = '';
    }
    var eb = new EnjoyedBy();
};
