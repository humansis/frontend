<template>
	<div>
		<AssistanceSummary
			:beneficiaries="beneficiaries"
			:assistance="assistance"
			:project="project"
		/>
		<b-steps
			v-if="isTargetHouseholdOrIndividual"
			v-model="activeStep"
			animated
			rounded
			has-navigation
		>
			<b-step-item clickable step="1" :label="$t('Assistance List of Beneficiaries')">
				<BeneficiariesList
					export-button
					add-button
					:assistance="assistance"
					@beneficiariesCounted="beneficiaries = $event"
				/>
			</b-step-item>

			<b-step-item clickable step="2" :label="$t('Import & Compare')">
				<ImportAndCompare />
			</b-step-item>

			<b-step-item clickable step="3" :label="$t('Export Random Sample')">
				<BeneficiariesList
					changeButton
					export-button
					:add-button="false"
					:assistance="assistance"
					@beneficiariesCounted="beneficiaries = $event"
				/>
			</b-step-item>

			<b-step-item clickable step="4" :label="$t('Validate and Lock')">
				<BeneficiariesList
					:add-button="false"
					:export-button="false"
					:assistance="assistance"
					@beneficiariesCounted="beneficiaries = $event"
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
				@beneficiariesCounted="beneficiaries = $event"
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
import AssistanceSummary from "@/components/Assistance/AssistanceSummary";
import BeneficiariesList from "@/components/Assistance/BeneficiariesList";
import ImportAndCompare from "@/components/Assistance/ImportAndCompare";
import AssistancesService from "@/services/AssistancesService";
import { Toast } from "@/utils/UI";
import ProjectService from "@/services/ProjectService";
import consts from "@/utils/assistanceConst";

export default {
	name: "AssistanceEdit",

	components: {
		AssistanceSummary,
		BeneficiariesList,
		ImportAndCompare,
	},

	data() {
		return {
			assistance: null,
			project: null,
			activeStep: 0,
			target: "",
			beneficiaries: 0,
			validateAssistanceButtonLoading: false,
			isTargetHouseholdOrIndividual: false,
		};
	},

	mounted() {
		this.fetchAssistance();
		this.fetchProject();
	},

	methods: {
		async fetchAssistance() {
			await AssistancesService.getDetailOfAssistance(
				this.$route.params.assistanceId,
			).then((data) => {
				this.isTargetHouseholdOrIndividual = data.target === consts.TARGET.HOUSEHOLD
					|| data.target === consts.TARGET.INDIVIDUAL;

				this.assistance = data;
			});
		},

		async fetchProject() {
			await ProjectService.getDetailOfProject(
				this.$route.params.projectId,
			).then(({ data }) => {
				this.project = data;
			});
		},

		async validateAssistance() {
			const assistanceId = Number(this.$route.params.assistanceId);
			this.validateAssistanceButtonLoading = true;

			await AssistancesService.updateAssistanceToStatusValidated(
				{ assistanceId, validated: true },
			).then(({ status }) => {
				if (status === 200) {
					Toast(this.$t("Assistance Successfully Validated and Locked"), "is-success");
					this.$router.push({ name: "Project",
						params: {
							projectId: this.$route.params.projectId,
						},
					});
				}
			}).catch((e) => {
				Toast(`${this.$t("Assistance")} ${e}`, "is-danger");
			});

			this.validateAssistanceButtonLoading = false;
		},
	},
};
</script>
