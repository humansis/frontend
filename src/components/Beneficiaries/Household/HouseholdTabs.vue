<template>
	<div>
		<b-steps
			v-model="activeStep"
			:animated="true"
			:rounded="true"
			:has-navigation="true"
		>
			<b-step-item step="1" label="Household">
				<Household />
			</b-step-item>

			<b-step-item step="2" label="Household Head">
				<HouseholdForm show-type-of-beneficiary />
			</b-step-item>

			<b-step-item step="3" label="Members">
				<Members />
			</b-step-item>

			<b-step-item step="4" label="Summary">
				<Summary />
			</b-step-item>

			<template
				v-if="true"
				slot="navigation"
				slot-scope="{previous, next}"
			>
				<div class="buttons flex-end">
					<b-button
						type="is-danger is-light"
						:disabled="previous.disabled"
						@click.prevent="previousPage(previous)"
					>
						Back
					</b-button>
					<b-button
						type="is-success"
						:disabled="next.disabled"
						@click.prevent="nextPage(next)"
					>
						Next
					</b-button>
					<b-button
						type="is-danger"
						icon-left="save"
					>
						Save
					</b-button>
				</div>
			</template>
		</b-steps>
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
