$(document).ready(function ($) {

  $('#preview').load('/wp-content/templates/model-sidebar.html');
  $('#contact-container').load('/wp-content/templates/contact.html');
  $('#footer').load('/wp-content/templates/footer.html');


  // CONTACT FORM

  $.widget( "custom.combobox", {
    _create: function() {
      this.wrapper = $( "<span>" )
          .addClass( "custom-combobox" )
          .insertAfter( this.element );

      this.element.hide();
      this._createAutocomplete();
      this._createShowAllButton();
    },

    _createAutocomplete: function() {
      var selected = this.element.children( ":selected" ),
          value = selected.val() ? selected.text() : "";

      this.input = $( "<input>" )
          .appendTo( this.wrapper )
          .val( value )
          .attr( "title", "" )
          .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: this._source.bind( this )
          })
          .tooltip({
            classes: {
              "ui-tooltip": "ui-state-highlight"
            }
          });

      this._on( this.input, {
        autocompleteselect: function( event, ui ) {
          ui.item.option.selected = true;
          this._trigger( "select", event, {
            item: ui.item.option
          });
        },

        autocompletechange: "_removeIfInvalid"
      });
    },

    _createShowAllButton: function() {
      var input = this.input,
          wasOpen = false;

      $( "<a>" )
          .attr( "tabIndex", -1 )
          .tooltip()
          .appendTo( this.wrapper )
          .button({
            icons: {
              primary: "ui-icon-triangle-1-s"
            },
            text: false
          })
          .removeClass( "ui-corner-all" )
          .addClass( "custom-combobox-toggle ui-corner-right" )
          .on( "mousedown", function() {
            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
          })
          .on( "click", function() {
            input.trigger( "focus" );

            // Close if already visible
            if ( wasOpen ) {
              return;
            }

            // Pass empty string as value to search for, displaying all results
            input.autocomplete( "search", "" );
          });
    },

    _source: function( request, response ) {
      var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
      response( this.element.children( "option" ).map(function() {
        var text = $( this ).text();
        if ( this.value && ( !request.term || matcher.test(text) ) )
          return {
            label: text,
            value: text,
            option: this
          };
      }) );
    },

    _removeIfInvalid: function( event, ui ) {

      // Selected an item, nothing to do
      if ( ui.item ) {
        return;
      }

      // Search for a match (case-insensitive)
      var value = this.input.val(),
          valueLowerCase = value.toLowerCase(),
          valid = false;
      this.element.children( "option" ).each(function() {
        if ( $( this ).text().toLowerCase() === valueLowerCase ) {
          this.selected = valid = true;
          return false;
        }
      });

      // Found a match, nothing to do
      if ( valid ) {
        return;
      }

      // Remove invalid value
      this.input
          .val( "" )
          .attr( "title", value + " didn't match any item" )
          .tooltip( "open" );
      this.element.val( "" );
      this._delay(function() {
        this.input.tooltip( "close" ).attr( "title", "" );
      }, 2500 );
      this.input.autocomplete( "instance" ).term = "";
    },

    _destroy: function() {
      this.wrapper.remove();
      this.element.show();
    }
  });

  $(document).on('click','#contact',function(e){
    e.preventDefault();
    $('#contact-container').show();
  });


  $(document).on('click','#close-contact',function(){
    $('#contact-container').hide();
  });

  // END CONTACT FORM

  // firebase stuff
  // var config = {
  //   apiKey: "AIzaSyDL-_f_lQb4dnkx6GRrL7O7L7sp2A1Kj1w",
  //   authDomain: "ds-mobile-dev.firebaseapp.com",
  //   databaseURL: "https://ds-mobile-dev.firebaseio.com",
  //   projectId: "ds-mobile-dev",
  //   storageBucket: "ds-mobile-dev.appspot.com",
  //   messagingSenderId: "931169905269"
  // };
  // firebase.initializeApp(config);
  //
  // const dbRef = firebase.database();
  // const messagesRef = dbRef.ref('mateo-contact-messages');
  // function showSnackbar() {
  //   // Get the snackbar DIV
  //   let x = document.getElementById("snackbar");
  //
  //   // Add the "show" class to DIV
  //   x.className = "show";
  //
  //   // After 3 seconds, remove the show class from DIV
  //   setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
  // }
  // function fieldsValid(message) {
  //   return message.category != "0" && message.lastname && message.firstname && message.phone;
  // }
  // function resetFields() {
  //   $("#combobox").val("0")
  //   $("#lastname").val("")
  //   $("#firstname").val("")
  //   $("#phone").val("")
  //   $("#email").val("")
  //   $("#city").val("")
  //   $("#message").val("")
  // }
  // $(document).on('click','#send-message',function(){
  //   const message = {
  //     category: $("#combobox").val(),
  //     lastname:  $("#lastname").val().trim().toLowerCase(),
  //     firstname: $("#firstname").val().trim().toLowerCase(),
  //     phone: $("#phone").val(),
  //     email: $("#email").val().trim().toLowerCase(),
  //     city: $("#city").val().trim().toLowerCase(),
  //     message: $("#message").val().trim().toLowerCase(),
  //   }
  //   console.log(fieldsValid(message));
  //
  //   if (!fieldsValid(message)) {
  //     alert("Te rugam sa completezi campurile obligatorii marcate cu *");
  //   } else {
  //     messagesRef.push(message)
  //     resetFields();
  //     showSnackbar();
  //   }
  // });
  // end firebase stuff
})
