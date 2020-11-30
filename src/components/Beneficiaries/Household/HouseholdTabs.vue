<template>
	<div>
		<b-tabs size="is-medium">
			<b-tab-item label="Household" icon="home">
				<Household ref="household" />
			</b-tab-item>
			<b-tab-item label="Household Head" icon="house-user">
				<HouseholdForm ref="householdForm" show-type-of-beneficiary />
			</b-tab-item>
			<b-tab-item label="Members" icon="users">
				<Members />
			</b-tab-item>
			<b-tab-item label="Summary" icon="list-alt">
				<Summary />
			</b-tab-item>
		</b-tabs>
		<div class="buttons flex-end">
			<b-button type="is-danger is-light">
				Close
			</b-button>
			<b-button @click="fetchHousehold" type="is-success">
				Next
			</b-button>
			<b-button v-if="isEditing" type="is-success">
				Update
			</b-button>
		</div>
	</div>
</template>

<script>
import HouseholdForm from "@/components/Beneficiaries/Household/HouseholdForm";
import Household from "@/components/Beneficiaries/Household/Household";
import Members from "@/components/Beneficiaries/Household/Members";
import Summary from "@/components/Beneficiaries/Household/Summary";

export default {
	name: "HouseholdTabs",

	props: {
		isEditing: Boolean,
	},

	components: {
		HouseholdForm,
		Household,
		Members,
		Summary,
	},

	data() {
		return {
			household: null,
			householdHead: null,
			householdMembers: null,
		};
	},

	methods: {
		fetchHousehold() {
			if (this.$refs.household.submit()) {
				this.household = this.$refs.household.formModel;
			}
		},

		fetchHouseholdHead() {
			if (this.$refs.householdHead.submit()) {
				this.householdHead = this.$refs.householdHead.formModel;
			}
		},

		fetchMembers() {
			this.householdMembers = this.$refs.householdMembers.members;
		},

		close() {
			this.$router.go(-1);
		},
	},
};
</script>
