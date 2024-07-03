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
			alt-labels
			class="assistance mt-6"
		>

			<template v-slot:title="{ title }">
				<p>{{ $t(title) }}</p>
			</template>

			<template v-slot:icon="{ step }">
				<v-icon :icon="`${step}`" />
			</template>

			<template v-slot:item.1>
				<BeneficiariesList
					ref="assistanceListOfBeneficiariesGrid"
					:assistance="assistance"
					:commodities="commodities"
					export-button
					add-button
					is-recalculation-button-visible
					is-custom-amount-box-visible
					@assistanceUpdated="onFetchUpdatedData"
				/>
			</template>

			<template v-slot:item.2>
				<ImportAndCompare />
			</template>

			<template v-slot:item.3>
				<BeneficiariesList
					ref="exportRandomSampleGrid"
					:add-button="false"
					:assistance="assistance"
					:commodities="commodities"
					change-button
					export-button
					@assistanceUpdated="onFetchUpdatedData"
				/>
			</template>

			<template v-slot:item.4>
				<BeneficiariesList
					ref="validateAndLockGrid"
					:add-button="false"
					:assistance="assistance"
					:commodities="commodities"
					export-button
					is-recalculation-button-visible
					@assistanceUpdated="onFetchUpdatedData"
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
			@assistanceUpdated="onFetchUpdatedData"
		/>

		<div class="d-flex justify-end mt-5">
			<v-btn
				v-if="isBackButtonVisible"
				color="blue-grey-lighten-4"
				variant="elevated"
				prepend-icon="arrow-left"
				class="text-none mr-3"
				@click="onBackStep"
			>
				{{ $t('Back') }}
			</v-btn>

			<v-btn
				v-if="isNextButtonVisible"
				color="primary"
				append-icon="arrow-right"
				class="text-none"
				@click="onNextStep"
			>
				{{ $t('Next') }}
			</v-btn>

			<v-btn
				v-if="isValidateAndLockButtonVisible"
				:loading="validateAssistanceButtonLoading"
				color="primary"
				append-icon="lock"
				class="text-none"
				@click="onValidateAssistance"
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
import { checkResponseStatus } from "@/utils/fetcher";
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

	async mounted() {
		await this.fetchAssistance();
		await this.fetchProject();
		await this.fetchAssistanceStatistics();
	},

	methods: {
		async fetchAssistance() {
			try {
				this.isAssistanceLoading = true;

				const {
					data,
					status,
					message,
				} = await AssistancesService.getDetailOfAssistance(
					this.$route.params.assistanceId,
				);

				checkResponseStatus(status, message);

				this.isTargetHouseholdOrIndividual = data.target === ASSISTANCE.TARGET.HOUSEHOLD
					|| data.target === ASSISTANCE.TARGET.INDIVIDUAL;

				this.assistance = data;

				if (this.assistance.type === ASSISTANCE.TYPE.DISTRIBUTION) {
					this.commodities = data.commodities;
				}

				if (this.assistance.state.code !== ASSISTANCE.STATUS.NEW) {
					await this.$router.push({
						name: "AssistanceDetail",
						params: { assistanceId: this.assistance.id },

					});
				}
			} catch (e) {
				Notification(`${this.$t("Assistance")}: ${e.message || e}`, "error");
			} finally {
				this.isAssistanceLoading = false;
			}
		},

		async fetchProject() {
			try {
				this.isProjectLoading = true;

				const {
					data,
					status,
					message,
				} = await ProjectService.getDetailOfProject(
					this.$route.params.projectId,
				);

				checkResponseStatus(status, message);

				this.project = data;
			} catch (e) {
				Notification(`${this.$t("Project")}: ${e.message || e}`, "error");
			} finally {
				this.isProjectLoading = false;
			}
		},

		async fetchAssistanceStatistics() {
			try {
				this.isStatisticsLoading = true;

				const {
					data,
					status,
					message,
				} = await AssistancesService.getAssistanceStatistics(
					this.$route.params.assistanceId,
				);

				checkResponseStatus(status, message);

				this.statistics = data;
			} catch (e) {
				Notification(`${this.$t("Assistance Statistics")}: ${e.message || e}`, "error");
			} finally {
				this.isStatisticsLoading = false;
			}
		},

		async onValidateAssistance() {
			const assistanceId = Number(this.$route.params.assistanceId);

			try {
				this.validateAssistanceButtonLoading = true;

				const {
					status,
					message,
				} = await AssistancesService.updateAssistanceStatusValidated({
					assistanceId,
					validated: true,
				});

				checkResponseStatus(status, message);

				Notification(this.$t("Assistance Successfully Validated and Locked"), "success");

				this.$router.push({
					name: "AssistanceDetail",
					params: {
						assistanceId: this.$route.params.assistanceId,
					},
				});
			} catch (e) {
				Notification(`${this.$t("Assistance")}: ${e.message || e}`, "error");
			} finally {
				this.validateAssistanceButtonLoading = false;
			}
		},

		onFetchUpdatedData() {
			this.fetchAssistance();
			this.fetchAssistanceStatistics();
		},

		onNextStep() {
			this.activeStep = this.activeStep >= this.steps.length
				? this.activeStep
				: this.activeStep + 1;
		},

		onBackStep() {
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
