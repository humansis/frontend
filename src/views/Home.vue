<template>
	<v-container fluid>
		<v-row :class="{ 'flex-column': isMobile }">
			<v-col class="mb-4">
				<DistributionMap />
			</v-col>

			<v-col class="mb-4">
				<HomeSummary />
			</v-col>
		</v-row>

		<AssistancesList upcoming />
	</v-container>
</template>

<script setup>
import DistributionMap from "@/components/Home/DistributionMap";
import HomeSummary from "@/components/Home/HomeSummary";
import AssistancesList from "@/components/Projects/AssistancesList";
import vuetifyHelper from "@/composables/vuetifyHelper";

const { isMobile } = vuetifyHelper();
</script>
