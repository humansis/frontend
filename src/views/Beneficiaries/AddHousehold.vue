<template>
	<v-container fluid>
		<div class="d-flex mb-4">
			<h2 class="me-auto">{{ $t('Add Household') }}</h2>
		</div>

		<HouseholdTabs />
	</v-container>
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
