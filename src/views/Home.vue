<template>
	<div>
		<DistributionMap />
		<Summary />
	</div>
</template>

<script>
import DistributionMap from "@/components/Home/DistributionMap";
import Summary from "@/components/Home/Summary";

export default {
	name: "Home",
	components: {
		DistributionMap,
		Summary,
	},
};
</script>
