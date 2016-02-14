new Vue({
  el: '#app',

  methods: {
    getPaises: function(e){
      Vue.http.headers.common['X-ApiKey'] = '9ed4efc320174f3e89ba157849a32923';
      e.preventDefault();
      this.$http.post('proxy/',{'method':'countries','qs':'?product=HOTELS&language=ES'},function(data, status, request){
        console.log(data);
      });
    },
  }
});
