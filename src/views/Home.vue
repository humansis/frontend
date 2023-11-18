<template>
	<v-container fluid>
		<v-row>
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

export default {
	name: "HomePage",

	components: {
		DistributionMap,
		HomeSummary: Summary,
		UpcomingAssistances,
	},
};
</script>
