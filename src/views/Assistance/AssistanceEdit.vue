<template>
	<v-container fluid>
		<AssistanceSummary
			:assistance="assistance"
			:is-statistics-loading="isStatisticsLoading"
			:statistics="statistics"
			:is-assistance-loading="isAssistanceLoading"
			:commodities="commodities"
			:project="project"
			:is-project-loading="isProjectLoading"
		/>

		<EditNote :assistance="assistance" class="mb-5" />

		<v-stepper
			v-if="isTargetHouseholdOrIndividual"
			v-model="activeStep"
			:items="steps"
			show-actions
			editable
			hide-actions
			class="assistance mt-6"
		>

			<template v-slot:icon="{ step }">
				<v-icon v-if="step === 1" icon="1" />

				<v-icon v-else-if="step === 2" icon="2" />

				<v-icon v-else-if="step === 3" icon="3" />

				<v-icon v-else icon="4" />
			</template>

			<template v-slot:item.1>
				<BeneficiariesList
					ref="assistanceListOfBeneficiariesGrid"
					export-button
					add-button
					:assistance="assistance"
					:commodities="commodities"
					@assistanceUpdated="fetchUpdatedData"
				/>
			</template>

			<template v-slot:item.2>
				<ImportAndCompare />
			</template>

			<template v-slot:item.3>
				<BeneficiariesList
					ref="exportRandomSampleGrid"
					changeButton
					export-button
					:add-button="false"
					:assistance="assistance"
					:commodities="commodities"
					@assistanceUpdated="fetchUpdatedData"
				/>
			</template>

			<template v-slot:item.4>
				<BeneficiariesList
					ref="validateAndLockGrid"
					:add-button="false"
					export-button
					:assistance="assistance"
					:commodities="commodities"
					@assistanceUpdated="fetchUpdatedData"
				/>
			</template>
		</v-stepper>

		<BeneficiariesList
			v-if="!isTargetHouseholdOrIndividual"
			:assistance="assistance"
			:commodities="commodities"
			default-sort-direction="asc"
			default-sort-column="name"
			export-button
			@assistanceUpdated="fetchUpdatedData"
		/>

		<div class="d-flex justify-end mt-5">
			<v-btn
				v-if="isBackButtonVisible"
				size="small"
				color="blue-grey-lighten-4"
				variant="elevated"
				prepend-icon="arrow-left"
				class="text-none mr-3"
				@click="backStep"
			>
				{{ $t('Back') }}
			</v-btn>

			<v-btn
				v-if="isNextButtonVisible"
				color="primary"
				size="small"
				append-icon="arrow-right"
				class="text-none"
				@click="nextStep"
			>
				{{ $t('Next') }}
			</v-btn>

			<v-btn
				v-if="isValidateAndLockButtonVisible"
				:loading="validateAssistanceButtonLoading"
				color="primary"
				size="small"
				append-icon="lock"
				class="text-none"
				@click="validateAssistance"
			>
				{{ $t('Validate and Lock') }}
			</v-btn>
		</div>
	</v-container>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import ProjectService from "@/services/ProjectService";
import AssistanceSummary from "@/components/Assistance/AssistanceSummary";
import BeneficiariesList from "@/components/Assistance/BeneficiariesList";
import ImportAndCompare from "@/components/Assistance/ImportAndCompare";
import EditNote from "@/components/Inputs/EditNote";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";

export default {
	name: "AssistanceEdit",

	components: {
		ImportAndCompare,
		AssistanceSummary,
		BeneficiariesList,
		EditNote,
	},

	data() {
		return {
			steps: [
				"Assistance List of Beneficiaries",
				"Import&Compare",
				"Export Random Sample",
				"Validate and Lock",
			],
			assistance: null,
			project: null,
			statistics: null,
			isStatisticsLoading: false,
			isAssistanceLoading: false,
			isProjectLoading: false,
			commodities: [],
			activeStep: 1,
			target: "",
			validateAssistanceButtonLoading: false,
			isTargetHouseholdOrIndividual: false,
		};
	},

	computed: {
		isNextButtonVisible() {
			return this.activeStep < this.steps.length && this.isTargetHouseholdOrIndividual;
		},

		isBackButtonVisible() {
			return this.activeStep > 1 && this.isTargetHouseholdOrIndividual;
		},

		isValidateAndLockButtonVisible() {
			return this.activeStep === this.steps.length || !this.isTargetHouseholdOrIndividual;
		},
	},

	mounted() {
		this.fetchAssistance();
		this.fetchProject();
		this.fetchAssistanceStatistics();
	},

	methods: {
		async fetchAssistance() {
			this.isAssistanceLoading = true;

			await AssistancesService.getDetailOfAssistance(
				this.$route.params.assistanceId,
			).then((data) => {
				this.isTargetHouseholdOrIndividual = data.target === ASSISTANCE.TARGET.HOUSEHOLD
					|| data.target === ASSISTANCE.TARGET.INDIVIDUAL;

				this.assistance = data;

				if (this.assistance.type === ASSISTANCE.TYPE.DISTRIBUTION) {
					this.commodities = data.commodities;
				}
			}).finally(() => {
				this.isAssistanceLoading = false;
			});
		},

		async fetchProject() {
			this.isProjectLoading = true;

			await ProjectService.getDetailOfProject(
				this.$route.params.projectId,
			).then(({ data }) => {
				this.project = data;
			}).finally(() => {
				this.isProjectLoading = false;
			});
		},

		async fetchAssistanceStatistics() {
			this.isStatisticsLoading = true;

			await AssistancesService.getAssistanceStatistics(
				this.$route.params.assistanceId,
			).then((data) => {
				this.statistics = data;
			}).finally(() => {
				this.isStatisticsLoading = false;
			});
		},

		updateBeneficiariesTable(beneficiariesTable) {
			this.beneficiariesData = beneficiariesTable;
		},

		async validateAssistance() {
			const assistanceId = Number(this.$route.params.assistanceId);
			this.validateAssistanceButtonLoading = true;

			await AssistancesService.updateAssistanceStatusValidated(
				{ assistanceId, validated: true },
			).then(({ status }) => {
				if (status === 200) {
					Notification(this.$t("Assistance Successfully Validated and Locked"), "success");

					this.$router.push({
						name: "AssistanceDetail",
						params: {
							assistanceId: this.$route.params.assistanceId,
						},
					});
				}
			}).catch((e) => {
				Notification(`${this.$t("Assistance")} ${e}`, "error");
			});

			this.validateAssistanceButtonLoading = false;
		},

		fetchUpdatedData() {
			this.fetchAssistance();
			this.fetchAssistanceStatistics();
		},

		nextStep() {
			this.activeStep = this.activeStep >= this.steps.length
				? this.activeStep
				: this.activeStep + 1;
		},

		backStep() {
			this.activeStep = this.activeStep <= 1
				? this.activeStep
				: this.activeStep + -1;
		},
	},
};
</script>

<style lang="scss">
.assistance .v-stepper-item--selected .v-stepper-item__avatar.v-avatar {
	background-color: rgb(7, 79, 96);
}
</style>
