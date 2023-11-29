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

		<UpcomingAssistances />
	</v-container>
</template>

<script>
import DistributionMap from "@/components/Home/DistributionMap";
import Summary from "@/components/Home/Summary";
import UpcomingAssistances from "@/components/Home/UpcomingAssistances";
import vuetifyHelper from "@/mixins/vuetifyHelper";

export default {
	name: "HomePage",

	components: {
		DistributionMap,
		HomeSummary: Summary,
		UpcomingAssistances,
	},

	mixins: [vuetifyHelper],
};
</script>
