//VARIABLES
let dd = {"dd":"", "key":"", "value":""};
let pole = [];
let current_index = -1;

//SLIDER VARIABLES
let tahoun_pressed, slider_values;
let slider_datalist_loaded, slider_length;
let slider_data, slider_field, slider_range, slider_knob;

//CALENDAR VARIABLES
const calendar_months = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
						
let calendar_field, calendar_default, calendar_parent, calendar_arrow;
let calendar_year, calendar_month, calendar_days, calendar_day, calendar_first;

//AJAX
function ajicek2(args){
	const xhttp = new XMLHttpRequest();

	xhttp.onload = function() {
		args.success(JSON.parse(xhttp.responseText));
	}; 
	
	xhttp.open("GET", "/lexlector/ajicek.php?args="+ args.ajicek);
	xhttp.send();
}

//COMMON
function cstr(word){
	return word.replace(/[^a-z0-9ěščřžýáíéúůňťďó. ]/gi, '');
}

function id(node){
	return document.getElementById(node);
}

function cls(cls_name){
	return document.getElementsByClassName(cls_name);
}

function is_number(value) {
	return typeof value === 'number';
}

function cfloat(number){
	if (is_number(number)) return number;
	
	number = number.replace(",", ".");
	number = number.replace(/[^\d.-]/g, "");
	
	number = parseFloat(number);
	
	return number;
}

function del_el(el){
	const parent = el.parentNode;
	parent.removeChild(el);
}

function add_class(el, class_name){
	if (!el) return false;
	
	let classes = el.className.split(" ");
	
	if (classes.includes(class_name) == false){
		classes.push(class_name);
	}
	
	el.className = classes.join(" ");
}

function remove_class(el, class_name){
	if (!el) return false;
	
	let classes = el.className.split(" ");
	
	if (classes.includes(class_name) == true){
		classes = classes.filter(function(cls){
			return cls != class_name;
		});
	}
	
	el.className = classes.join(" ");
}

function has_class(el, class_name){
	if (el.className == undefined) return false;
	let classes = el.className.split(" ");
	
	if (classes.includes(class_name) == true) return true;
	
	return false;
}

//DROPDOWN
function suggest_words(word, func){
	val = cstr(word.value);
	let obj = get_row_objects(word);
	
	evt = window.event;
	if ([38, 40].includes(evt.keyCode) && pole.length > 0) {
		if (evt.keyCode == 38) lower_current_index();
		if (evt.keyCode == 40) raise_current_index();
		
		pole[current_index].focus();
		
		evt.preventDefault();
		return false;
	}
	
	set_suggestion(word, '');
	
	if (val.length > 0){ 
		ajicek2({
			'ajicek': func +'/'+ val,
			'success': function(data){
				obj.suggest_box.innerHTML = data.data;
				obj = get_row_objects(word);
				remove_class(obj.suggest_box, "hidden");
				remove_class(obj.arrow, "hidden");
				pole = obj.options;
				current_index = -1;
				
				//register arrow navigation
				for (let n = 0; n < pole.length; n++){
					pole[n].onkeydown = function(evt) {
						evt = evt || window.event;
						
						if([13, 32, 38, 40].includes(evt.keyCode)){
							 
							if (evt.keyCode == 38) lower_current_index();
							if (evt.keyCode == 40) raise_current_index();
							
							if ([13, 32].includes(evt.keyCode)) {
								set_suggestion(pole[n], pole[n].dataset.value, pole[n].innerHTML);
								hide_suggestion_box();
								return false;
							}
							
							pole[current_index].focus();
							
							evt.preventDefault();
						}
					};
					
					pole[n].onclick = function(){
						set_suggestion(pole[n], pole[n].dataset.value, pole[n].innerHTML);
					}
				}
				//
			}
		});
	}
}

function set_dd(node){
	const obj = get_row_objects(node);
	
	if (obj.field.value.trim() != "") { //save default values globally
		dd.dd = obj.name;
		dd.key = obj.data.value;
		dd.value = obj.field.value;
	}
}

function reset_dd(){
	if (dd.dd != "" && id("field_"+ dd.dd).value == dd.value){
		id("data_"+ dd.dd).value = dd.key;
		id("data_"+ dd.dd).dispatchEvent(new Event('change'));
	}
	
	dd.dd = "";
	dd.key = "";
	dd.value = "";
}

function set_suggestion(node, key, val){
	const obj = get_row_objects(node);
	
	obj.data.value = key;
	obj.data.dispatchEvent(new Event('change'));
	
	if (val != undefined) {
		if (key == "+") val = val.substring(8);
		
		obj.field.value = val;
		hide_suggestion_box();
	}
	
	return false;
}

function hide_suggestion_box(shut){
	let boxes = cls("suggest_box");
	
	for (let i = 0; i < boxes.length; i++){
		const obj = get_row_objects(boxes[i]);
		
		if (has_class(obj.row, "row_dd")) {
			if (shut != undefined && boxes[i] == shut.parentNode.getElementsByClassName("suggest_box")[0]) set_dd(shut);
			if (obj.data.value == '') obj.field.value = '';
			add_class(obj.suggest_box, "hidden");
			add_class(obj.arrow, "hidden");
			boxes[i].innerHTML = '';
		} else if (has_class(obj.row, "row_select")) {
			add_class(boxes[i], "hidden");
			remove_class(obj.arrow, "up");
			add_class(obj.arrow, "down");
			obj.arrow.title = "Otevřít nabídku";
		}
	}
	
	clear_element(calendar_parent);
	add_class(calendar_arrow, "hidden");
	add_class(calendar_parent, "hidden");
	
	current_index = -1;
	pole = [];
}

//SELECT
function select_keydown() {
	evt = window.event;
	
	if([13, 32, 38, 40].includes(evt.keyCode)){
		 
		if (evt.keyCode == 38) lower_current_index();
		if (evt.keyCode == 40) raise_current_index();
		
		pole[current_index].focus();
		
		evt.preventDefault();
	}
}

function select_focus(select_field){
	hide_suggestion_box();
	
	const obj = get_row_objects(select_field);
	
	remove_class(obj.suggest_box, "hidden");
	
	remove_class(obj.arrow, "down");
	add_class(obj.arrow, "up");
	obj.arrow.title = "Zavřít nabídku";
	
	pole = obj.options;
	
	for (let n = 0; n < pole.length; n++){
		pole[n].onkeydown = function(evt) {
			evt = evt || window.event;
			
			if([13, 32, 38, 40].includes(evt.keyCode)){
				 
				if (evt.keyCode == 38) lower_current_index();
				if (evt.keyCode == 40) raise_current_index();
				
				if ([13, 32].includes(evt.keyCode)) {
					obj.data.value = pole[current_index].dataset.value;
					obj.data.dispatchEvent(new Event('change'));
					set_select(current_index, obj.field.id);
					hide_suggestion_box();
					return false;
				}
				
				pole[current_index].focus();
				
				evt.preventDefault();
			}
		};
		
		pole[n].onclick = function(){
			obj.data.value = pole[n].dataset.value;
			obj.data.dispatchEvent(new Event('change'));
			set_select(n, obj.field.id);
			hide_suggestion_box();
		}
	}
}

function set_select(index, field){
	let value = pole[index].innerHTML;
	remove_class(id(field), "empty_select");
	
	if (index == 0 && value == "&nbsp;") {
		value = "Vyberte možnost";
		add_class(id(field), "empty_select");
	}
	
	id(field).innerHTML = value;
	
	return false;
}

function raise_current_index(){
	if (current_index < (pole.length - 1)) current_index++;
	
	return false;
}

function lower_current_index(){
	if (current_index == -1) current_index = 0;
	if (current_index > 0) current_index--;
	
	return false;
}

//ROW
function get_row_objects(el){		
	let row = el;
	while (has_class(row, "row") == false) row = row.parentNode;
	
	const name = row.id.substring(4);
	const options = row.getElementsByTagName("li");
	const suggest_box = row.getElementsByClassName("suggest_box")[0];
	const field = id("field_"+ name);
	const data = id("data_"+ name);
	const arrow = row.getElementsByClassName("hide_suggest_box")[0];
	
	return {"row":row, "name":name, "options":options, "suggest_box":suggest_box, "field":field, "data":data, "arrow":arrow};
}

function set_value(name, val){
	
}

//SWITCH
function switch_change(el){
	hide_suggestion_box();
	
	let row = el;
	while (has_class(row, "row") == false) row = row.parentNode;
	
	const name = row.id.substring(4);
	const data = id("data_"+ name);
	
	evt = window.event;
	
	if([37, 40].includes(evt.keyCode)){
		switch_off(name);
		evt.preventDefault();
	} else if ([39, 38].includes(evt.keyCode)) {
		switch_on(name);
		evt.preventDefault();
	} else if ([13, 32].includes(evt.keyCode) || evt.type == "click") {
		if (data.value == 'N') switch_on(name);
		else switch_off(name);
		
		evt.preventDefault();
	}
	
	return false;
}

function switch_off(name){
	const data = id("data_"+ name);
	const field = id("field_"+ name);
	
	data.value = 'N';
	data.dispatchEvent(new Event('change'));
	add_class(field, "switch_off");
	remove_class(field, "switch_on");
}

function switch_on(name){
	const data = id("data_"+ name);
	const field = id("field_"+ name);
	
	data.value = 'Y';
	data.dispatchEvent(new Event('change'));
	add_class(field, "switch_on");
	remove_class(field, "switch_off");
}

//SLIDER
function datalist_slider(name){
	if (slider_datalist_loaded == name) return false;
	slider_datalist_loaded = name;
	
	const datalist = id("datalist_"+ name).getElementsByTagName("option");
	//Set slider variables
	slider_length = datalist.length;
	slider_values = [];
	slider_data = id("data_"+ name);
	slider_field = id("field_"+ name);
	slider_range = id("range_"+ name);
	slider_knob = id("knob_"+ name);							
	
	for (let i = 0; i < slider_length; i++){
		slider_values[i] = cfloat(datalist[i].value);
	}
}

function slider_closest_index(val){
	val = cfloat(val);
	
	let ret = -1;
	
	for (let i = 0; i <= slider_length; i++){
		if (val <= slider_values[i]){
			if (slider_values[i] - val < val - slider_values[i - 1] || !i) ret = i;
			else ret = i - 1;
			
			break;
		}
	}
	if (ret == -1) ret = slider_length - 1;
	
	return ret;
}

function get_slider_percentage(percentage){
	percentage = cfloat(percentage);
	
	const step = 100 / (slider_length - 1);
	const slider_index = slider_closest_index(get_slider_field(percentage));
	slider_data.value = slider_values[slider_index];
	slider_data.dispatchEvent(new Event('change'));
	return Math.round(step * slider_index * 100)/100;
}

function get_slider_field(percentage){
	percentage = cfloat(percentage);
	
	const steps = 100 / (slider_length - 1);
	const index = Math.round(percentage / steps);
	
	return slider_values[index];
}

function slider_set_index(index){
	slider_range.style.width = slider_knob.style.left = Math.round((100 / (slider_length - 1)) * index * 100)/100 +'%';
	slider_field.value = slider_data.value = slider_values[index];
	slider_data.dispatchEvent(new Event('change'));
}

function slider_step_minus(){
	let index = slider_values.indexOf(cfloat(slider_data.value)) - 1;
	if (index < 0) index = 0;
	
	slider_set_index(index);
	
	/*slider_range.style.width = slider_knob.style.left = Math.round((100 / (slider_length - 1)) * index * 100)/100 +'%';
	slider_field.value = slider_data.value = slider_values[index];
	slider_data.dispatchEvent(new Event('change'));*/
}

function slider_step_plus(){
	let index = slider_values.indexOf(cfloat(slider_data.value)) + 1;
	if (index > (slider_length - 1)) index = slider_length - 1;
	
	slider_set_index(index);
	
	/*slider_range.style.width = slider_knob.style.left = Math.round((100 / (slider_length - 1)) * index * 100)/100 +'%';
	slider_field.value = slider_data.value = slider_values[index];
	slider_data.dispatchEvent(new Event('change'));*/
}

//DATE
function fill_calendar_date(cz_date){
	let calendar_datum;
	if ((cz_date.match(/[.]/g) || []).length == 2) {
		const date_parts = cz_date.split(".");
		calendar_datum = new Date(parseInt(date_parts[2]), (parseInt(date_parts[1]) - 1), parseInt(date_parts[0]));
	} else {
		calendar_datum = new Date();
	}
	
	calendar_year = calendar_datum.getFullYear();
	calendar_month = calendar_datum.getMonth();
	calendar_days = new Date(calendar_year, calendar_month + 1, 0).getDate();
	calendar_day = calendar_datum.getDate();
	calendar_first = new Date(calendar_year, calendar_month, 1).getDay() - 1;
	if (calendar_first == -1) calendar_first = 6;
}

function set_calendar(){
	const row = calendar_field.parentNode;
	
	const elements = row.getElementsByTagName('a');
	const elements_count = elements.length;
	
	for (let n = 0; n < elements_count; n++) elements[n].addEventListener("click", function(evt){
		evt.preventDefault();
		
		if (has_class(elements[n], "calendar_year_down")) calendar_year_down();
		else if (has_class(elements[n], "calendar_year_up")) calendar_year_up();
		else if (has_class(elements[n], "calendar_month_down")) calendar_month_down();
		else if (has_class(elements[n], "calendar_month_up")) calendar_month_up();
		else set_calendar_date(evt.target.text);

		return false;
	});
}

function calendar_month_up(){
	calendar_month++;
	
	if (calendar_month > 11) {
		calendar_month = 0;
		calendar_year++;
	}
	
	fill_calendar_date('1.'+ (calendar_month + 1) +'.'+ calendar_year);
	
	build_calendar();
}

function calendar_month_down(){
	calendar_month--;
	
	if (calendar_month < 0) {
		calendar_month = 11;
		calendar_year--;
	}
	
	fill_calendar_date('1.'+ (calendar_month + 1) +'.'+ calendar_year);
	
	build_calendar();
}

function calendar_year_up(){
	calendar_year++;
	
	fill_calendar_date('1.'+ (calendar_month + 1) +'.'+ calendar_year);
	
	build_calendar();
}

function calendar_year_down(){
	calendar_year--;
	
	fill_calendar_date('1.'+ (calendar_month + 1) +'.'+ calendar_year);
	
	build_calendar();
}

function build_calendar(){
	clear_element(calendar_parent);
	remove_class(calendar_parent, "hidden");
	let day_iteration = 0 - calendar_first;

	let calendar_html = '';
	let selected_class;
	
	//Build YEAR
	calendar_html += '<div class="calendar_year"><a href="#" class="calendar_navigation color_white calendar_year_down" title="Posunout o rok zpět">&laquo;</a><div>'+ calendar_year +'</div><a href="#" class="calendar_navigation color_white calendar_year_up" title="Posunout o rok dopředu">&raquo;</a></div>';
	
	//Build MONTH
	calendar_html += '<div class="calendar_month"><a href="#" class="calendar_navigation color_black calendar_month_down" title="Posunout o měsíc zpět">&laquo;</a><div>'+ calendar_months[calendar_month] +'</div><a href="#" class="calendar_navigation color_black calendar_month_up" title="Posunout o měsíc dopředu">&raquo;</a></div>';
	
	//Build HEAD
	calendar_html += '<div class="calendar_parent"><div class="calendar_table"><div class="calendar_head"><div class="calendar_row"><div class="calendar_cell">Po</div><div class="calendar_cell">Út</div><div class="calendar_cell">St</div><div class="calendar_cell">Čt</div><div class="calendar_cell">Pá</div><div class="calendar_cell">So</div><div class="calendar_cell">Ne</div></div></div>';

	//Build BODY
	calendar_html += '<div class="calendar_body">';
	const weeks = Math.ceil((calendar_first + calendar_days)/7);

	for (let week = 0; week < weeks; week++){
		calendar_html += '<div class="calendar_row">';
		
		for (let day = 0; day < 7; day++) {
			selected_class = '';
			
			calendar_html += '<div>';
			if (calendar_year == calendar_default[0] && calendar_month == calendar_default[1] && (day_iteration + 1) == calendar_default[2]) selected_class = ' class="selected"';
			if (day_iteration >= 0 && day_iteration < calendar_days) calendar_html += '<a href="#"'+ selected_class +'>'+ (day_iteration + 1) +'</a>';
			calendar_html += '</div>';
			day_iteration++;
		}
		
		calendar_html += '</div>';
	}
	calendar_html += '</div></div></div>';
	
	calendar_parent.innerHTML = calendar_html;
	let calendar_script = document.createElement("script");
	calendar_script.id = 'script_inner_'+ calendar_field.name;
	calendar_script.innerHTML = 'set_calendar(); del_el(id("script_inner_'+ calendar_field.name +'"));';
	calendar_parent.appendChild(calendar_script);
}

function clear_element(el){
	if (!el) return false;
	
	while (el.firstChild) {
		el.removeChild(el.lastChild);
	}
}

function set_calendar_date(day){
	calendar_field.value = day.padStart(2, "0") +'.'+ String(calendar_month + 1).padStart(2, "0") +'.'+ calendar_year;
	clear_element(calendar_parent);	
	add_class(calendar_parent, "hidden");	
	hide_suggestion_box();
}

function verify_date(el){
	el.value = el.value.replace(/[^0-9.]/g, '');
	const date = el.value;
	
	if ((date.match(/[.]/g) || []).length == 2) {
		const date_parts = date.split(".");
		const verified_date = new Date(parseInt(date_parts[2]), (parseInt(date_parts[1]) - 1), parseInt(date_parts[0]));

		if (verified_date != 'Invalid Date' && date_parts[2].length == 4){
			fill_calendar_date(el.value);
			calendar_default = [calendar_year, calendar_month, calendar_day];
			build_calendar();
		}
	}
}

function calendar_out(el){
	const date = el.value;
	let ret = "";
	
	if ((date.match(/[.]/g) || []).length == 2) {
		const date_parts = date.split(".");
		const verified_date = new Date(parseInt(date_parts[2]), (parseInt(date_parts[1]) - 1), parseInt(date_parts[0]));

		if (verified_date != 'Invalid Date' && date_parts[2].length == 4){
			ret = String(verified_date.getDate()).padStart(2, "0") +'.'+ String(verified_date.getMonth() + 1).padStart(2, "0") +'.'+ String(verified_date.getFullYear());
		}
	}
		
	el.value = ret;
}

function set_field(name, val){
	const row = id('row_'+ name);
	
	if (has_class(row, 'row_input')){
		id('data_'+ name).value = val;
	} else if (has_class(row, 'row_dd')){
		ajicek2({
			'ajicek': id('data_'+ name).dataset.dd +'/dd_value/'+ val,
			'success': function(data){
				const result = data.data;
				const index = result.match(/data-value="(.*?)"/);
				
				if (index[1] != ""){
					id('field_'+ name).value = result.replace(/(<([^>]+)>)/gi, "");;
					id('data_'+ name).value = index[1];
				}
			}
		});
	} else if (has_class(row, 'row_switch')){
		if (val == 'Y') switch_on(name);
		else if (val == 'N') switch_off(name);
	} else if (has_class(row, 'row_slider')){
		datalist_slider(name);
		const index = slider_closest_index(val);
		
		if (index != -1) slider_set_index(index);
	} else if (has_class(row, 'row_date')){
		const date = verify_date(val, 'cz');
		if (date != "") id(name).value = date;
	} else if (has_class(row, 'row_info')){
		id('field_'+ name).innerHTML = val;
	}
}

function get_field(name){
	const row = id('row_'+ name);
	let ret = '';
	
	if (has_class(row, 'row_input')
		|| has_class(row, 'row_dd')
		|| has_class(row, 'row_switch')
		|| has_class(row, 'row_slider')
	){
		ret = id('data_'+ name).value;
	} else if (has_class(row, 'row_date')) {
		ret = verify_date(id(name).value);
	}
	
	return ret;
}

function verify_date(date, format){
	let ret = "";
	if (format == undefined) format = 'db';
	let verified_date = false;
	
	if ((date.match(/[.]/g) || []).length == 2) {
		const date_parts = date.split(".");
		verified_date = new Date(parseInt(date_parts[2]), (parseInt(date_parts[1]) - 1), parseInt(date_parts[0]));
	} else if ((date.match(/[-]/g) || []).length == 2) {
		const date_parts = date.split("-");
		verified_date = new Date(parseInt(date_parts[0]), (parseInt(date_parts[1]) - 1), parseInt(date_parts[2]));
	}
	
	if (verified_date != 'Invalid Date' && verified_date != false){
		if (format == 'db') ret = String(verified_date.getFullYear()) +'-'+ String(verified_date.getMonth() + 1).padStart(2, "0") +'-'+ String(verified_date.getDate()).padStart(2, "0");
		if (format == 'cz') ret = String(verified_date.getDate()).padStart(2, "0") +'.'+ String(verified_date.getMonth() + 1).padStart(2, "0") +'.'+ String(verified_date.getFullYear());
	}
	
	return ret;
}

function slider_init(name){
	id("knob_"+ name).addEventListener("pointerdown", function(evt){
		tahoun_pressed = true;
		datalist_slider(""+ name);
		
		const move = function(evt) {
			let pozice = slider_knob.offsetLeft + evt.movementX + 10;
			let sirka100 = slider_knob.parentNode.offsetWidth - 2;
			if (pozice < 0) pozice = 0;
			if (pozice > sirka100) pozice = sirka100;

			let offset = Math.round((pozice / sirka100) * 10000)/100;
			slider_range.style.width = slider_knob.style.left = offset +"%";
			slider_field.value = get_slider_field(offset);
			
			evt.preventDefault();
		};
		
		const unregister = function() {
			tahoun_pressed = false;
			
			slider_range.style.width = slider_knob.style.left = get_slider_percentage(slider_knob.style.left) +"%";
			removeEventListener("pointermove", move);
			removeEventListener("pointerup", unregister);
		};
		
		addEventListener("pointermove", move);
		addEventListener("pointerup", unregister);
		
		evt.preventDefault();
	});

	id("knob_"+ name).parentNode.addEventListener("pointerdown", function(evt){
		hide_suggestion_box();
		datalist_slider(""+ name);
		
		let is_pressed = true;
		const knob_boundaries = slider_knob.getBoundingClientRect();
		const knob_middle = (knob_boundaries.right + knob_boundaries.left)/2;
		
		function pressed_slide(){
			if (tahoun_pressed == true) return false;
			
			if (is_pressed == true){
				const slider_position = slider_knob.getBoundingClientRect();
				if (evt.clientX < slider_position.left && evt.clientX < knob_middle) slider_step_minus();
				else if (evt.clientX > slider_position.right && evt.clientX > knob_middle) slider_step_plus();
				
				timeout = setTimeout(pressed_slide, 50);
			}
		}
		
		addEventListener("pointerup", function(){is_pressed = false;});
		
		pressed_slide();
	});

	id("knob_"+ name).addEventListener("focus", function(evt){hide_suggestion_box();datalist_slider(""+ name);});						
	id("knob_"+ name).addEventListener("keydown", function(evt){
		evt = evt || window.event;
		
		if([37, 40].includes(evt.keyCode)){
			slider_step_minus();
			evt.preventDefault();
		} else if ([39, 38].includes(evt.keyCode)) {
			slider_step_plus();
			evt.preventDefault();
		}
	});

	id("field_"+ name).addEventListener("focus", function(){hide_suggestion_box();datalist_slider(""+ name);});
	id("field_"+ name).addEventListener("change", function(){
		if (tahoun_pressed == true) return false;
		
		let index = slider_values.indexOf(slider_field.value);
		if (index == -1) index = slider_closest_index(slider_field.value);
		
		slider_data.value = slider_field.value = slider_values[index];
		slider_data.dispatchEvent(new Event("change"));
		slider_range.style.width = slider_knob.style.left = Math.round((100 / (slider_length - 1)) * 100)/100 * index +"%";
	});
}

function setTheme(mode) {
	const stylesheet = id("theme_stylesheet");
	const toggleBtn = id("theme_toggle");

	if (mode === "dark") {
		stylesheet.href = "css/style_dark.css";
		toggleBtn.textContent = "☀️";
		document.body.classList.remove("light-theme");
	} else {
		stylesheet.href = "css/style.css";
		toggleBtn.textContent = "🌙";
		document.body.classList.add("light-theme");
	}
	localStorage.setItem("theme", mode);
}

window.onload = function(){
	const menu = document.getElementsByTagName("nav")[0];
	const open_menu_btn = document.getElementById("open_menu_btn");
	const close_menu_btn = document.getElementById("close_menu_btn");
	
	open_menu_btn.addEventListener("click", function(){
		menu.classList.toggle("open");
		menu.style.transition = "transform 0.5s ease";
	});
	
	close_menu_btn.addEventListener("click", function(){
		menu.classList.toggle("open");
		menu.style.transition = "transform 0.5s ease";
	});
	
	menu.addEventListener("transitionend", function(){
		this.removeAttribute("style");
	});
	
	menu.querySelectorAll(".menu_dropdown > i").forEach((arrow) => {
		arrow.addEventListener("click", function(){
			this.closest(".menu_dropdown").classList.toggle("active");
		});
	});
	
	/*id("theme_toggle").addEventListener("click", () => {
		const isDark = document.body.classList.toggle("light-theme");
		document.getElementById("theme_toggle").textContent = isDark ? "☀️" : "🌙";
	});*/
	
	const savedTheme = localStorage.getItem("theme") || "light";
	setTheme(savedTheme);

	id("theme_toggle").addEventListener("click", () => {
		const currentTheme = localStorage.getItem("theme") === "dark" ? "light" : "dark";
		setTheme(currentTheme);
	});

	id("language_selector").addEventListener("change", (e) => {		
		window.location.replace("/lexlector/change_language/"+ e.target.value);
	});
}