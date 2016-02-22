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

  template: '<h2>Información</h2><div v-for="hot in hotelsDetails" v-if="hot.id==hotel.id"><img src="{{ hot.main_picture.url }}" alt=""><div class="hotel_address" data-lat="{{ hot.location.latitude }}" data-lon="{{ hot.location.longitude }}">Dirección: {{ hot.location.address }}</div><div>{{ hot.information.es }}</div></div>',

});


Vue.component('preciodesde',{
  props: ['hotel','cheapestNightPrices'],

  template: '<h2 v-for="cnp in cheapestNightPrices" v-if="cnp.h==hotel.id">Reserva desde: {{ cnp.moneda }} {{ cnp.precio_desde }}</h2>',

});

Vue.component('formapago',{
  props: ['hotel','hotelPaymentTypes'],

  template: '<h2>Forma de pago</h2><ul v-for="hpt in hotelPaymentTypes" v-if="hpt.h==hotel.id"><li v-for="p in hpt.pt">{{ p }}</li></ul>',

});

Vue.component('amenities',{
  props: ['hotel','amenities'],

  template: '<h2>Amenitites</h2><div class="amenity" v-for="ame_hotel in hotel.hotel.amenity_ids"><span v-for="ame in amenities" v-if="ame.value==ame_hotel">{{ ame.label }}</span></div> ',

});


new Vue({
  el: '#app',
  data: {
    country:    0,
    province:   0,
    city:       0,
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

          for (h in this.hotels){
            hotel = this.hotels[h];            
            ptypes = [];
            for(p in hotel.payment_types){
              pt = hotel.payment_types[p];
              if(pt == 'prepaid'){
                if(hotel.max_installments_quantity == 1){
                  pt = 'prepaid_one_payment';
                } else {
                  pt = 'prepaid_installments';
                }
              }
              for( pp in this.payment_types){
                ppt = this.payment_types[pp];
                if(ppt.value==pt){
                  ptypes.push(ppt.label)
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
    this.city=4703;// mar de las pampas
  },

  methods: {

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

    getHotelsDetails: function() {
      var self = this;

      this.$http.post('proxy/', {'method':'hotels','qs':'?ids='+this.hotels_ids.toString()+'&language=es&options=amenities,fees,pictures,information,notices,room_types(amenities,pictures,information),extra_details'}, {'emulateJSON' : true}).then(
        function(response){
          self.hotels_details = response.data
        },
        this.errorCallback
      );
    },
    
    getAvailableHotels: function() {
      var self = this;
      
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
  

    successCallback: function(response) {
      return response.data
    },

    errorCallback: function(response) {
      // TODO: Add a popup with an error message.
      return null;
    },
  },
});
