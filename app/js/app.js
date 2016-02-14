new Vue({
  el: '#app',

  methods: {
    getPaises: function(e){

      e.preventDefault();

      Vue.http.headers.common['X-ApiKey'] = '9ed4efc320174f3e89ba157849a32923';
      
      this.$http.get('https://api.despegar.com/v3/countries?product=HOTELS&language=ES',function(data, status, request){
        alert('aaa');
      });
    },
  }
});
