<template>
	<div>
		<h2 class="title">{{ $t('Assistances Map')}}</h2>
		<LMap :zoom="getZoom" :center="getCenter">
			<LTileLayer :url="url" :attribution="attribution" />
		</LMap>
	</div>
</template>

<script>
import { LMap, LTileLayer } from "vue2-leaflet";
import { mapState } from "vuex";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

export default {
	name: "DistributionMap",

	components: {
		LMap,
		LTileLayer,
	},

	data() {
		return {
			map: null,
			zoom: 7,
			url: "https://{s}.tile.osm.org/{z}/{x}/{y}.png",
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
			positions: [
				{
					country: "KHM",
					lat: 13.5066394,
					lng: 104.869423,
					zoom: 7,
				},
				{
					country: "SYR",
					lat: 34.6401861,
					lng: 39.0494106,
					zoom: 7,
				},
				{
					country: "UKR",
					lat: 49.4871968,
					lng: 31.2718321,
					zoom: 6,
				},
				{
					country: "ETH",
					lat: 10.2116702,
					lng: 38.6521203,
					zoom: 6,
				},
				{
					country: "MNG",
					lat: 46.8250388,
					lng: 103.8499736,
					zoom: 5,
				},
				{
					country: "ARM",
					lat: 40.7696272,
					lng: 44.6736646,
					zoom: 7,
				},
			],

		};
	},

	computed: {
		...mapState(["country"]),

		getCenter() {
			const { lat, lng } = this.positions.find(
				({ country }) => country === this.country.iso3,
			) || {};
			return L.latLng(lat, lng);
		},

		getZoom() {
			const { zoom } = this.positions.find(
				({ country }) => country === this.country.iso3,
			) || {};
			return zoom ?? 7;
		},
	},
};
</script>

<style scoped>
.vue2leaflet-map{
	height: 400px;
}
</style>
