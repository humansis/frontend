<template>
	<div>
		<AssistanceSummary
			ref="assistanceSummary"
			:beneficiaries="beneficiaries"
			@assistanceLoaded="assistanceLoaded"
		/>
		<div class="m-6">
			<div class="has-text-centered mb-3">
				<div class="subtitle">Assistance Progress: {{ assistanceProgress }} %</div>
			</div>
			<b-progress v-model="assistanceProgress" />
			<div class="columns">
				<div v-if="$refs.beneficiaries" class="column is-offset-3">
					<div class="has-text-weight-bold">Total Amount:</div>
					<span class="ml-5">{{ totalAmount }} {{ commodityUnit }}</span>
				</div>
				<div class="column">
					<div class="has-text-weight-bold">Amount Distributed:</div>
					<span class="ml-6">{{ amountDistributed }} {{ commodityUnit }}</span>
				</div>
			</div>
		</div>
		<BeneficiariesList
			ref="beneficiaries"
			export-button
			add-button
			with-checkbox
			:custom-columns="columns"
			:change-button="false"
			@beneficiariesCounted="beneficiaries = $event"
		/>
		<br>
		<div class="columns">
			<div class="column buttons">
				<b-button
					class="flex-end ml-5"
					type="is-primary"
					@click="closeAssistance"
				>
					Close Assistance
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
			target: "",
			beneficiaries: 0,
			// TODO calculate progress and amountDistributed
			assistanceProgress: 20,
			amountDistributed: 200,
			commodity: [],
			columns: [
				{ key: "id", label: "Beneficiary ID", sortable: true },
				{ key: "givenName", label: "First Name", sortable: true, sortKey: "localGivenName" },
				{ key: "familyName", label: "Family Name", sortable: true, sortKey: "localFamilyName" },
				{ key: "nationalId", label: "National ID", sortable: true },
				{ key: "distributed" },
				{ key: "value" },
			],
		};
	},

	computed: {
		commodityUnit() {
			if (this.commodity.length) {
				return this.commodity[0].unit;
			}
			return "";
		},

		totalAmount() {
			if (this.$refs.beneficiaries) {
				return this.$refs.beneficiaries.table.total * this.commodity[0].value;
			}
			return null;
		},
	},

	async mounted() {
		await this.fetchCommodity();
	},

	methods: {
		assistanceLoaded(assistance) {
			this.target = assistance.target;
		},

		async fetchCommodity() {
			await AssistancesService.getAssistanceCommodities(this.$route.params.assistanceId)
				.then(({ data }) => { this.commodity = data; })
				.catch((e) => {
					Notification(`Commodities ${e}`, "is-danger");
				});
		},

		closeAssistance() {
			this.$buefy.dialog.confirm({
				title: "Close Assistance",
				message: "Are You Sure You Want To Close This Assistance?",
				confirmText: "Confirm",
				type: "is-primary",
				onConfirm: async () => {
					const assistanceId = Number(this.$route.params.assistanceId);

					await AssistancesService.updateAssistanceToStatusCompleted(
						{ assistanceId, completed: true },
					).then(({ status }) => {
						if (status === 200) {
							Toast("Assistance Successfully Closed", "is-success");
							this.$router.push({ name: "ProjectDetail",
								params: {
									projectId: this.$route.params.projectId,
								},
							});
						}
					}).catch((e) => {
						Notification(`Assistance ${e}`, "is-danger");
					});
				},
			});
		},

		async fetchData() {
			return AssistancesService.getListOfBeneficiaries(
				this.$route.params.assistanceId,
				null,
				this.$refs.beneficiaries.table.totalCount,
			)
				.then(async ({ data }) => data)
				.catch((e) => {
					Notification(`Beneficiaries ${e}`, "is-danger");
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
