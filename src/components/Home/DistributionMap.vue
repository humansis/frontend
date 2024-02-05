<template>
	<h2 class="mb-4">{{ $t('Assistances Map')}}</h2>

	<v-sheet height="400">
		<LMap :zoom="getZoom" :center="getCenter">
			<LTileLayer :url="url" :attribution="attribution" />
		</LMap>
	</v-sheet>
</template>

<script>
import { mapState } from "vuex";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
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
				{
					country: "AFG",
					lat: 34.543896,
					lng: 69.160652,
					zoom: 6,
				},
				{
					country: "ZMB",
					lat: -13.1403507,
					lng: 27.8493049,
					zoom: 6,
				},
				{
					country: "YEM",
					lat: 15.369445,
					lng: 44.191006,
					zoom: 6,
				},
				{
					country: "COD",
					lat: -1,
					lng: 15,
					zoom: 6,
				},
				{
					country: "MDA",
					lat: 47.411631,
					lng: 28.369885,
					zoom: 6,
				},
				{
					country: "CZE",
					lat: 49.4350483,
					lng: 16.6761388,
					zoom: 6,
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
