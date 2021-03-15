<template>
	<div>
		<h1 class="title">Add Household</h1>
		<HouseholdTabs :is-editing="false" />
	</div>
</template>

<script>
import HouseholdTabs from "@/components/Beneficiaries/Household/HouseholdTabs";

export default {
	name: "AddHousehold",

	components: {
		HouseholdTabs,
	},
};
</script>
