<template>
	<div>
		<AssistanceSummary :beneficiaries="beneficiaries" />
		<b-steps
			v-model="activeStep"
			animated
			rounded
			has-navigation
		>
			<b-step-item
				clickable
				step="1"
				label="Assistance List Of Beneficiaries"
			>
				<BeneficiariesList
					export-button
					add-button
					:change-button="false"
					@beneficiariesCounted="beneficiaries = $event"
					@onBeneficiaryListChange="beneficiaryListChanged"
				/>
			</b-step-item>

			<b-step-item
				clickable
				step="2"
				label="Import & Compare"
			>
				<ImportAndCompare />
			</b-step-item>

			<b-step-item
				clickable
				step="3"
				label="Export Random Sample"
			>
				<ExportRandomSample />
			</b-step-item>

			<b-step-item
				clickable
				step="4"
				label="Validate And Lock"
			>
				<ValidateAndLock />
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
						@click.prevent="previous.action"
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
						v-show="activeStep === 3"
						type="is-danger"
						icon-left="lock"
						@click.prevent="validate"
					>
						Validate
					</b-button>
				</div>
			</template>
		</b-steps>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import AssistanceSummary from "@/components/Assistance/AssistanceSummary";
import BeneficiariesList from "@/components/Assistance/BeneficiariesList";
import ImportAndCompare from "@/components/Assistance/ImportAndCompare";
import ExportRandomSample from "@/components/Assistance/ExportRandomSample";
import ValidateAndLock from "@/components/Assistance/ValidateAndLock";
import AssistancesService from "@/services/AssistancesService";
import { Toast, Notification } from "@/utils/UI";

export default {
	name: "AddAssistanceUpdate",

	components: {
		AssistanceSummary,
		BeneficiariesList,
		ImportAndCompare,
		ExportRandomSample,
		ValidateAndLock,
	},

	data() {
		return {
			activeStep: 0,
			target: "",
			assistance: {},
			beneficiaries: 0,
			changedBeneficiaryList: false,
		};
	},

	mounted() {
		// TODO If method with persisted state was accepted. Create method for refresh and erase state
		this.assistance = this.$store.state.assistance;
		this.target = this.assistance.target;
	},

	methods: {
		...mapActions(["removeAssistanceFromState"]),

		nextPage(next) {
			// TODO checkForms
			if (this.changedBeneficiaryList) {
				// TODO reload beneficiaries???
			}
			next.action();
		},

		async validate() {
			// TODO implement validate and lock method
			await AssistancesService.saveAssistance().then(({ status }) => {
				if (status === 200) {
					Toast("Assistance Successfully Saved and lock", "is-success");
					this.$router.go(-1);
				}
			}).catch((e) => {
				Notification(`Assistance ${e}`, "is-danger");
			});
		},

		beneficiaryListChanged() {
			this.changedBeneficiaryList = true;
		},
	},
};
</script>
