Vue.directive('datepicker', {
  bind: function () {
    var vm = this.vm;
    var key = this.expression;
    $(this.el).datepicker({
      dateFormat: 'dd-mm-yy',
      onSelect: function (date) {
        //TODO: Check if date is valid.
        vm.$set(key, date);
      }
    });
  },
  update: function (val) {
    $(this.el).datepicker('setDate', val);
  }
});

Vue.component('detallesprincipales',{
  props: ['hotel','hotelsDetails'],

  template: '<div v-for="hot in hotelsDetails" v-if="hot.id==hotel.id" class="hotel-desc "><div class="hotel-address" data-lat="{{ hot.location.latitude }}" data-lon="{{ hot.location.longitude }}"><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span> {{ hot.location.address }}</div><div>{{ hot.information.es }}</div></div>',

});

Vue.component('preciodesde',{
  props: ['hotel','cheapestNightPrices'],

  template: '<div class="btn btn-danger btn-lg" v-on:click="getHotelAvailability" v-for="cnp in cheapestNightPrices" v-if="cnp.h==hotel.id">Reserva desde: {{ cnp.moneda }} {{ cnp.precio_desde.toFixed(2) }}</div>',

  methods: {
    startReservation: function() {
      this.$dispatch('startReservation', this.hotel.id);
    },

    getHotelAvailability: function(id){
      this.$dispatch('getHotelAvailability', this.hotel.id);
    }
  }
});

Vue.component('formapago',{
  props: ['hotel','hotelPaymentTypes'],

  template: '<div class="forma_de_pago"><strong>Forma de pago: <span v-for="hpt in hotelPaymentTypes" v-if="hpt.h==hotel.id"><span v-for="p in hpt.pt">{{ p }}</span></span></strong></div>',

});

Vue.component('amenities',{
  props: ['hotel','amenities'],

  template: '<div class"amenities"><h2>Amenities</h2><div class="amenity btn btn-warning btn-xs" v-for="ame_hotel in hotel.hotel.amenity_ids"><span v-for="ame in amenities" v-if="ame.value==ame_hotel">{{ ame.label }}</span></div> </div>',

});

new Vue({
  el: '#app',
  data: {
    country:    0,
    province:   0,
    city:       0,
    meal_plans: null,
    countries:  null,
    provinces:  null,
    cities:     null,
    hotels:     null,
    hotels_details: null,
    from_date:  null,
    to_date:    null,
    adults:     null,
    children:   null,
    rooms:      null,
    amenities:  null,
    hotel_types: null,
    payment_types: null,
    hoteldetallado: null,
    inputs_ids: []
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
      var hids = [];

      for (h in this.hotels){
        var hotel = this.hotels[h];
        hids.push(hotel.id);
      }
      return hids;
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
              var separator = (ptypes.length>0)?', ':'';
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
    this.getMealPlans();
    this.city=4703;// mar de las pampas
  },

  methods: {

    volver: function(){
      this.hoteldetallado= null;
    },

    getMealPlans: function(){

    var self = this;

      this.$http.post('proxy/', {'method':'hotels/meal-plans','qs':''}, {'emulateJSON' : true}).then(
        function(response){
          self.meal_plans = response.data
        },
        this.errorCallback
      );
    },

    getCountries: function() {
      var self = this;

      this.$http.post('proxy/', {'method':'countries','qs':'?product=HOTELS&language=ES'}, {'emulateJSON' : true}).then(
        function(response){
          self.countries = response.data
        },
        this.errorCallback
      );
    },

    getProvinces: function() {
      var self = this;

      this.$http.post('proxy/', {'method':'administrative-divisions','qs':'?product=HOTELS&language=ES&country_id=' + this.country}, {'emulateJSON' : true}).then(
        function(response){
          self.provinces = response.data
        },
        this.errorCallback
      );
    },

    getCities: function() {
      var self = this;

      this.$http.post('proxy/', {'method':'cities','qs':'?product=HOTELS&language=ES&administrative_division_id=' + this.province}, {'emulateJSON' : true}).then(
        function(response){
          self.cities = response.data
        },
        this.errorCallback
      );
    },

    getHotels: function() {
      var self = this;

      this.$http.post('proxy/', {'method':'hotels','qs':'?language=es&cities=' + this.city}, {'emulateJSON' : true}).then(
        function(response){
          self.hotels = response.data
        },
        this.errorCallback
      );
    },
    getHotelAvailability: function(id) {
      var self = this;

      this.$http.post('proxy/', {'method':'hotels/availabilities/'+id,'qs':'?country_code=AR&currency=ARS&language=es&distribution='+this.distribution+'&checkin_date='+this.from_date_api+'&checkout_date='+this.to_date_api}, {'emulateJSON' : true}).then(
        function(response){
          self.hoteldetallado = response.data;
          var rp_simples = [];
          var ro_anterior = 0;
          for(i in response.data.roompacks){
            var rp = response.data.roompacks[i];
            for(j in rp.rooms){
              var ro = rp.rooms[j];
              //para no repetir cuartos en listado
              if(ro.room_code != ro_anterior){
                //traer la descripcion del meal plan
                for (k in this.meal_plans){
                  mp = this.meal_plans[k];
                  if (rp.meal_plan.id == mp.id){
                    rp.meal_plan_desc = mp.descriptions.es;
                    break;
                  }
                }
                //imagen
                for(l in this.hotels_details){
                  var hd = this.hotels_details[l];
                  if(hd.id==id){
                    for (m in hd.room_types){
                        rt = hd.room_types[m];
                        if(rt.id == ro.room_code){
                          rp.imgurl = rt.pictures[0].url;
                          break;
                        }
                    }
                  }
                }
                rp_simples.push(rp);
                ro_anterior = ro.room_code;
              }
            }
          }
          this.hoteldetallado.roompacks_simple = rp_simples;
        },
        this.errorCallback
      );
    },

    getHotelsDetails: function() {
      var self = this;

      this.$http.post('proxy/', {'method':'hotels','qs':'?ids='+this.hotels_ids.toString()+'&language=es&options=amenities,fees,information,pictures,notices,room_types(information,pictures),extra_details'}, {'emulateJSON' : true}).then(
        function(response){
          self.hotels_details = response.data
          $('#loading-spinner').loadingOverlay('remove');
          $('#results-container').show();
        },
        this.errorCallback
      );
    },

    getAvailableHotels: function() {
      var self = this;
      $('#results-container').hide();
      $('#loading-spinner').loadingOverlay({loadingText: 'Un momento por favor, estamos buscando hoteles para vos'});

      this.$http.post('proxy/', {'method':'hotels/availabilities','qs':'?currency=ARS&sorting=total_price_ascending&country_code=AR&language=es&destination=' + this.city+'&distribution='+this.distribution+'&checkin_date='+this.from_date_api+'&checkout_date='+this.to_date_api}, {'emulateJSON' : true}).then(
        function(response){
          self.amenities = response.data.facets[0].values;
          self.hotel_types = response.data.facets[1].values;
          self.payment_types = response.data.facets[2].values;
          self.hotels = response.data.items;
          this.getHotelsDetails();
        },
        this.errorCallback
      );
    },

    startReservation: function(hotel_id) {
      var self = this;
      var body = {
        'source': {'country_code':'AR'},
        'reservation_context': {
          'context_language':'es',
          'shown_currency':'ARS',
          'threat_metrix_id':'TheValue',
          'client_ip':'200.49.12.204',
          'user_agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36',
          'base_url':'www.despegar.com.ar'
        },
        'keys': {"availability_token":"hsm_retrieve_documentation"}
      };

      self.bookingPromptInfo = null;
      self.bookingId = null;

      this.$http.post('proxy/', {'method':'hotels/bookings','qs':'?example=true', 'body': body}, {'emulateJSON' : true}).then(
        function(response){
          self.bookingId = response.data.id
          self.getBookingForm()
        },
        this.errorCallback
      );
    },

    getBookingForm: function() {
      var self = this;

      this.$http.post('proxy/', {'method':'hotels/bookings/'+self.bookingId+'/forms','qs':'?example=true'}, {'emulateJSON' : true}).then(
        function(response){
          self.bookingPromptInfo = response.data;
          self.promptUserForInfo();
        },
        this.errorCallback
      );
    },

    promptUserForInfo: function() {
      var self = this;

      form_choice   = self.bookingPromptInfo.items[0].form_choice;
      form_choices  = self.bookingPromptInfo.dictionary.form_choices;
      form_fields   = form_choices[form_choice];

      $('#promtUserForInfo').modal();

      self.getInputs(form_fields, 'form');
    },

    getInputs: function(fields_object, previous_key) {
      var self = this;
      var formId = $('#promtUserFields');

      for(key in fields_object) {
        var current_key = previous_key + '-' + key

        if(typeof fields_object[key] === "object") {
          if(typeof fields_object[key].type !== 'undefined') {
            if(fields_object[key].requirement_type === 'REQUIRED') {
              switch (fields_object[key].type) {
                case 'TEXT':
                  self.inputs_ids.push(current_key);
                  formId.append("<input type='text' id='"+current_key+"' placeholder='"+key+"' class='patch_data_input' />");
                  break;
                case 'BOOLEAN':
                  break;
                case 'DATE':
                  break;
                case 'DATE_YEAR_MONTH':
                  break;
                default:
                  if(fields_object[key].type.type == 'MULTIVALUED') {
                    select = $("<select id='"+current_key+"-type' class='patch_data_select'></select>")

                    fields_object[key].type.options.forEach(function(option){
                      select.append("<option value='"+option.key+"'>"+option.description+"</option>");
                    });

                    formId.append(select);

                    self.inputs_ids.push(current_key + '-type');

                    if(typeof fields_object[key] === "object") {
                      this.getInputs(fields_object[key], current_key);
                    }
                  }
              }
            }
          } else {
            if(typeof fields_object[key] === "object") {
              this.getInputs(fields_object[key], current_key);
            }
          }
        }
      }
    },

    confirmReservation: function() {
      var self = this;
      var body = {};

      // console.log(self.inputs_ids)

      self.inputs_ids.forEach(function(joined_input) {
        input_split = joined_input.split('-');

        input_split.forEach(function(value, index) {
          var stringToEval = 'body';

          for (var i = 0; i <= index; i++) {
            if(eval(stringToEval) == null) {
              console.log('no')
            } else {
              if(i == input_split.length - 1) {
                eval(stringToEval)[input_split[i]] = $('#'+joined_input).val();
              } else {
                if(eval(stringToEval)[input_split[i]] == null) {
                  if(input_split[i + 1] && $.isNumeric(input_split[i + 1])) {
                    eval(stringToEval)[input_split[i]] = [];
                  } else {
                    eval(stringToEval)[input_split[i]] = {};
                  }
                }

                if($.isNumeric(input_split[i])) {
                  stringToEval = stringToEval + '[' + input_split[i] + ']';
                } else {
                  stringToEval = stringToEval + '.' + input_split[i];
                }
              }
            }
          }
        });
      });

      body.payment_method_choice = "1"; //TODO: Ver de donde sale el payment type y qué info requiere.
      body.form.payment = {
        "credit_card": {
          "number":"4242424242424242",
          "expiration":"2020-12",
          "security_code":"123",
          "owner_name":"Test Booking",
          "owner_document": {
            "type":"LOCAL",
            "number":"12345678"
          },
          "card_code":"VI",
          "card_type":"CREDIT"
        },
        "billing_address": {
          "country":"AR",
          "state":"Buenos Aires",
          "city":"BUE",
          "street":"Calle Falsa",
          "number":"123",
          "floor":"1",
          "department":"G",
          "postal_code":"1234"
        }
      }

      this.$http.post('proxy/', {'method':'hotels/bookings/'+self.bookingId+'/forms/'+self.bookingPromptInfo.items[0].id,'qs':'?example=true', 'body': body, 'patch': true}, {'emulateJSON' : true}).then(
        function(response){
          $('#promtUserFields').html(null);
          
          $('#promtUserForInfo').modal('hide');

          $('#reservationNumber').html(response.data.reservation_id);

          $('#resultadoReserva').modal();
        },
        this.errorCallback
      );
    },

    successCallback: function(response) {
      return response.data
    },

    errorCallback: function(response) {
      // TODO: Add a popup with an error message.
      return null;
    },
  },

  events: {
    'startReservation': function (hotel_id) {
      this.startReservation();
    },

    'getHotelAvailability': function(hotel_id){
      this.getHotelAvailability(hotel_id);
    }
  }
});
