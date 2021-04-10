<template>
	<div>
		<AssistanceSummary
			:beneficiaries="beneficiaries"
			:assistance="assistance"
			:project="project"
		/>
		<b-steps
			v-model="activeStep"
			animated
			rounded
			has-navigation
		>
			<b-step-item
				clickable
				step="1"
				:label="$t('Assistance List of Beneficiaries')"
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
				:label="$t('Import & Compare')"
			>
				<ImportAndCompare />
			</b-step-item>

			<b-step-item
				clickable
				step="3"
				:label="$t('Export Random Sample')"
			>
				<ExportRandomSample />
			</b-step-item>

			<b-step-item
				clickable
				step="4"
				:label="$t('Validate and Lock')"
			>
				<ValidateAndLock />
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
						@click.prevent="validateAssistance"
					>
						{{ $t('Validate and Lock') }}
					</b-button>
				</div>
			</template>
		</b-steps>
	</div>
</template>

<script>
import AssistanceSummary from "@/components/Assistance/AssistanceSummary";
import BeneficiariesList from "@/components/Assistance/BeneficiariesList";
import ImportAndCompare from "@/components/Assistance/ImportAndCompare";
import ExportRandomSample from "@/components/Assistance/ExportRandomSample";
import ValidateAndLock from "@/components/Assistance/ValidateAndLock";
import AssistancesService from "@/services/AssistancesService";
import { Toast } from "@/utils/UI";
import ProjectService from "@/services/ProjectService";

export default {
	name: "AssistanceEdit",

	components: {
		AssistanceSummary,
		BeneficiariesList,
		ImportAndCompare,
		ExportRandomSample,
		ValidateAndLock,
	},

	data() {
		return {
			assistance: null,
			project: null,
			activeStep: 0,
			target: "",
			beneficiaries: 0,
			changedBeneficiaryList: false,
		};
	},

	mounted() {
		this.fetchAssistance();
		this.fetchProject();
	},

	methods: {
		async fetchAssistance() {
			return AssistancesService.getDetailOfAssistance(
				this.$route.params.assistanceId,
			).then((data) => {
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
		},

		beneficiaryListChanged() {
			this.changedBeneficiaryList = true;
		},
	},
};
</script>
