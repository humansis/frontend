<template>
	<div>
		<AssistanceSummary
			:beneficiaries.sync="beneficiaries"
			:assistance.sync="assistance"
		/>
		<div class="m-6">
			<div class="has-text-centered mb-3">
				<div class="subtitle">
					{{ $t('Assistance Progress') }}: {{ assistanceProgress }} %
				</div>
			</div>
			<b-progress v-model="assistanceProgress" />
			<div class="columns">
				<div v-if="$refs.beneficiariesList" class="column is-offset-3">
					<div class="has-text-weight-bold">{{ $t('Total Amount') }}:</div>
					<span class="ml-5">{{ totalAmount }} {{ commodityUnit }}</span>
				</div>
				<div class="column">
					<div class="has-text-weight-bold">{{ $t('Amount Distributed') }}:</div>
					<span class="ml-6">{{ amountDistributed }} {{ commodityUnit }}</span>
				</div>
			</div>
		</div>
		<BeneficiariesList
			ref="beneficiariesList"
			export-button
			add-button
			isAssistanceDetail
			:assistance="assistance"
			:custom-columns="columns"
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
					{{ $t('Set As Distributed')}}
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

export default {
	name: "AssistanceDetail",

	components: {
		BeneficiariesList,
		AssistanceSummary,
	},

	data() {
		return {
			assistance: null,
			beneficiaries: 0,
			// TODO calculate progress and amountDistributed
			assistanceProgress: 20,
			amountDistributed: 200,
			commodity: [],
			columns: [
				{ key: "id", label: this.$t("Beneficiary ID"), sortable: true },
				{ key: "givenName", label: this.$t("First Name"), sortable: true, sortKey: "localGivenName" },
				{ key: "familyName", label: this.$t("Family Name"), sortable: true, sortKey: "localFamilyName" },
				{ key: "nationalId", label: this.$t("National ID"), sortable: true },
				{ key: "distributed", label: this.$t("Distributed") },
				{ key: "value", label: this.$t("Value") },
			],
			setAtDistributedButton: false,
		};
	},

	computed: {
		commodityUnit() {
			if (this.commodity.length) {
				return this.commodity[0].unit;
			}
			return "";
		},

		isAssistanceValidated() {
			return this.assistance?.validated;
		},

		totalAmount() {
			return this.$refs.beneficiariesList?.table.total * this.commodity?.[0]?.value ?? null;
		},
	},

	mounted() {
		this.fetchAssistance();
		this.fetchCommodity();
	},

	methods: {
		async fetchAssistance() {
			return AssistancesService.getDetailOfAssistance(
				this.$route.params.assistanceId,
			).then((data) => {
				this.assistance = data;
			});
		},

		onRowsCheck(rows) {
			this.setAtDistributedButton = !!rows?.length;
			this.selectedBeneficiaries = rows;
		},

		async setGeneralReliefItemAsDistributed() {
			let error = "";
			let success = "";

			if (this.selectedBeneficiaries?.length) {
				await Promise.all(this.selectedBeneficiaries.map(async (beneficiary) => {
					await AssistancesService.updateGeneralReliefItem(
						beneficiary.generalReliefItem.id, "distributed", true,
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
				.then(({ data }) => { this.commodity = data; })
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
								params: {
									projectId: this.$route.params.projectId,
								},
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
