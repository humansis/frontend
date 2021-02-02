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
import UpcomingAssistances from "@/components/Home/UpcomingAssistances";
import DistributionMap from "@/components/Home/DistributionMap";
import ProjectsSummary from "@/components/Home/ProjectsSummary";
import Summary from "@/components/Home/Summary";

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
