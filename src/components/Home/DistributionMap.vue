<template>
	<div>
		<h2 class="title">Distribution Map</h2>
		<LMap :zoom="zoom" :center="center">
			<LTileLayer :url="url" :attribution="attribution"></LTileLayer>
			<LMarker :lat-lng="marker"></LMarker>
		</LMap>
	</div>
</template>

<script>

import { LMap, LTileLayer, LMarker } from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default {
	name: "DistributionMap",
	components: {
		LMap,
		LTileLayer,
		LMarker,
	},
	data() {
		return {
			map: null,
			zoom: 13,
			center: L.latLng(47.41322, -1.219482),
			url: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
			attribution:
		'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
			marker: L.latLng(47.41322, -1.219482),
		};
	},
};
</script>

<style lang="scss" scoped>
	.vue2leaflet-map{
		height: 400px;
	}
</style>
