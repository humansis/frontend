<template>
	<div style="width:400px; height: 400px">
		<l-map :zoom="zoom" :center="center">
			<l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
			<l-marker :lat-lng="marker"></l-marker>
		</l-map>
	</div>
</template>

<script>
import L from "leaflet";

export default {
	name: "DistributionMap",
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
