var config = {};
var trad = {};
var activeRules = [];
var selectedValues = [];
jQuery.ajaxSetup({cache: false});
var simulateClick = false;

site_path = getSiteUrl()+"/";
path="https://www.rintal.com/"+"wp-content/themes/rintal/configuratore/";

jQuery(document)
    .ready(
    function (jQuery) {
		
		$('.action-btn').tooltipster({
			multiple:true
		});
		
		/*$('#share2-btn').socialShare({
	    	social: 'facebook,linkedin,twitter,pinterest'
		});*/

		$('#share-btn').click(function(e){
        	var model = jQuery('#model-id').val();
			var images = [];
            var imagesList = jQuery('.img-model');
            jQuery.each(imagesList, function (i, img) {
                images.push(jQuery(img).attr('src'));
            });	
        	jQuery.ajax({
            	url: path+"ajax.php",
                dataType: 'json',
				jsonp:false,
                type: 'POST',
				crossDomain:true,
                data: {
                    action: 'preventivo',
                    values: jQuery('#parts').html(),
                    model: model,
					images: images
                },
                beforeSend: function () {
                    jQuery('.ok').hide();
                    jQuery('.ko').hide();
                    jQuery('.mini-loader').show();
                },
                success: function (response) {
                    if (response.error == "") {
						//jQuery('meta[property=og\\:image]').attr('content', response.image);
						jQuery('#share2-btn').socialShare({
					    	social: 'facebookfeed,linkedin,twitter,pinterest',
							shareUrl: site_path + 'configuratore/?model='+model+'&preventivo='+ response.preventivo,
							appId : '495707427267166',
							picture: path + "preventivi/"+response.preventivo+".png",
							descriptionFacebook: $('#descrizioneFacebook').val(),
							descriptionTwitter: $('#descrizioneTwitter').val(),
							caption: 'www.rintal.com',
							redirectUri: 'http://www.rintal.com'
						});
						jQuery('#share2-btn').trigger('click');
						
						var soc = $('.arthrefSocialShare .centered').html();
						var socTitle = '<div style="color:#ffffff; font-size:22px; text-align:center; font-family:Museo-300">'+$('#socTitle').val();+'</div>';
						jQuery('.arthrefSocialShare .centered').html(socTitle+soc);
						
						jQuery('.mini-loader').hide();
					}
                }
            });
            e.preventDefault();
		});
		
		
		// LOAD LANG FILE
        var lang = jQuery('#lang').val();
        
        /*
        // Sotto commentato per far funzionare le variabili in italiano
        if(lang != 'it')
        {
        	jQuery.ajax({
            	url: path + "languages/"+lang+".json",
                dataType: 'jsonp',
				jsonpCallback: "j",
				crossDomain:true,
                type: 'GET',
                success: function (data) {
            		trad = data;
				}
			});
        }
        */
        
        //if(lang != 'it')
        //{
        	jQuery.ajax({
            	url: path + "languages/"+lang+".json",
                dataType: 'jsonp',
				jsonpCallback: "j",
				crossDomain:true,
                type: 'GET',
                success: function (data) {
            		trad = data;
				}
			});

        //}

        // LOAD CONFIG FILE
        var model = jQuery('#model-id').val();
		
    	jQuery.ajax({
        	url: path + "models/" + model + "/config.json",
            dataType: 'jsonp',
			jsonpCallback: "json",
			crossDomain:true,
            type: 'GET',
            success: function (data) {
	            config = data;

	            // Print all parts only if there are no saves
	            var mode;
	            var partsHTML = jQuery("#parts");
	            if (partsHTML.children().length == 0) {
	                jQuery.each(config.parts, function (part) {
	                    mode = 'complete';
	                    partsHTML.append(printLayoutPart(part, mode));
	                });
	                simulateClick = true;
	            }

	            // SIDEBAR ACCORDION
	            partsHTML.accordion({
	                heightStyle: 'content'
	            });

	            // SIMULATE FIRST CLICK
	            if (simulateClick) {
	                var firstOpt = jQuery(jQuery('.opt').get(0));
	                if (firstOpt.prop('tagName') == 'OPTION') {
	                    firstOpt.trigger('change');
	                }
	                else {
	                    firstOpt.trigger('click');
	                }
					simulateClick = false;
	            }
	            else {
	                var values = getValues();

	                editCanvas(values);
	            }
				$('a.opt').tooltipster({
					multiple:true
				});
        		
			}
		});

        // MAIN LOADER
        jQuery("#loader").delay(500).fadeOut("slow");
        jQuery("#mask").delay(1000).fadeOut("slow");


        // CLICK ON AN OPTION
        jQuery(document).on('change', '#sidebar .child select', function (e) {
            var currentOption = jQuery(this).find('option:selected');
            chooseOption(currentOption);
        });

        jQuery(document).on('click', '.opt:not(option)', function (e) {
            if (jQuery(this).prop("tagName") != 'OPTION') {
                // Prevent default if option is a link
                if (jQuery(this).is('a')) {
                    e.preventDefault();
                }
                var currentOption = jQuery(this);

                chooseOption(currentOption);
            }
        });

        // TOGGLE SIDEBAR
        jQuery('#other-models-button').click(function (e) {
            e.preventDefault();
            jQuery('.sidebar-at-right').toggleClass('use-sidebar');
        });

        // CLICK ON ACTION BUTTON
        jQuery('.action-btn').click(function (e) {
            var button = jQuery(this).attr('id');
            var model = jQuery('#model-id').val();
            var images = [];
            var values = [];
            var send = 1;
            var action;
            var imagesList = [];
			var savefilename = "";
			var print_line = jQuery('#print-line').val();
            switch (button) {
                case 'photo-btn':
                    action = 'take-photo';
                    imagesList = jQuery('.img-model');
                    jQuery.each(imagesList, function (i, img) {
                        images.push(jQuery(img).attr('src'));
                    });					
                    e.preventDefault();
                    break;
                case 'print-btn':
                    action = 'print';
                    values = getPrintValues();
                    imagesList = jQuery('.img-model');
                    jQuery.each(imagesList, function (i, img) {
                        images.push(jQuery(img).attr('src'));
                    });
                    e.preventDefault();
					var sup = {};
					sup.modelloLabel = jQuery('#modelloLabel').val();
					sup.dateLabel = jQuery('#dateLabel').val();
                    break;
                case 'save-btn':
                    action = 'save';
                    values = jQuery('#parts').html();
					savefilename = $('#savefilename').val();
                    e.preventDefault();
                    break;
                case 'restart-btn':
                    action = 'restart';
					savefilename = $('#savefilename').val();
                    e.preventDefault();
                    break;
                default:
                    send = 0;
                    break;
            }
            if (send) {
                if (button == 'print-btn') {					
                    var w = window.open(path+'pdftemp.php?msg='+encodeURI(translate('Creazione documento, attendere...')));
                }	
				
                jQuery.ajax({
                    url: path+"ajax.php",
                    dataType: 'json',
					jsonp:false,
					crossDomain:true,
                    async: false,
                    type: 'POST',
                    data: {
                        action: action,
                        values: values,
                        images: images,
                        model: model,
						savefilename: savefilename,
						print_line: print_line,
						sup: sup
                    },
                    beforeSend: function () {
                        jQuery('.ok').hide();
                        jQuery('.ko').hide();
                        jQuery('.mini-loader').show();
                    },
                    success: function (response) {
                        if (response.error == "") {
                            switch (button) {
                                case 'photo-btn':
                                    location.href = path+'ajax.php?action=download&urlPhoto=' + response.urlPhoto;
                                    jQuery('.mini-loader').hide();
                                    break;
                                case 'print-btn':
                                    w.location.href = response.url;
                                    jQuery('.mini-loader').hide();
                                    break;
                                case 'save-btn':
                                    jQuery('.mini-loader').hide();
                                    jQuery('.ok').show().fadeOut(2500, "linear");
                                    break;
                                case 'restart-btn':
                                    location.reload(); 
                                    break;
                            }
                        }
                        else {
                            jQuery('.mini-loader').hide();
                            jQuery('.ko').show().fadeOut(2500, "linear");
                        }
                    },
                    error: function () {
                        // TODO
                        jQuery('.mini-loader').hide();
                        jQuery('.ko').show().fadeOut(2500, "linear");
                    }
                });
            }
        });
        
        // CLICK ON PREVENTIVO BUTTON
        jQuery('#back-container .preventivo').click(function (e) {
        	var model = jQuery('#model-id').val();
			var url_contatti = jQuery(this).data('contatti');
			console.log(url_contatti);
            e.preventDefault();
        	jQuery.ajax({
                    url: path+"ajax.php",
                    dataType: 'json',
				jsonp:false,
					crossDomain:true,
                    type: 'POST',
                    data: {
                        action: 'preventivo',
                        values: jQuery('#parts').html(),
                        model: model
                    },
                    beforeSend: function () {
                        jQuery('.ok').hide();
                        jQuery('.ko').hide();
                        jQuery('.mini-loader').show();
                    },
                    success: function (response) {
                        if (response.error == "") {
                        	location.href = site_path+url_contatti+'/?azione=3&modello='+model+'&preventivo_url='+encodeURIComponent(site_path + 'configuratore/?model='+model+'&preventivo='+ response.preventivo);
                            jQuery('.mini-loader').hide();
                        }
                        else {
                            jQuery('.mini-loader').hide();
                            jQuery('.ko').show().fadeOut(2500, "linear");
                        }
                    },
                    error: function () {
                        // TODO
                        jQuery('.mini-loader').hide();
                        jQuery('.ko').show().fadeOut(2500, "linear");
                    }
                });
        	e.preventDefault();
        });

        // BACK
        /*$('#back-container .back').click(function(e){
            e.preventDefault();
            window.history.back();
        });*/


      $( "#combobox" ).combobox();
      $( "#toggle" ).on( "click", function() {
        $( "#combobox" ).toggle();
      });
		
    }
);

/* FUNCTIONS */

function translate(s){
	if(trad[s] != undefined){
		return trad[s];
	}
	else{
		return s;
	}
}

serialize = function(obj, prefix) {
  var str = [];
  for(var p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
      str.push(typeof v == "object" ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
}

// Get site url
function getSiteUrl() {
    return window.location.protocol + "//" + window.location.host;
}

function chooseOption(currentOption) {
	selectedValues = getValues();
    activeRules = [];

    var currentOptionPart = currentOption.closest('[data-part]').data('part');

    var parts = config.parts;
    var startHere = false;
    jQuery.each(parts, function (i, part) {
        var datapart = jQuery('[data-part=' + i + ']');

        // previous
        if (currentOptionPart != i && !startHere) {
            saveRules(datapart);
            return true;
        }

        // current
        if (currentOptionPart == i) {
            startHere = true;

            // Set value
            setValue(currentOption, i);
			
            // Create and save the rule
            saveRules(datapart);

            // Re-print variants and set default value
            var currentOptionChild = currentOption.closest('[data-child]');
            var currentOptionValue = currentOption.data('id');
            if (part.children[currentOptionChild.data('child')] != undefined) {
                if (_hasVariants(part.children[currentOptionChild.data('child')].options[currentOptionValue])) {
                    var first = part.children[currentOptionChild.data('child')].options[currentOptionValue].children;
                    var childTag = datapart.find('[data-child=' + currentOptionChild.data('child') + ']').find('[data-child=' + Object.keys(first)[0] + ']');
                    childTag[0].outerHTML = _printVariants(Object.keys(first)[0], first[Object.keys(first)[0]], i);
					saveRules(datapart);
                }
            }

            // Print next siblings
			jQuery.each(part.children, function(child_k, ch){
                var firstChildTag = datapart.find('[data-child=' + currentOptionChild.data('child') + ']');
				var fchild = currentOptionChild.data('child');
				
				if(firstChildTag.parents('.child').length)
				{
					fchild = firstChildTag.parents('.child').data('child');
				}
				
				if(child_k != fchild){
					var childTag = datapart.find('[data-child=' + child_k + ']');
					if(childTag.length){
						childTag[0].outerHTML = _printVariants(child_k, ch, i);
					}
					else{
						firstChildTag.parent().append(_printVariants(child_k, ch, i));
					}
					saveRules(datapart);
				}
			});
            
        }
		
        // next
        if (currentOptionPart != i && startHere) {
			datapart.prev().show();
           	// Re-print children and option based on rules and set the first value as default
           	datapart.html('');
           	jQuery.each(part.children, function (c, child) {
               	datapart.append(_printVariants(c, child, i));
               	saveRules(datapart);
           	});
        }
		if(!checkRules(part.rules)){
			datapart.prev().hide();
			datapart.hide();
		}
		
    });

    var values = getValues();
	$('a.opt').tooltipster({
		multiple:true
	});
    editCanvas(values);
	if(!simulateClick)
	{
		$('#save-btn').trigger("click");
		$('#restart-btn').show();
	}
	
}

function _createRuleStringAncestors(el, type) {
    var currentOptionPart = el.closest('[data-part]');
    var currentOptionChild = el.closest('[data-child]');
    var fatherChild = currentOptionChild.parent('[data-child]');
    var l = 'C';
    var father = "";
    var fatherValue = "";
    if (fatherChild.length) {
        if (type != "print") {
            jQuery.each(fatherChild.find('.opt'), function (i, opt) {
                if (isSelected(jQuery(opt))) {
                    fatherValue = "|O:" + jQuery(opt).data('id');
                    return false;
                }
            });
        }
        father = "|C:" + fatherChild.data('child');
        l = 'V';
    }
    return "P:" + currentOptionPart.data('part') + father + fatherValue + "|" + l + ":" + currentOptionChild.data('child');
}

// Create the rule string
function createRuleString(el) {
    var currentOptionValue = el.data('id');
    var rule = _createRuleStringAncestors(el, "") + "|O:" + currentOptionValue;
    return rule;
}

function saveRules(datapart) {
    var cc = datapart.find('.child');
    jQuery.each(cc, function (i, child) {
        jQuery.each(jQuery(child).find('.opt'), function (j, opt) {
            if (isSelected(jQuery(opt))) {
                var ruleString = createRuleString(jQuery(opt));
                if (jQuery.inArray(ruleString, activeRules) == -1) {
                    activeRules.push(ruleString);
                }
            }
        });
    });
}

// Check if an element option has variants
function _hasVariants(el) {
    if (el.children != undefined) {
        return true;
    }
    return false;
}

// Print child variants
function _printVariants(name, child, part) {
    var str = "";

    // if it can be printed
    if (checkRules(child.rules)) {
        str += '<div class="child" data-child="' + name + '">';
        if (child.label != undefined) {
            str += '<h4>' + translate(child.label) + '</h4>';
        }
        str += _printLayout(name, child, part);
        str += '</div>';
    }

    return str;
}

// Print layout part (struttura, gradino, ringhiera, corrimano, accessori)
function printLayoutPart(part, mode) {
    var str = '';
    str += '<h3>' + translate(config.parts[part].label) + '</h3>';
    str += '<div class="part" data-part="' + part + '">';
    if (mode == 'complete') {
        jQuery.each(config.parts[part].children, function (i, child) {
            str += _printVariants(i, child, part);
        });
    }
    str += '</div>';
    return str;
}

// Print layout
function _printLayout(childname, child, part) {
    switch (child.type) {
        case 'a':
            return _printLayoutAnchor(childname, child, part);
        case 'select':
            return _printLayoutSelect(childname, child, part);
        case 'checkbox':
            return _printLayoutCheckbox(childname, child, part);
    }
}

function _isSelectedValue(part, childname, val){
    var result = false;
    if(selectedValues.length) {
        jQuery.each(selectedValues, function (key, values) {
            if ((values.part == part) && (values.child == childname) && (values.id == val)) {
                result = true;
            }
        });
    }
    return result;
}

// Print Anchor layout
function _printLayoutAnchor(childname, child, part) {
    var str = "";

    // search default
    var d = "";
    var selectedValue = "";
    var variant = "";
    jQuery.each(child.options, function (val, opt) {
        if (checkRules(opt.rules)) {
            if (val == child.default) {
                d = child.default;
            }

            if(_isSelectedValue(part, childname, val)){
                selectedValue = val;
            }
        }
    });
	
    var i = 1;
    jQuery.each(child.options, function (val, opt) {
        if (checkRules(opt.rules)) {
            if (i == 1 && d == "") {
                d = val;
            }
            var data_img = "";
            var data_img_detail = "";
            var data_img_support = "";
			var printLabel = 'data-print="false"';
            if (opt.value != undefined) {
                data_img = 'data-img="' + opt.value + '"';
            }
            if (opt.detail != undefined) {
                data_img_detail = 'data-img-detail="' + opt.detail + '"';
            }
            if (opt.support != undefined) {
                data_img_support = 'data-img-support="' + opt.support + '"';
            }
            if (config.parts[part].rules != "[]") {
                printLabel = 'data-print="true"';
            }
			if(opt.print == "false"){
				printLabel = 'data-print="false"';
			}
			var display = "display:inline-block; ";
			if(opt.preview == "")
			{
				display = "display:none; ";
			}
            str += '<a href="#" ' + data_img + ' ' + printLabel + ' ' + data_img_detail + ' ' + data_img_support + ' data-id="' + val + '" class="opt';
            if(selectedValue != ""){
                if(val == selectedValue) {
                    str += ' selected';
                    variant = val;
                }
            }
            else{
                if(val == d) {
                    str += ' selected';
                    variant = val;
                }
            }
            str += '" data-label="'+translate(opt.label)+'" title="' + translate(opt.label) + '" style="'+display+'background-image: url('+ path +'models/previews/' + opt.preview + ')"></a>';
           

            // Print the first variant of default value
            if (child.default != "" && child.options[variant] != undefined) {
                if (_hasVariants(child.options[variant])) {
                    var first = child.options[variant].children;
                    str += _printVariants(Object.keys(first)[0], first[Object.keys(first)[0]], part);
                }
            }
            i++;
        }
    });

    return str;
}


// Print Select layout
function _printLayoutSelect(childname, child, part) {
    // search default
    var d = "";
    var selectedValue = "";
    var variant = "";
    jQuery.each(child.options, function (val, opt) {
        if (checkRules(opt.rules)) {
            if (val == child.default) {
                d = child.default;
            }
            if(_isSelectedValue(part, childname, val)){
                selectedValue = val;
            }
        }
    });

    var i = 1;
    var str = "";
    str += '<div class="label-select">';
    str += '<select>';
    jQuery.each(child.options, function (val, opt) {
        if (checkRules(opt.rules)) {
            if (i == 1 && d == "") {
                d = val;
            }
            var data_img = "";
            var data_img_detail = "";
            var data_img_support = "";
			var printLabel = 'data-print="false"';
            if (opt.value != undefined) {
                data_img = 'data-img="' + opt.value + '"';
            }
            if (opt.detail != undefined) {
                data_img_detail = 'data-img-detail="' + opt.detail + '"';
            }
            if (opt.support != undefined) {
                data_img_support = 'data-img-support="' + opt.support + '"';
            }
            if (config.parts[part].rules != "[]") {
                printLabel = 'data-print="true"';
            }
			if(opt.print == "false"){
				printLabel = 'data-print="false"';
			}
            str += '<option data-label="'+translate(opt.label)+'" title="' + translate(opt.label) + '" ' + data_img +  ' ' + printLabel + ' '  + data_img_detail + ' ' + data_img_support + ' data-id="' + val + '" class="opt" value="' + val + '" ';
            if(selectedValue != ""){
                if(val == selectedValue) {
                    str += 'selected';
                    variant = val;
                }
            }
            else{
                if(val == d) {
                    str += 'selected';
                    variant = val;
                }
            }
            str += ' >' + translate(opt.label) + '</option>';
            i++;
        }
    });
    str += '</select>';
    str += '</div>';

    // Print the first variant of default value
    if (child.default != "" && child.options[variant] != undefined) {
        if (_hasVariants(child.options[variant])) {
            var first = child.options[variant].children;
            str += _printVariants(Object.keys(first)[0], first[Object.keys(first)[0]], part);
        }
    }
    return str;
}

// Print Checkbox layout
function _printLayoutCheckbox(childname, child, part) {
    // search default
    var d = "";
    var selectedValue = "";
    var variant = "";
    jQuery.each(child.options, function (val, opt) {
        if (checkRules(opt.rules)) {

            if(selectedValues.length) {
                jQuery.each(selectedValues, function (key, values) {
                    if ((values.part == part) && (values.child == childname)) {
                        selectedValue = val;
                    }
                });
            }

        }
    });

    var str = "";
    jQuery.each(child.options, function (val, opt) {
        if (checkRules(opt.rules)) {
            str += '<div>';

            var data_img = "";
            var data_img_detail = "";
            var data_img_support = "";
			var printLabel = 'data-print="false"';
            if (opt.value != undefined) {
                data_img = 'data-img="' + opt.value + '"';
            }
            if (opt.detail != undefined) {
                data_img_detail = 'data-img-detail="' + opt.detail + '"';
            }
            if (opt.support != undefined) {
                data_img_support = 'data-img-support="' + opt.support + '"';
            }
            if (config.parts[part].rules != "[]") {
                printLabel = 'data-print="true"';
            }
			if(opt.print == "false"){
				printLabel = 'data-print="false"';
			}
            str += '<input data-label="'+translate(opt.label)+'" title="' + translate(opt.label) + '" ' + data_img +  ' ' + printLabel + ' '  + data_img_detail + ' ' + data_img_support + ' id="' + val + '" data-id="' + val + '" class="opt" type="checkbox" value="' + val + '" name="' + val + '" ';

			if(selectedValue != ""){
                if(val == selectedValue) {
                    str += 'checked="true"';
                    variant = val;
                }
            }
            else{
                if(val == d) {
                    str += 'checked="true"';
                    variant = val;
                }
            }
            str += '/><label for="' + val + '"><span></span>' + translate(opt.label) + '</label>';

            // Print the first variant of default value
			if(variant == ''){
				variant = child.default;
			}

            if (child.default != "" && child.options[variant] != undefined) {
                if (_hasVariants(child.options[variant])) {
                    var first = child.options[variant].children;	
                    str += _printVariants(Object.keys(first)[0], first[Object.keys(first)[0]], part);
                }
            }

            str += '</div>';
        }
    });
    return str;
}

function _checkRule(rule) {
    rule = rule.substr(1, rule.length - 2);	
    var good = false;
    var not = "";
    not = rule.substr(0, 1);
    if (not == "!") {
        var r = rule.substr(1);
        // It's in array
        if (jQuery.inArray(r, activeRules) != -1) {
            good = false;
            return false;
        }
        else {
            good = true;
        }
    }
    else {
        // It's in array
        if (jQuery.inArray(rule, activeRules) != -1) {			
            good = true;
        }
        else {			
            good = false;
            return false;
        }
    }

    return good;
}

// Check rules
function checkRules(condition) {
    // if there are no rules
    if (condition == "true" || condition == "") {
        return true;
    }

    if (condition == "false") {
        return false;
    }

    var str = condition;
    var patt = /\[\S*\]/;
    var ex = patt.exec(str);
    while (ex != null) {
        str = str.replace(ex[0], _checkRule(ex[0])); // al posto di true ci vuole la funzione che cerca nell'array delle regole
        ex = patt.exec(str);		
    }
    return eval(str);
}

// Check if an option is selected
function isSelected(el) {
    switch (el.prop("tagName")) {
        case 'A' :
            if (el.hasClass('selected')) {
                return true;
            }
            break;
        case 'OPTION' :
            if (el.attr('selected') == 'selected') {
                return true
            }
            break;
        case 'INPUT' :
            if (el.attr('type') == 'checkbox') {
                return el.prop('checked');
            }
            break;
    }
}

// Set clicked option value
function setValue(el, part) {
    var child = el.closest('.child').data('child');
    var allOptions = jQuery('[data-part=' + part + '] .child[data-child=' + child + ']').find('.opt');
    switch (el.prop("tagName")) {
        case 'A' :
            allOptions.removeClass('selected');
            el.addClass('selected');
            break;
        case 'OPTION' :
            allOptions.removeAttr('selected');
			allOptions.removeProp('selected');
			allOptions.attr('selected', false);
			allOptions.prop("selected", false);
			allOptions.prop("defaultSelected", null);
			jQuery.each(allOptions, function(i, op){
				jQuery(op).prop("selected", false);
				jQuery(op).attr('selected', false);
				jQuery(op).prop("defaultSelected", null);
			});
            el.prop('selected', true);
            el.attr('selected', true);
			el.prop("defaultSelected", "selected");
            break;
        case 'INPUT' :
            if (el.attr('type') == 'checkbox') {
                if (!isSelected(el)) {
                    el.prop('checked', false);
                }
                else {
                    el.prop('checked', true);
                }
            }
            break;
    }
    el.closest('child').data('active', el.data('id'))
}

// Get single value
function getValue(opt) {
    var currentOptionPart = opt.closest('[data-part]').data('part');
    var currentOptionChild = opt.closest('[data-child]').data('child');
	var childLabel = "";
	if(opt.closest('[data-child]').find('h4').length && opt.closest('[data-child]').find('h4').html() != ""){
		childLabel = opt.closest('[data-child]').find('h4').html();
	}
	var partLabel = opt.closest('.part').prev().text();
    var k = _createRuleStringAncestors(opt, "print");
    var obj;
    switch (true) {
        // Anchor
        case opt.is('a') && opt.hasClass('selected'):
            obj = {
                'key': k,
                'part': currentOptionPart,
				'partLabel': partLabel,
                'child': currentOptionChild,
				'childLabel': childLabel,
                'value': opt.data('img'),
                'label': opt.data('label'),
                'id': opt.data('id'),
                'detail': opt.data('img-detail'),
                'support': opt.data('img-support'),
				'print': opt.data('print')
            };
            break;
        // Select
        case opt.is('option') && opt.attr('selected') == 'selected':
            obj = {
                'key': k,
                'part': currentOptionPart,
				'partLabel': partLabel,
                'child': currentOptionChild,
				'childLabel': childLabel,
                'value': opt.data('img'),
                'label': opt.data('label'),
                'id': opt.data('id'),
                'detail': opt.data('img-detail'),
                'support': opt.data('img-support'),
				'print': opt.data('print')
            };
            break;
        // Checkbox
        case opt.is('input[type=checkbox]') && opt.prop('checked'):
            obj = {
                'key': k,
                'part': currentOptionPart,
				'partLabel': partLabel,
                'child': currentOptionChild,
				'childLabel': childLabel,
                'value': opt.data('img'),
                'label': opt.data('label'),
                'id': opt.data('id'),
                'detail': opt.data('img-detail'),
                'support': opt.data('img-support'),
				'print': opt.data('print')
            };
            break;
    }
    return obj;
}

// Get values
function getValues() {
    var values = [];
    var options = jQuery('.opt');
    jQuery.each(options, function (i, option) {
        var obj = getValue(jQuery(option));
        if (obj != undefined)
            values.push(obj);
    });
    return values;
}

// Get print values
function getPrintValues() {
    var values = [];
    var options = jQuery('.opt');
    jQuery.each(options, function (i, option) {
        var obj = getValue(jQuery(option));
        if (obj != undefined)
		{
            values.push(obj);
		}
    });
    return values;
}

// Edit canvas
function editCanvas(values) {
    var model = jQuery('#model-id').val();
    var imagesArr = [];
    var supportImagesArr = [];
    jQuery.each(config.commons, function (i, img) {
        imagesArr.push('<img class="img-model" src="'+ path +'models/' + model + '/comuni/' + img + '">');
    });
    jQuery.each(config.order, function (i, p) {
        jQuery.each(values, function (i, part) {
            if (part.value != undefined) {
                if (p == part.key) {
                    if (part.support != undefined) {
                        var srcSupport = path + "models/" + model + "/" + part.part + "/" + part.support;
                        var strSupport = '<img class="img-model" src="' + srcSupport + '">';
                        supportImagesArr.push(strSupport);

                    }
                    var src = path + "models/" + model + "/" + part.part + "/" + part.value;
                    var str = '<img class="img-model" src="' + src + '">';
                    imagesArr.push(str);
                }
            }
        });
    });

    var imgStack = imagesArr.join('');

    if (config.details_order) {
        imagesArr = [];
        jQuery.each(config.details_order, function (i, p) {
            jQuery.each(values, function (i, part) {
                if (part.detail != undefined) {
                    if (p == part.key) {
                        var src = path + "models/" + model + "/" + part.part + "/" + part.detail;
                        var str = '<img class="img-model" src="' + src + '">';
                        imagesArr.push(str);
                    }
                }
            });
        });
    }

    imgStack += imagesArr.join('');
    imgStack += supportImagesArr.join('');
    jQuery('#editor').css('background', 'white url("'+path+'img/main-loader.gif") no-repeat scroll center center');
    jQuery('#canvas').html(imgStack);

    jQuery('#canvas').waitForImages({
        finished: function() {
            jQuery('#editor').css('background','transparent')
        },
        waitForAll: true
    });


}
