<template>
	<div>
		<AssistanceSummary
			:assistance="assistance"
			:is-statistics-loading="isStatisticsLoading"
			:statistics="statistics"
			:is-assistance-loading="isAssistanceLoading"
			:commodities="commodities"
			:project="project"
			:is-project-loading="isProjectLoading"
		/>

		<EditNote :assistance="assistance" />

		<b-steps
			v-if="isTargetHouseholdOrIndividual"
			v-model="activeStep"
			animated
			rounded
			has-navigation
		>
			<b-step-item clickable step="1" :label="$t('Assistance List of Beneficiaries')">
				<BeneficiariesList
					ref="assistanceListOfBeneficiariesGrid"
					export-button
					add-button
					:assistance="assistance"
					:commodities="commodities"
					@assistanceUpdated="fetchUpdatedData"
				/>
			</b-step-item>

			<b-step-item clickable step="2" :label="$t('Import & Compare')">
				<ImportAndCompare />
			</b-step-item>

			<b-step-item clickable step="3" :label="$t('Export Random Sample')">
				<BeneficiariesList
					ref="exportRandomSampleGrid"
					changeButton
					export-button
					:add-button="false"
					:assistance="assistance"
					:commodities="commodities"
				/>
			</b-step-item>

			<b-step-item clickable step="4" :label="$t('Validate and Lock')">
				<BeneficiariesList
					ref="validateAndLockGrid"
					:add-button="false"
					export-button
					:assistance="assistance"
					:commodities="commodities"
				/>
			</b-step-item>

			<template #navigation="{previous, next}">
				<div class="buttons flex-end">
					<b-button
						v-show="!previous.disabled"
						@click.prevent="previous.action"
					>
						{{ $t('Back') }}
					</b-button>
					<b-button
						type="is-primary"
						v-show="!next.disabled"
						@click.prevent="next.action"
					>
						{{ $t('Next') }}
					</b-button>
					<b-button
						v-show="activeStep === 3"
						type="is-primary"
						icon-right="lock"
						:loading="validateAssistanceButtonLoading"
						@click.prevent="validateAssistance"
					>
						{{ $t('Validate and Lock') }}
					</b-button>
				</div>
			</template>
		</b-steps>
		<div v-if="!isTargetHouseholdOrIndividual">
			<BeneficiariesList
				:assistance="assistance"
				:commodities="commodities"
				@assistanceUpdated="fetchUpdatedData"
			/>
			<div class="buttons mt-3 flex-end">
				<b-button
					v-if="assistance"
					type="is-primary"
					icon-right="lock"
					:loading="validateAssistanceButtonLoading"
					@click.prevent="validateAssistance"
				>
					{{ $t('Validate and Lock') }}
				</b-button>
			</div>
		</div>
	</div>
</template>

<script>
import AssistanceSummary from "@/components/Assistance/AssistanceSummary/index";
import BeneficiariesList from "@/components/Assistance/BeneficiariesList";
import ImportAndCompare from "@/components/Assistance/ImportAndCompare";
import AssistancesService from "@/services/AssistancesService";
import EditNote from "@/components/Assistance/EditNote";
import { Notification, Toast } from "@/utils/UI";
import ProjectService from "@/services/ProjectService";
import consts from "@/utils/assistanceConst";

export default {
	name: "AssistanceEdit",

	components: {
		AssistanceSummary,
		BeneficiariesList,
		ImportAndCompare,
		EditNote,
	},

	data() {
		return {
			assistance: null,
			project: null,
			statistics: null,
			isStatisticsLoading: false,
			isAssistanceLoading: false,
			isProjectLoading: false,
			commodities: [],
			activeStep: 0,
			target: "",
			validateAssistanceButtonLoading: false,
			isTargetHouseholdOrIndividual: false,
		};
	},

	mounted() {
		this.fetchAssistance();
		this.fetchProject();
		this.fetchAssistanceStatistics();
	},

	methods: {
		async fetchAssistance() {
			this.isAssistanceLoading = true;

			try {
				const { data } = 	await AssistancesService.getDetailOfAssistance(
					this.$route.params.assistanceId,
				);

				this.isTargetHouseholdOrIndividual = data.target === consts.TARGET.HOUSEHOLD
					|| data.target === consts.TARGET.INDIVIDUAL;

				this.assistance = data;

				if (this.assistance.type === consts.TYPE.DISTRIBUTION) {
					this.commodities = data.commodities;
				}
			} catch (e) {
				if (e.message) Notification(`${this.$t("Assistance")} ${e}`, "is-danger");
			} finally {
				this.isAssistanceLoading = false;
			}
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

			try {
				const { data } = await AssistancesService.getAssistanceStatistics(
					this.$route.params.assistanceId,
				);

				this.statistics = data;
			} catch (e) {
				if (e.message) Notification(`${this.$t("Assistance Statistics")} ${e}`, "is-danger");
			} finally {
				this.isStatisticsLoading = false;
			}
		},

		updateBeneficiariesTable(beneficiariesTable) {
			this.beneficiariesData = beneficiariesTable;
		},

		async validateAssistance() {
			const assistanceId = Number(this.$route.params.assistanceId);
			this.validateAssistanceButtonLoading = true;

			try {
				const { status } = await AssistancesService.updateAssistanceStatusValidated(
					{ assistanceId, validated: true },
				);

				if (status === 200) {
					Toast(this.$t("Assistance Successfully Validated and Locked"), "is-success");

					await this.$router.push({
						name: "AssistanceDetail",
						params: {
							assistanceId: this.$route.params.assistanceId,
						},
					});
				}
			} catch (e) {
				if (e.message) Toast(`${this.$t("Assistance")} ${e}`, "is-danger");
			}
			this.validateAssistanceButtonLoading = false;
		},

		fetchUpdatedData() {
			this.fetchAssistance();
			this.fetchAssistanceStatistics();
		},
	},
};
</script>
