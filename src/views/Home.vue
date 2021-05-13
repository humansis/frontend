<template>
	<div>
		<div class="columns is-multiline">
			<div class="column">
				<DistributionMap />
			</div>

			<div class="column">
				<Summary />
			</div>
		</div>

		<ProjectsSummary />

		<UpcomingAssistances />
	</div>
</template>

<script>
import UpcomingAssistances from "@/components/Home/UpcomingAssistances";
import DistributionMap from "@/components/Home/DistributionMap";
import Summary from "@/components/Home/Summary";
import ProjectsSummary from "@/components/Home/ProjectsSummary";

export default {
	name: "Home",

	components: {
		ProjectsSummary,
		DistributionMap,
		Summary,
		UpcomingAssistances,
	},
};
</script>
