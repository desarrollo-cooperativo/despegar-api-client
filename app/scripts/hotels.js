// Vue.component('detallesprincipales',{
//   props: ['hotel','hotelsDetails'],
//
//   template: '<div v-for="hot in hotelsDetails" v-if="hot.id==hotel.id" class="hotel-desc "><div class="hotel-address" data-lat="{{ hot.location.latitude }}" data-lon="{{ hot.location.longitude }}"><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span> {{ hot.location.address }}</div><div>{{ hot.information.es }}</div></div>',
//
// });
//
// Vue.component('preciodesde',{
//   props: ['hotel','cheapestNightPrices'],
//
//   template: '<div class="btn btn-danger btn-lg" v-on:click="getHotelAvailability" v-for="cnp in cheapestNightPrices" v-if="cnp.h==hotel.id">Reserva desde: {{ cnp.moneda }} {{ cnp.precio_desde.toFixed(2) }}</div>',
//
//   methods: {
//     startReservation: function() {
//       this.$dispatch('startReservation', this.hotel.id);
//     },
//
//     getHotelAvailability: function(id){
//       this.$dispatch('getHotelAvailability', this.hotel.id);
//     }
//   }
// });
//
// Vue.component('formapago',{
//   props: ['hotel','hotelPaymentTypes'],
//
//   template: '<div class="forma_de_pago"><strong>Forma de pago: <span v-for="hpt in hotelPaymentTypes" v-if="hpt.h==hotel.id"><span v-for="p in hpt.pt">{{ p }}</span></span></strong></div>',
//
// });
//
// Vue.component('amenities',{
//   props: ['hotel','amenities'],
//
//   template: '<div class"amenities"><h2>Amenities</h2><div class="amenity btn btn-warning btn-xs" v-for="ame_hotel in hotel.hotel.amenity_ids"><span v-for="ame in amenities" v-if="ame.value==ame_hotel">{{ ame.label }}</span></div> </div>',
//
// });
