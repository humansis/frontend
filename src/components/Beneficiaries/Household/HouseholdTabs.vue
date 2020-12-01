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

	components: {
		HouseholdForm,
		Household,
		Members,
		Summary,
	},

	data() {
		return {
			activeStep: 0,
		};
	},

	methods: {
		nextPage(next) {
			// TODO checkForms
			next.action();
		},

		previousPage(previous) {
			previous.action();
		},
	},
};
</script>
