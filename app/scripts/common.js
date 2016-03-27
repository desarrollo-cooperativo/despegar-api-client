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

Vue.component('modal', {
  template: '#modal',
  props: {
    show: {
      type: Boolean,
      required: true,
      twoWay: true
    }
  }
});
