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
