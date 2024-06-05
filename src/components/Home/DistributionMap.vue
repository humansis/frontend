<template>
	<h2 class="mb-4">{{ $t('Assistances Map')}}</h2>

	<v-sheet height="400">
		<LMap :zoom="getZoom" :center="getCenter">
			<LTileLayer
				:url="HOME.DISTRIBUTION_MAP.URL"
				:attribution="HOME.DISTRIBUTION_MAP.ATTRIBUTION"
			/>
		</LMap>
	</v-sheet>
</template>

<script setup>
import { computed } from "vue";
import { HOME } from "@/consts";
import getters from "@/store/getters";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

const countryIso3 = computed(() => getters.getCountryFromVuexStorage().iso3);

const getCenter = computed(() => {
	const { lat, lng } = HOME.DISTRIBUTION_MAP.POSITIONS.find(
		({ country }) => country === countryIso3.value,
	) || {};

	return L.latLng(lat, lng);
});

const getZoom = computed(() => {
	const { zoom } = HOME.DISTRIBUTION_MAP.POSITIONS.find(
		({ country }) => country === countryIso3.value,
	) || {};

	return zoom ?? HOME.DISTRIBUTION_MAP.DEFAULT_ZOOM;
});
</script>
