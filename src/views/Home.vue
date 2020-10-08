<template>
	<div>
		<div class="columns">
			<div class="column is-three-fifths">
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
import DistributionMap from "@/components/Home/DistributionMap";
import Summary from "@/components/Home/Summary";
import ProjectsSummary from "@/components/Projects/ProjectsSummary";
import UpcomingAssistances from "@/components/Home/UpcomingAssistances";

export default {
	name: "Home",
	components: {
		DistributionMap,
		Summary,
		UpcomingAssistances,
		ProjectsSummary,
	},
};
</script>
