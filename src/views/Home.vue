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

		<UpcomingAssistances />
	</div>
</template>

<script>
import UpcomingAssistances from "@/components/Home/UpcomingAssistances";
import DistributionMap from "@/components/Home/DistributionMap";
import Summary from "@/components/Home/Summary";

export default {
	name: "Home",

	components: {
		DistributionMap,
		Summary,
		UpcomingAssistances,
	},
};
</script>
