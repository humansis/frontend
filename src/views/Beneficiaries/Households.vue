<template>
	<div>
		<h2 class="title">Households</h2>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
		>
			Create
		</b-button>
		<HouseholdsList />
	</div>
</template>

<script>
import HouseholdsList from "@/components/Beneficiaries/HouseholdsList";

export default {
	name: "Households",

	components: {
		HouseholdsList,
	},

};
</script>
