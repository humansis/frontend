<template>
	<div>
		<AssistanceSummary
			:beneficiaries="beneficiaries"
			:assistance="assistance"
			:project="project"
		/>
		<div class="m-6">
			<div class="has-text-centered mb-3">
				<div class="subtitle">
					{{ $t(typeOfAssistance) }} {{ $t('Progress') }}: {{ assistanceProgress }} %
				</div>
			</div>
			<b-progress v-model="assistanceProgress" />
			<div class="columns">
				<div class="column is-3">
					<div class="has-text-weight-bold">
						{{ $t('Total Amount') }}:
					</div>
					<span>{{ totalAmount }} </span>
					<span v-if="assistanceUnit">{{ assistanceUnit }}</span>
				</div>
				<div class="column is-3">
					<div class="has-text-weight-bold">
						{{ $t('Amount') }} {{ $t(distributedOrCompleted) }}:
					</div>
					<span>{{ amountCompleted }} </span>
					<span v-if="assistanceUnit">{{ assistanceUnit }}</span>
				</div>
			</div>
		</div>
		<BeneficiariesList
			ref="beneficiariesList"
			export-button
			add-button
			isAssistanceDetail
			:assistance="assistance"
			:project="project"
			:change-button="false"
			@beneficiariesCounted="beneficiaries = $event"
			@rowsChecked="onRowsCheck"
		/>
		<br>
		<div class="columns">
			<div class="column buttons">
				<b-button
					v-if="isAssistanceValidated"
					class="flex-end ml-3"
					type="is-primary"
					icon-right="check"
					@click="closeAssistance"
				>
					{{ $t('Close Assistance') }}
				</b-button>
				<b-button
					v-if="setAtDistributedButton"
					class="flex-end ml-3"
					type="is-primary"
					icon-right="parachute-box"
					@click="setGeneralReliefItemAsDistributed"
				>
					{{ $t(setAtDistributedButtonLabel) }}
				</b-button>
			</div>
		</div>
	</div>
</template>

<script>
import AssistanceSummary from "@/components/Assistance/AssistanceSummary";
import BeneficiariesList from "@/components/Assistance/BeneficiariesList";
import AssistancesService from "@/services/AssistancesService";
import { Notification, Toast } from "@/utils/UI";
import ProjectService from "@/services/ProjectService";
import consts from "@/utils/assistanceConst";

export default {
	name: "AssistanceDetail",

	components: {
		BeneficiariesList,
		AssistanceSummary,
	},

	data() {
		return {
			assistance: null,
			project: null,
			beneficiaries: 0,
			assistanceProgress: 0,
			countOfCompleted: 0,
			commodities: [],
			setAtDistributedButton: false,
		};
	},

	computed: {
		assistanceUnit() {
			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) {
				return this.commodities?.[0]?.unit || "";
			}

			if (this.assistance?.type === consts.TYPE.ACTIVITY) return "Activity";

			return "";
		},

		setAtDistributedButtonLabel() {
			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) return "Set As Distributed";
			if (this.assistance?.type === consts.TYPE.ACTIVITY) return "Set As Completed";
			return "";
		},

		typeOfAssistance() {
			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) return "Distribution";
			if (this.assistance?.type === consts.TYPE.ACTIVITY) return "Activity";
			return "";
		},

		distributedOrCompleted() {
			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) return "Distributed";
			if (this.assistance?.type === consts.TYPE.ACTIVITY) return "Completed";
			return "";
		},

		isAssistanceValidated() {
			return this.assistance?.validated;
		},

		amountCompleted() {
			let result = 0;

			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) {
				result = this.commodities?.[0]?.value
					? this.commodities.[0].value * this.countOfCompleted : 0;
			}
			if (this.assistance?.type === consts.TYPE.ACTIVITY) {
				result = this.countOfCompleted;
			}

			return result;
		},

		totalAmount() {
			let result = 0;

			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) {
				if (this.$refs.beneficiariesList?.table.total && this.commodities?.[0]?.value) {
					result = this.$refs.beneficiariesList.table.total * this.commodities[0].value;
				}
			}
			if (this.assistance?.type === consts.TYPE.ACTIVITY) {
				return this.$refs.beneficiariesList.table.total;
			}

			return result;
		},
	},

	mounted() {
		this.fetchAssistance();
		this.fetchProject();
	},

	methods: {
		async fetchAssistance() {
			AssistancesService.getDetailOfAssistance(
				this.$route.params.assistanceId,
			).then((data) => {
				this.assistance = data;

				if (this.assistance.type === consts.TYPE.DISTRIBUTION) {
					this.fetchCommodity();
				}
			});
		},

		async fetchProject() {
			await ProjectService.getDetailOfProject(
				this.$route.params.projectId,
			).then(({ data }) => {
				this.project = data;
			});
		},

		onRowsCheck(rows) {
			this.setAtDistributedButton = !!rows?.length;
			this.selectedBeneficiaries = rows;
		},

		async setGeneralReliefItemAsDistributed() {
			const dateOfDistribution = new Date().toISOString();
			let error = "";
			let success = "";

			if (this.selectedBeneficiaries?.length) {
				await Promise.all(this.selectedBeneficiaries.map(async (beneficiary) => {
					await AssistancesService.updateGeneralReliefItem(
						beneficiary.generalReliefItem.id, true, dateOfDistribution,
					).then(({ status }) => {
						if (status === 200) {
							success += `${this.$t("Success for Beneficiary")} ${beneficiary.id}. `;
						}
					}).catch((e) => {
						error += `${this.$t("Error for Beneficiary")} ${beneficiary.id} ${e}. `;
					});
				}));

				if (error) Toast(error, "is-danger");
				if (success) Toast(success, "is-success");

				this.setAtDistributedButton = false;
				this.$refs.beneficiariesList.fetchData();
			}
		},

		async fetchCommodity() {
			await AssistancesService.getAssistanceCommodities(this.$route.params.assistanceId)
				.then(({ data }) => {
					this.commodities = data;
				})
				.catch((e) => {
					Notification(`${this.$t("Commodities")} ${e}`, "is-danger");
				});
		},

		closeAssistance() {
			this.$buefy.dialog.confirm({
				title: this.$t("Close Assistance"),
				message: this.$t("Are You Sure You Want To Close This Assistance?"),
				confirmText: this.$t("Confirm"),
				type: "is-primary",
				onConfirm: async () => {
					const assistanceId = Number(this.$route.params.assistanceId);

					await AssistancesService.updateAssistanceToStatusCompleted(
						{ assistanceId, completed: true },
					).then(({ status }) => {
						if (status === 200) {
							Toast(this.$t("Assistance Successfully Closed"), "is-success");
							this.$router.push({ name: "Project",
								params: { projectId: this.$route.params.projectId },
							});
						}
					}).catch((e) => {
						Toast(`${this.$t("Assistance")} ${e}`, "is-danger");
					});
				},
			});
		},
	},
};

</script>

<style scoped>
.buttons {
	text-align: right;
}
</style>
