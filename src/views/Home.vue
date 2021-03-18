<template>
	<div>
		<div class="columns is-multiline">
			<div class="column is-full is-half-fullhd">
				<DistributionMap />
			</div>

			<div class="column is-full is-half-fullhd">
				<Summary />
			</div>
		</div>

		<ProjectSummary />

		<UpcomingAssistances />
	</div>
</template>

<script>
import UpcomingAssistances from "@/components/Home/UpcomingAssistances";
import DistributionMap from "@/components/Home/DistributionMap";
import Summary from "@/components/Home/Summary";
import ProjectSummary from "@/components/Home/ProjectsSummary";

export default {
	name: "Home",

	components: {
		ProjectSummary,
		DistributionMap,
		Summary,
		UpcomingAssistances,
	},
};
</script>
