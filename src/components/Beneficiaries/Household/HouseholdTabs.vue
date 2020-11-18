<template>
	<div>
		<b-tabs size="is-medium">
			<b-tab-item
				label="Household"
				icon="home"
			>
				<Household />
			</b-tab-item>
			<b-tab-item
				label="Household Head"
				icon="house-user"
			>
				<HouseholdHead />
			</b-tab-item>
			<b-tab-item
				label="Members"
				icon="users"
			>
				<Members />
			</b-tab-item>
			<b-tab-item
				label="Summary"
				icon="list-alt"
			>
				<Summary />
			</b-tab-item>
		</b-tabs>
		<div class="has-text-right">
			<b-button
				type="is-success"
			>
				Next
			</b-button>
		</div>
	</div>
</template>

<script>
import Household from "@/components/Beneficiaries/Household/Household";
import HouseholdHead from "@/components/Beneficiaries/Household/HouseholdHead";
import Members from "@/components/Beneficiaries/Household/Members";
import Summary from "@/components/Beneficiaries/Household/Summary";

export default {
	name: "HouseholdTabs",

	components: {
		Household,
		HouseholdHead,
		Members,
		Summary,
	},
};
</script>
