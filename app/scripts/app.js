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
    from_date:  null,
    to_date:    null
  },

  created: function () {
    this.getCountries();
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

    successCallback: function(response) {
      return response.data
    },

    errorCallback: function(response) {
      // TODO: Add a popup with an error message.
      return null;
    },
  },
});
