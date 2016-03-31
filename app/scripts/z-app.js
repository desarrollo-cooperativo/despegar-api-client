new Vue({
  el: '#app',

  data: {
    country:          0,
    state:            0,
    city:             0,
    meal_plans:       null,
    countries:        null,
    states:           null,
    cities:           null,
    hotels:           null,
    from_date:        null,
    to_date:          null,
    adults:           2,
    children:         0,
    rooms:            null,
    amenities:        null,
    hotel_types:      null,
    payment_types:    null,
    hotel_detail:     null,
    inputs_ids:       [],
    hotel:            null,
    showModal:        false,
    showDetails:      false,
    showPrompt:       false,
    reservation:      {},
    expiration_day:   null,
    expiration_year:  null,
    phone_type:       [
      {
        key: "CELULAR",
        description: "Celular"
      },
      {
        key: "HOME",
        description: "Casa"
      },
      {
        key: "WORK",
        description: "Trabajo"
      },
      {
        key: "FAX",
        description: "Fax"
      },
      {
        key: "OTHER",
        description: "Otro"
      },
    ],
    id_types:         [
      {
        key: "LOCAL",
        description: "LOCAL"
      },
      {
        key: "PASSPORT",
        description: "PASSPORT"
      }
    ],
  },

  watch: {
    'showDetails': function() {
      $('.selectpicker').selectpicker('render');
    },

    'showPrompt': function() {
      $('.selectpicker').selectpicker('render');
    },
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

    hotel_payment_types: function() {
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

    current_roompack: function() {
      var self    = this,
          rp      = {},
          stored  = false;

      this.hotel.availability.roompacks.forEach(function(roompack) {
        if(roompack.rooms[0].room_code == self.hotel.selected_code && !stored) {
          rp = roompack;
          stored = true;
        }
      });

      return rp;
    },

    listPayments: function() {
      var self      = this,
          payments  = {
            'no_int' : {
              'main_label' : null,
              'payment_array' : []
            },
            'with_int' : {
              'main_label' : [],
              'payment_array' : []
            }
          },
          with_int_label = [];

      this.current_roompack.payments.forEach(function(payment) {
        payment.payment_methods.forEach(function(method) {
          if(method.type != 'cash') {
            if(method.type == 'at_destination') {
              payments.no_int.payment_array.push({
                'label' : 'Pago en destino',
                'method' : method
              });
            } else {
              if(method.amounts.total_interest_amount == 0) {
                if(method.installment_quantity == 1) {
                  payments.no_int.payment_array.push({
                    'label' : '1 Pago',
                    'method' : method
                  });
                } else {
                  payments.no_int.payment_array.push({
                    'label' : method.installment_quantity + ' Cuotas',
                    'method' : method
                  });
                }
              } else {
                with_int_label.push(method.installment_quantity);

                payments.with_int.payment_array.push({
                  'label' : method.installment_quantity + ' Cuotas',
                  'method' : method
                });
              }
            }
          }
        });
      });

      var n = {},
          r = [];

      for(var i = 0; i < with_int_label.length; i++) {
        if (!n[with_int_label[i]]) {
          n[with_int_label[i]] = true;
          r.push(with_int_label[i]);
        }
      }

      payments.with_int.main_label = r.join(', ') + ' Cuotas con inter&eacute;s';

      console.log('window.payments');
      window.payments = payments;

      return payments;
    },

    number_of_rooms: function() {
      var r = [];
      for (i = 0; i < this.rooms; i++) {
        r.push(i);
      }
      return r;
    },
  },

  created: function () {
    // this.getCountries();
    // this.getMealPlans();
    // this.city = 4703;// mar de las pampas
    this.city = 2346;// Calafate
    this.from_date = '11-04-2016';
    this.to_date = '15-04-2016';
  },

  methods: {
    // getMealPlans: function(){
    //
    //   var self = this;
    //
    //   this.$http.post('proxy/', {'method':'hotels/meal-plans','qs':''}, {'emulateJSON' : true}).then(
    //     function(response){
    //       self.meal_plans = response.data
    //     },
    //     this.errorCallback
    //   );
    // },
    //
    get_room_picture: function(room_code) {
      var self          = this;
          room_picture  = null;

      this.hotel.details.room_types.forEach(function(room) {
        if(room_code == room.id) {
          room_picture = room.pictures[0].url;
        }
      });

      return room_picture;
    },

    // getPaymentLabel: function(roompack_type) {
    //   if(roompack_type == 'at_destination') {
    //     return 'Pago en el hotel';
    //   } else {
    //     return 'Pago en el hotel';
    //   }
    // },

    getCountries: function() {
      var self = this;

      this.$http.post('proxy/', {'method':'countries','qs':'?product=HOTELS&language=ES'}, {'emulateJSON' : true}).then(
        function(response){
          self.countries = response.data
        },
        this.errorCallback
      );
    },

    getStates: function(billing) {
      var self              = this,
          selected_country  = null;

      if(billing) {
        selected_country = this.reservation.form.payment.billing_address.country;
      } else {
        selected_country = this.country;
      }

      this.$http.post('proxy/', {'method':'administrative-divisions','qs':'?product=HOTELS&language=ES&country_id=' + selected_country}, {'emulateJSON' : true}).then(
        function(response){
          self.states = response.data
        },
        this.errorCallback
      );
    },

    getCities: function(billing) {
      var self              = this,
          selected_province = null;

      if(billing) {
        selected_province = this.reservation.form.payment.billing_address.state;
      } else {
        selected_province = this.state;
      }

      this.$http.post('proxy/', {'method':'cities','qs':'?product=HOTELS&language=ES&administrative_division_id=' + selected_province}, {'emulateJSON' : true}).then(
        function(response){
          self.cities = response.data
        },
        this.errorCallback
      );
    },

    displayDetails: function() {
      this.showDetails = true;
    },

    hideDetails: function() {
      this.showDetails = false;
    },

    showPayment: function() {
      this.showPrompt = true;
      this.hideDetails();
    },

    hidePayment: function() {
      this.showPrompt = false;
      this.displayDetails();
    },

    getAvailableHotels: function() {
      var self = this;

      this.showModal = true;

      this.$http.post('proxy/', {'method':'hotels/availabilities','qs':'?currency=ARS&sorting=total_price_ascending&country_code=AR&language=es&destination=' + this.city+'&distribution='+this.distribution+'&checkin_date='+this.from_date_api+'&checkout_date='+this.to_date_api}, {'emulateJSON' : true}).then(
      //this.$http.post('proxy/buscar.php', {'emulateJSON' : true}).then(
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

      this.$http.post('proxy/', {'method':'hotels','qs':'?ids='+this.hotels_ids.toString()+'&language=es&options=amenities,fees,information,pictures,notices,room_types(information,pictures),extra_details'}, {'emulateJSON' : true}).then(
      //this.$http.post('proxy/details.php', {'emulateJSON' : true}).then(
        function(response){
          self.showModal = false;

          hotel_details = response.data;

          self.hotels.forEach(function(tmp_hotel, index_hotel) {
            hotel_details.forEach(function(details, index_detail) {
              if(tmp_hotel.id == details.id) {
                Vue.set(self.hotels[index_hotel], 'details', details);
              }
            });
          });
        },
        this.errorCallback
      );
    },

    viewDetails: function(hotel_id, hotel_index) {
      var self = this;

      this.showModal = true;

      this.$http.post('proxy/', {'method':'hotels/availabilities/'+hotel_id,'qs':'?country_code=AR&currency=ARS&language=es&distribution='+this.distribution+'&checkin_date='+this.from_date_api+'&checkout_date='+this.to_date_api}, {'emulateJSON' : true}).then(
      //this.$http.post('proxy/hotel.php', {'emulateJSON' : true}).then(
        function(response) {
          self.showModal = false;
          self.displayDetails();

          self.$set('hotel', self.hotels[hotel_index]);
          Vue.set(self.hotel, 'availability', response.data);

          console.log('window.hotel')
          window.hotel = self.hotel;
        },
        this.errorCallback
      );
    },

    startReservation: function(availability_token, room_code) {
      var self = this;
      var body = {
        'source': {
          'country_code':'AR'
        },
        'reservation_context': {
          'context_language': 'es',
          'shown_currency': 'ARS',
          'threat_metrix_id': 'TheValue', //TODO: Que valor va aca?
          'client_ip': '',
          'user_agent': navigator.userAgent,
          'base_url': ''
        },
        'keys': {"availability_token": availability_token}
      };

      Vue.set(self.hotel, 'selected_code', room_code);
      this.bookingId = null;

      /*** Start new reservation object ***/
      this.expiration_day = null;
      this.expiration_year = null;
      // this.reservation = {
      //   "payment_method_choice": "1",
      //   "form": {
      //     "passengers": [],
      //     "payment": {
      //       "credit_card": {
      //         "number": "4242424242424242",
      //         "expiration": "2020-12",
      //         "security_code": "123",
      //         "owner_name": "Roberto Rosset",
      //         "owner_document": {
      //           "type": "LOCAL",
      //           "number": "30804181"
      //         },
      //         "card_code": "VI",
      //         "card_type": "CREDIT"
      //       },
      //       "billing_address": {
      //         "country": "AR",
      //         "state": "Buenos Aires",
      //         "city": "BUE",
      //         "street": "Calle Falsa",
      //         "number": "123",
      //         "floor": "5",
      //         "department": "8",
      //         "postal_code": "1428"
      //       }
      //     },
      //     "contact": {
      //       "email": "bob.rosset@gmail.com",
      //       "phones": [{
      //         "type": "CELULAR",
      //         "number": "12344456",
      //         "country_code": "54",
      //         "area_code": "11"
      //       }]
      //     }
      //   }
      // };

      this.reservation = {
        payment_method_choice: 1,
        form: {
          passengers: [],
          payment: {
            credit_card: {
              number: null,
              expiration: null,
              security_code: null,
              owner_name: null,
              owner_document: {
                type: null,
                number: null
              },
              card_code: 'VI',
              card_type: 'CREDIT'
            },
            billing_address: {
              country: null,
              state: null,
              city: null,
              street: null,
              number: null,
              floor: null,
              department: null,
              postal_code: null
            }
          },
          contact: {
            email: null,
            phones: [{
              type: null,
              number: null,
              country_code: null,
              area_code: null
            }]
          }
        }
      };

      this.number_of_rooms.forEach(function(room) {
        self.reservation.form.passengers.push({
          first_name: null,
          last_name: null
        });
      });
      /*** Start new reservation object ***/

      // this.$http.post('proxy/', {'method':'hotels/bookings','qs':'?example=true', 'body': body}, {'emulateJSON' : true}).then(
      //   function(response){
      //     self.bookingId = response.data.id;
      //     self.getBookingForm();
      //   },
      //   this.errorCallback
      // );

      self.showPayment();
    },

    getBookingForm: function() {
      var self = this;

      this.$http.post('proxy/', {'method':'hotels/bookings/'+self.bookingId+'/forms','qs':'?example=true'}, {'emulateJSON' : true}).then(
        function(response){
          response.data.items.forEach(function(booking_rp) {
            if(booking_rp.roompack_choice == self.current_roompack.choice) {
              self.booking_roompack_id = booking_rp.id;
            }
          });
          self.showPayment();
        },
        this.errorCallback
      );
    },

    confirmReservation: function() {
      var self = this;

      Vue.set(self.reservation.form.payment.credit_card, 'expiration', this.expiration_year + '-' + this.expiration_day);

      this.$http.post('proxy/', {'method':'hotels/bookings/'+self.bookingId+'/forms/'+self.booking_roompack_id,'qs':'?example=true', 'body': this.reservation, 'patch': true}, {'emulateJSON' : true}).then(
        function(response){
          console.log(response.data);
        },
        this.errorCallback
      );
    },

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

  filters: {
    unique_roompack: function (roompacks) {
      var unique_roompacks = [];

      roompacks.forEach(function(roompack) {
        var add_room = true;

        unique_roompacks.forEach(function(room) {
          if(roompack.rooms[0].room_code == room.rooms[0].room_code) {
            add_room = false;

            room.payments.push({ 'payment_methods' : roompack.payment_methods, 'payment_type' : roompack.payment_type })
          }
        });

        if(add_room) {
          roompack.payments = [];
          roompack.payments.push({ 'payment_methods' : roompack.payment_methods, 'payment_type' : roompack.payment_type });

          unique_roompacks.push(roompack);
        }
      });

      return unique_roompacks;
    }
  },
});
