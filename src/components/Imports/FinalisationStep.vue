<template>
	<v-card class="pa-5">
		<table class="import-table">
			<tbody>
				<tr>
					<td>{{ $t("Number of Households") }}:</td>

					<td class="text-right">
						<v-chip
							variant="flat"
							color="blue-grey-lighten-4"
							class="font-weight-bold"
						>
							{{ totalEntries }}
						</v-chip>
					</td>
				</tr>

				<tr>
					<td>{{ $t("Corrected Errors") }}:</td>

					<td class="text-right">
						<v-chip
							variant="flat"
							color="success"
							class="font-weight-bold"
						>
							{{ amountIntegrityCorrect }}
						</v-chip>
					</td>
				</tr>

				<tr>
					<td>{{ $t("Integrity Errors") }}:</td>

					<td class="text-right">
						<v-chip
							variant="flat"
							color="error"
							class="font-weight-bold"
						>
							{{ amountIntegrityFailed }}
						</v-chip>
					</td>
				</tr>

				<tr>
					<td>{{ $t("Duplicities Found") }}:</td>

					<td class="text-right">
						<v-chip
							variant="flat"
							color="warning"
							class="font-weight-bold"
						>
							{{ amountIdentityDuplicities }}
						</v-chip>
					</td>
				</tr>

				<tr>
					<td>{{ $t("Duplicities Corrected/Merged") }}:</td>

					<td class="text-right">
						<v-chip
							variant="flat"
							color="success"
							class="font-weight-bold"
						>
							{{ amountIdentityDuplicitiesResolved }}
						</v-chip>
					</td>
				</tr>

				<tr>
					<td>{{ $t("Similarities Found") }}:</td>

					<td class="text-right">
						<v-chip
							variant="flat"
							color="warning"
							class="font-weight-bold"
						>
							{{ amountSimilarityDuplicities }}
						</v-chip>
					</td>
				</tr>

				<tr>
					<td>{{ $t("Similarities Corrected/Merged") }}:</td>

					<td class="text-right">
						<v-chip
							variant="flat"
							color="success"
							class="font-weight-bold"
						>
							{{ amountSimilarityDuplicitiesResolved }}
						</v-chip>
					</td>
				</tr>

				<tr>
					<td>{{ $t("Households to Import") }}:</td>

					<td class="text-right">
						<v-chip
							variant="flat"
							color="success"
							class="font-weight-bold"
						>
							{{ amountEntriesToImport }}
						</v-chip>
					</td>
				</tr>

				<tr>
					<td>{{ $t("Not Imported Rows") }}:</td>

					<td class="text-right">
						<v-chip
							variant="flat"
							color="warning"
							class="font-weight-bold"
						>
							{{ notImportedRows.length }}
						</v-chip>
					</td>
				</tr>
			</tbody>
		</table>

		<div class="d-flex ga-2 flex-wrap mt-4">
			<v-btn
				v-if="canCancelImport"
				color="warning"
				prepend-icon="ban"
				class="text-none"
				@click="onCancelImport"
			>
				{{ $t('Cancel Import') }}
			</v-btn>

			<v-btn
				v-if="finalisationStepActive"
				:loading="changeStateButtonLoading"
				color="primary"
				prepend-icon="save"
				class="text-none"
				@click="onApproveAndSave"
			>
				{{ $t('Approve and Save') }}
			</v-btn>

			<v-btn
				v-if="finishedImport"
				:to="{ name: 'Imports' }"
				color="primary"
				class="text-none"
			>
				{{ $t('Back to Imports') }}
			</v-btn>

			<v-btn
				v-if="finishedImport"
				:to="{ name: 'Households' }"
				color="primary"
				class="text-none"
			>
				{{ $t('Go to Beneficiaries') }}
			</v-btn>

			<v-btn
				v-if="finishedImport && notImportedRows.length"
				color="info"
				class="text-none"
				@click="notImportedRowsVisible = true"
			>
				{{ $t('Show Not Imported Rows') }} ({{ notImportedRows.length }})
			</v-btn>
		</div>

		<table v-if="notImportedRowsVisible" class="import-table mt-8">
			<thead>
				<tr>
					<th>{{ $t('Household ID') }}</th>

					<th>{{ $t('Beneficiary ID') }}</th>

					<th>{{ $t('Failed Action') }}</th>

					<th>{{ $t('Error Message') }}</th>

					<th>{{ $t('Family Name') }}</th>

					<th>{{ $t('Given Name') }}</th>

					<th>{{ $t('Parents Name') }}</th>

					<th>{{ $t('ID Number') }}</th>

					<th>{{ $t('ID Type') }}</th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="item of notImportedRows" :key="`item-${item.beneficiaryId}`">
					<td>
						<router-link
							v-if="item.householdId"
							:to="{ name: 'EditHousehold', params: { householdId: item.householdId } }"
							class="table-link"
							target="_blank"
						>
							{{ item.householdId }}
						</router-link>

						<span v-else>{{ $t("None") }}</span>
					</td>

					<td>
						<span v-if="item.beneficiaryId">
							{{ item.beneficiaryId }}
						</span>

						<span v-else>{{ $t("None") }}</span>
					</td>

					<td>{{ item.failedAction }}</td>

					<td>{{ item.errorMessage }}</td>

					<td>
						<v-tooltip
							:text="item.enFamilyName || item.localFamilyName"
							location="top"
						>
							<template v-slot:activator="{ props }">
								<span v-bind="props">
									{{ item.localFamilyName || item.enFamilyName }}
								</span>
							</template>
						</v-tooltip>
					</td>

					<td>
						<v-tooltip
							:text="item.enGivenName || item.localGivenName"
							location="top"
						>
							<template v-slot:activator="{ props }">
								<span v-bind="props">
									{{ item.localGivenName || item.enGivenName }}
								</span>
							</template>
						</v-tooltip>
					</td>

					<td>
						<v-tooltip
							:text="item.enParentsName || item.localParentsName"
							location="top"
						>
							<template v-slot:activator="{ props }">
								<span v-bind="props">
									{{ item.localParentsName || item.enParentsName }}
								</span>
							</template>
						</v-tooltip>
					</td>

					<td>{{ getIdCard(item.primaryIdCard) }}</td>

					<td>{{ getIdCardType(item.primaryIdCard) }}</td>
				</tr>
			</tbody>
		</table>
	</v-card>
</template>

<script>
import ImportService from "@/services/ImportService";
import { normalizeText } from "@/utils/datagrid";
import { IMPORT } from "@/consts";

export default {
	name: "FinalisationStep",

	props: {
		statistics: {
			type: Object,
			required: true,
		},

		status: {
			type: String,
			default: "",
		},

		loadingChangeStateButton: {
			type: Boolean,
			required: true,
		},
	},

	data() {
		return {
			importStatistics: {},
			importStatus: "",
			changeStateButtonLoading: false,
			notImportedRows: [],
			notImportedRowsVisible: false,
		};
	},

	computed: {
		finalisationStepActive() {
			return this.status === IMPORT.STATUS.IDENTITY_CHECK_CORRECT;
		},

		totalEntries() {
			return this.importStatistics?.totalEntries || 0;
		},

		amountIntegrityCorrect() {
			return this.importStatistics?.amountIntegrityCorrect || 0;
		},

		amountIntegrityFailed() {
			return this.importStatistics?.amountIntegrityFailed || 0;
		},

		amountIdentityDuplicities() {
			return this.importStatistics?.amountIdentityDuplicities || 0;
		},

		amountIdentityDuplicitiesResolved() {
			return this.importStatistics?.amountIdentityDuplicitiesResolved || 0;
		},

		amountSimilarityDuplicities() {
			return this.importStatistics?.amountSimilarityDuplicities || 0;
		},

		amountSimilarityDuplicitiesResolved() {
			return this.importStatistics?.amountSimilarityDuplicitiesResolved || 0;
		},

		amountEntriesToImport() {
			return this.importStatistics?.amountEntriesToImport || 0;
		},

		finishedImport() {
			if (!this.importStatus) return false;

			return this.importStatus === IMPORT.STATUS.FINISH
				|| this.importStatus === IMPORT.STATUS.IMPORTING
				|| this.importStatus === IMPORT.STATUS.CANCEL
				|| this.importStatus === IMPORT.STATUS.AUTOMATICALLY_CANCELED;
		},

		canCancelImport() {
			return this.importStatus
				&& this.importStatus !== IMPORT.STATUS.FINISH
				&& this.importStatus !== IMPORT.STATUS.CANCEL
				&& this.importStatus !== IMPORT.STATUS.AUTOMATICALLY_CANCELED
				&& this.importStatus !== IMPORT.STATUS.IMPORTING;
		},
	},

	watch: {
		statistics(value) {
			this.importStatistics = value;
		},

		loadingChangeStateButton(value) {
			this.changeStateButtonLoading = value;
		},

		status(value) {
			this.importStatus = value;
		},
	},

	mounted() {
		this.fetchImportNotImportedRows();
	},

	methods: {
		onApproveAndSave() {
			this.$emit("changeImportState", {
				state: IMPORT.STATUS.IMPORTING,
				successMessage: "Approved and Saved",
				goNext: false,
			});
		},

		fetchImportNotImportedRows() {
			const { importId } = this.$route.params;

			if (importId) {
				ImportService.getNotImportedRowsInImport(importId).then(({ data }) => {
					this.notImportedRows = data.data;
				});
			}
		},

		getIdCard(item) {
			return item?.id || this.$t("None");
		},

		getIdCardType(item) {
			return item?.type ? this.$t(normalizeText(item.type)) : this.$t("None");
		},

		onCancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
