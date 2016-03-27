new Vue({
  el: '#app',

  data: {
    country:        0,
    province:       0,
    city:           0,
    meal_plans:     null,
    countries:      null,
    provinces:      null,
    cities:         null,
    hotels:         null,
    // hotels_details: null,
    from_date:      null,
    to_date:        null,
    adults:         null,
    children:       null,
    rooms:          null,
    amenities:      null,
    hotel_types:    null,
    payment_types:  null,
    hotel_detail:   null,
    inputs_ids:     [],
    showModal:      false,
    showDetails:    false,
    hotel:          null,
  },

  computed: {
    from_date_api: function(){
      oDate = this.from_date;
      if (oDate === null && typeof oDate === "object") {
        return null;
      } else {
        return oDate.substr(6,4)+'-'+oDate.substr(3,2)+'-'+oDate.substr(0,2);
      }
    },

    to_date_api: function(){
      oDate = this.to_date;
      if (oDate === null && typeof oDate === "object") {
        return null;
      } else {
        return oDate.substr(6,4)+'-'+oDate.substr(3,2)+'-'+oDate.substr(0,2);
      }
    },

    distribution: function(){
      var dist = this.adults;
      if (this.children !== null){
        for(i=0;i<this.children;i++){
          dist+='-7'
        }
      }
      if(this.rooms !== null && this.rooms > 1){
        dist += '!'+this.rooms;
      }
      return dist;
    },

    hotels_ids: function(){
      var hotel_ids = [];

      for (h in this.hotels){
        var hotel = this.hotels[h];
        hotel_ids.push(hotel.id);
      }
      return hotel_ids;
    },

    cheapest_night_prices: function(){
      var precios = [];

      for (h in this.hotels){
        var hotel = this.hotels[h];
        var precio = -1;
        var moneda = null;
        for (r in hotel.roompacks){
          rp = hotel.roompacks[r];
          moneda = rp.price_detail.currency;
          precio = (precio == -1)?rp.price_detail.nightly.subtotal:(precio>rp.price_detail.nightly.subtotal)?rp.price_detail.nightly.subtotal:precio;
        }
        precios.push({h:hotel.id,precio_desde:precio,moneda:moneda});
      }
      return precios;
    },

    hotel_payment_types: function(){
      var hptypes = [];
      var hotel = null;

      for (h in this.hotels){
        hotel = this.hotels[h];
        ptypes = [];
        for(p in hotel.payment_types){
          pt = hotel.payment_types[p];
          if(pt == 'prepaid'){
            if(hotel.max_installment_quantity == 1){
              pt = 'prepaid_one_payment';
            } else {
              pt = 'prepaid_installments';
            }
          }
          for( pp in this.payment_types){
            ppt = this.payment_types[pp];
            if(ppt.value==pt){
              var separator = (ptypes.length>0)?' o ':'';
              if(pt=='prepaid_installments'){
                ptypes.push(separator+'Hasta en '+hotel.max_installment_quantity+' cuotas');
              } else {
                ptypes.push(separator+ppt.label)
              }
            }
          }
        }
        hptypes.push({h:hotel.id,pt:ptypes});
      }
      return hptypes;
    },
  },

  created: function () {
    //this.getCountries();
    // this.getMealPlans();
    this.city = 4703;// mar de las pampas
    this.from_date = '31-03-2016';
    this.to_date = '05-04-2016';
  },

  methods: {

    // volver: function(){
    //   this.hoteldetallado= null;
    // },
    //
    // getMealPlans: function(){
    //
    // var self = this;
    //
    //   this.$http.post('proxy/', {'method':'hotels/meal-plans','qs':''}, {'emulateJSON' : true}).then(
    //     function(response){
    //       self.meal_plans = response.data
    //     },
    //     this.errorCallback
    //   );
    // },
    //
    // getCountries: function() {
    //   var self = this;
    //
    //   this.$http.post('proxy/', {'method':'countries','qs':'?product=HOTELS&language=ES'}, {'emulateJSON' : true}).then(
    //     function(response){
    //       self.countries = response.data
    //     },
    //     this.errorCallback
    //   );
    // },
    //
    // getProvinces: function() {
    //   var self = this;
    //
    //   this.$http.post('proxy/', {'method':'administrative-divisions','qs':'?product=HOTELS&language=ES&country_id=' + this.country}, {'emulateJSON' : true}).then(
    //     function(response){
    //       self.provinces = response.data
    //     },
    //     this.errorCallback
    //   );
    // },
    //
    // getCities: function() {
    //   var self = this;
    //
    //   this.$http.post('proxy/', {'method':'cities','qs':'?product=HOTELS&language=ES&administrative_division_id=' + this.province}, {'emulateJSON' : true}).then(
    //     function(response){
    //       self.cities = response.data
    //     },
    //     this.errorCallback
    //   );
    // },

    // getHotels: function() {
    //   var self = this;
    //
    //   this.$http.post('proxy/', {'method':'hotels','qs':'?language=es&cities=' + this.city}, {'emulateJSON' : true}).then(
    //     function(response){
    //       self.hotels = response.data
    //     },
    //     this.errorCallback
    //   );
    // },

    getAvailableHotels: function() {
      var self = this;
      // this.hoteldetallado = null;
      // this.hotels = null;
      // this.hotels_details = null;

      this.showModal = true;

      // this.$http.post('proxy/', {'method':'hotels/availabilities','qs':'?currency=ARS&sorting=total_price_ascending&country_code=AR&language=es&destination=' + this.city+'&distribution='+this.distribution+'&checkin_date='+this.from_date_api+'&checkout_date='+this.to_date_api}, {'emulateJSON' : true}).then(
      this.$http.post('proxy/buscar.php', {'emulateJSON' : true}).then(
        function(response){
          console.log('window.hotels');
          window.hotels = response.data.items;

          self.$set('hotels', response.data.items);
          self.$set('amenities', response.data.facets[0].values);
          self.$set('hotel_types', response.data.facets[1].values);
          self.$set('payment_types', response.data.facets[2].values);

          this.getHotelsDetails();
        },
        this.errorCallback
      );
    },

    getHotelsDetails: function() {
      var self = this;

      this.showModal = true;

      // this.$http.post('proxy/', {'method':'hotels','qs':'?ids='+this.hotels_ids.toString()+'&language=es&options=amenities,fees,information,pictures,notices,room_types(information,pictures),extra_details'}, {'emulateJSON' : true}).then(
      this.$http.post('proxy/details.php', {'emulateJSON' : true}).then(
        function(response){
          self.showModal = false;

          hotel_details = response.data;

          hotel_details.forEach(function(details, index) {
            hotel = self.hotels[index];
            Vue.set(hotel, 'details', details)
          });
        },
        this.errorCallback
      );
    },

    viewDetails: function(hotel_id, hotel_index) {
      var self = this;

      this.showModal = true;

      // this.$http.post('proxy/', {'method':'hotels/availabilities/'+hotel_id,'qs':'?country_code=AR&currency=ARS&language=es&distribution='+this.distribution+'&checkin_date='+this.from_date_api+'&checkout_date='+this.to_date_api}, {'emulateJSON' : true}).then(
      this.$http.post('proxy/hotel.php', {'emulateJSON' : true}).then(
        function(response) {
          self.showModal = false;
          this.showDetails = true;

          self.$set('hotel', self.hotels[hotel_index]);
          Vue.set(self.hotel, 'availability', response.data);

          console.log('window.hotel')
          window.hotel = self.hotel;

          // var rp_simples = [];
          // var ro_anterior = 0;
          // for(i in self.hotel_detail.roompacks){
          //   var rp = self.hotel_detail.roompacks[i];
          //   for(j in rp.rooms){
          //     var ro = rp.rooms[j];
          //     //para no repetir cuartos en listado
          //     if(ro.room_code != ro_anterior){
          //       //traer la descripcion del meal plan
          //       // for (k in this.meal_plans){
          //       //   mp = this.meal_plans[k];
          //       //   if (rp.meal_plan.id == mp.id){
          //       //     rp.meal_plan_desc = mp.descriptions.es;
          //       //     break;
          //       //   }
          //       // }
          //       //imagen
          //       // for(l in this.hotels_details){
          //       //   var hd = this.hotels_details[l];
          //       //   if(hd.id==id){
          //       //     for (m in hd.room_types){
          //       //         rt = hd.room_types[m];
          //       //         if(rt.id == ro.room_code){
          //       //           rp.imgurl = rt.pictures[0].url;
          //       //           break;
          //       //         }
          //       //     }
          //       //   }
          //       // }
          //       rp_simples.push(rp);
          //       ro_anterior = ro.room_code;
          //     }
          //   }
          // }
          // this.hoteldetallado.roompacks_simple = rp_simples;
        },
        this.errorCallback
      );
    },

    hideDetails: function() {
      this.showDetails = false;
    },
    //
    // startReservation: function(hotel_id) {
    //   var self = this;
    //   var body = {
    //     'source': {'country_code':'AR'},
    //     'reservation_context': {
    //       'context_language':'es',
    //       'shown_currency':'ARS',
    //       'threat_metrix_id':'TheValue',
    //       'client_ip':'',
    //       'user_agent':'',
    //       'base_url':''
    //     },
    //     'keys': {"availability_token":"hsm_retrieve_documentation"}
    //   };
    //
    //   self.bookingPromptInfo = null;
    //   self.bookingId = null;
    //
    //   this.$http.post('proxy/', {'method':'hotels/bookings','qs':'?example=true', 'body': body}, {'emulateJSON' : true}).then(
    //     function(response){
    //       self.bookingId = response.data.id
    //       self.getBookingForm()
    //     },
    //     this.errorCallback
    //   );
    // },
    //
    // getBookingForm: function() {
    //   var self = this;
    //
    //   this.$http.post('proxy/', {'method':'hotels/bookings/'+self.bookingId+'/forms','qs':'?example=true'}, {'emulateJSON' : true}).then(
    //     function(response){
    //       self.bookingPromptInfo = response.data;
    //       self.promptUserForInfo();
    //     },
    //     this.errorCallback
    //   );
    // },
    //
    // promptUserForInfo: function() {
    //   var self = this;
    //
    //   form_choice   = self.bookingPromptInfo.items[0].form_choice;
    //   form_choices  = self.bookingPromptInfo.dictionary.form_choices;
    //   form_fields   = form_choices[form_choice];
    //
    //   $('#promtUserForInfo').modal();
    //   var formId = $('#promtUserFields');
    //   formId.empty();
    //   self.getInputs(form_fields, 'form');
    // },
    //
    // getInputs: function(fields_object, previous_key) {
    //   var self = this;
    //   var formId = $('#promtUserFields');
    //   for(key in fields_object) {
    //     var current_key = previous_key + '-' + key
    //
    //     if(typeof fields_object[key] === "object") {
    //       if(typeof fields_object[key].type !== 'undefined') {
    //         if(fields_object[key].requirement_type === 'REQUIRED') {
    //           switch (fields_object[key].type) {
    //             case 'TEXT':
    //               self.inputs_ids.push(current_key);
    //               formId.append("<input type='text' id='"+current_key+"' placeholder='"+key+"' class='patch_data_input' />");
    //               break;
    //             case 'BOOLEAN':
    //               break;
    //             case 'DATE':
    //               break;
    //             case 'DATE_YEAR_MONTH':
    //               break;
    //             default:
    //               if(fields_object[key].type.type == 'MULTIVALUED') {
    //                 select = $("<select id='"+current_key+"-type' class='patch_data_select'></select>")
    //
    //                 fields_object[key].type.options.forEach(function(option){
    //                   select.append("<option value='"+option.key+"'>"+option.description+"</option>");
    //                 });
    //
    //                 formId.append(select);
    //
    //                 self.inputs_ids.push(current_key + '-type');
    //
    //                 if(typeof fields_object[key] === "object") {
    //                   this.getInputs(fields_object[key], current_key);
    //                 }
    //               }
    //           }
    //         }
    //       } else {
    //         if(typeof fields_object[key] === "object") {
    //           this.getInputs(fields_object[key], current_key);
    //         }
    //       }
    //     }
    //   }
    // },
    //
    // confirmReservation: function() {
    //   var self = this;
    //   var body = {};
    //
    //   // console.log(self.inputs_ids)
    //
    //   self.inputs_ids.forEach(function(joined_input) {
    //     input_split = joined_input.split('-');
    //
    //     input_split.forEach(function(value, index) {
    //       var stringToEval = 'body';
    //
    //       for (var i = 0; i <= index; i++) {
    //         if(eval(stringToEval) == null) {
    //           console.log('no')
    //         } else {
    //           if(i == input_split.length - 1) {
    //             eval(stringToEval)[input_split[i]] = $('#'+joined_input).val();
    //           } else {
    //             if(eval(stringToEval)[input_split[i]] == null) {
    //               if(input_split[i + 1] && $.isNumeric(input_split[i + 1])) {
    //                 eval(stringToEval)[input_split[i]] = [];
    //               } else {
    //                 eval(stringToEval)[input_split[i]] = {};
    //               }
    //             }
    //
    //             if($.isNumeric(input_split[i])) {
    //               stringToEval = stringToEval + '[' + input_split[i] + ']';
    //             } else {
    //               stringToEval = stringToEval + '.' + input_split[i];
    //             }
    //           }
    //         }
    //       }
    //     });
    //   });
    //
    //   body.payment_method_choice = "1"; //TODO: Ver de donde sale el payment type y qué info requiere.
    //   body.form.payment = {
    //     "credit_card": {
    //       "number":"4242424242424242",
    //       "expiration":"2020-12",
    //       "security_code":"123",
    //       "owner_name":"Test Booking",
    //       "owner_document": {
    //         "type":"LOCAL",
    //         "number":"12345678"
    //       },
    //       "card_code":"VI",
    //       "card_type":"CREDIT"
    //     },
    //     "billing_address": {
    //       "country":"AR",
    //       "state":"Buenos Aires",
    //       "city":"BUE",
    //       "street":"Calle Falsa",
    //       "number":"123",
    //       "floor":"1",
    //       "department":"G",
    //       "postal_code":"1234"
    //     }
    //   }
    //
    //   this.$http.post('proxy/', {'method':'hotels/bookings/'+self.bookingId+'/forms/'+self.bookingPromptInfo.items[0].id,'qs':'?example=true', 'body': body, 'patch': true}, {'emulateJSON' : true}).then(
    //     function(response){
    //       $('#promtUserFields').html(null);
    //
    //       $('#promtUserForInfo').modal('hide');
    //
    //       $('#reservationNumber').html(response.data.reservation_id);
    //
    //       $('#resultadoReserva').modal();
    //     },
    //     this.errorCallback
    //   );
    // },

    successCallback: function(response) {
      this.showModal = false;
      return response.data
    },

    errorCallback: function(response) {
      // TODO: Add a popup with an error message.
      this.showModal = false;
      return null;
    },
  },

  events: {
    // 'startReservation': function (hotel_id) {
    //   this.startReservation();
    // },
    //
    // 'getHotelAvailability': function(hotel_id){
    //   this.getHotelAvailability(hotel_id);
    // }
  }
});
