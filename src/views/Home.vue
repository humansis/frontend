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
		<UpcomingDistributions />
	</div>
</template>

<script>
import DistributionMap from "@/components/Home/DistributionMap";
import Summary from "@/components/Home/Summary";
import ProjectsSummary from "@/components/Projects/ProjectsSummary";
import UpcomingDistributions from "@/components/Home/UpcomingDistributions";

export default {
	name: "Home",
	components: {
		DistributionMap,
		Summary,
		UpcomingDistributions,
		ProjectsSummary,
	},
};
</script>
