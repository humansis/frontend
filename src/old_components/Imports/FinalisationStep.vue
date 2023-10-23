<template>
	<div>
		<div class="card">
			<div class="card-content">
				<div class="content">
					<table>
						<tbody>
							<tr>
								<td>{{ $t("Number of Households") }}:</td>
								<td class="has-text-right">
									<b-tag
										class="has-text-weight-bold"
										type="is-light"
										size="is-medium"
									>
										{{ totalEntries }}
									</b-tag>
								</td>
							</tr>
							<tr>
								<td>{{ $t("Corrected Errors") }}:</td>
								<td class="has-text-right">
									<b-tag
										class="has-text-weight-bold"
										type="is-success"
										size="is-medium"
									>
										{{ amountIntegrityCorrect }}
									</b-tag>
								</td>
							</tr>
							<tr>
								<td>{{ $t("Integrity Errors") }}:</td>
								<td class="has-text-right">
									<b-tag
										class="has-text-weight-bold"
										type="is-danger"
										size="is-medium"
									>
										{{ amountIntegrityFailed }}
									</b-tag>
								</td>
							</tr>
							<tr>
								<td>{{ $t("Duplicities Found") }}:</td>
								<td class="has-text-right">
									<b-tag
										class="has-text-weight-bold"
										type="is-warning"
										size="is-medium"
									>
										{{ amountIdentityDuplicities }}
									</b-tag>
								</td>
							</tr>
							<tr>
								<td>{{ $t("Duplicities Corrected/Merged") }}:</td>
								<td class="has-text-right">
									<b-tag
										class="has-text-weight-bold"
										type="is-success"
										size="is-medium"
									>
										{{ amountIdentityDuplicitiesResolved }}
									</b-tag>
								</td>
							</tr>
							<tr>
								<td>{{ $t("Similarities Found") }}:</td>
								<td class="has-text-right">
									<b-tag
										class="has-text-weight-bold"
										type="is-warning"
										size="is-medium"
									>
										{{ amountSimilarityDuplicities }}
									</b-tag>
								</td>
							</tr>
							<tr>
								<td>{{ $t("Similarities Corrected/Merged") }}:</td>
								<td class="has-text-right">
									<b-tag
										class="has-text-weight-bold"
										type="is-success"
										size="is-medium"
									>
										{{ amountSimilarityDuplicitiesResolved }}
									</b-tag>
								</td>
							</tr>
							<tr>
								<td>{{ $t("Households to Import") }}:</td>
								<td class="has-text-right">
									<b-tag
										class="has-text-weight-bold"
										type="is-success"
										size="is-medium"
									>
										{{ amountEntriesToImport }}
									</b-tag>
								</td>
							</tr>
							<tr>
								<td>{{ $t("Not Imported Rows") }}:</td>
								<td class="has-text-right">
									<b-tag
										class="has-text-weight-bold"
										type="is-warning"
										size="is-medium"
									>
										{{ notImportedRows.length }}
									</b-tag>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<hr>

				<div class="buttons mt-5 space-between">
					<b-button
						v-if="canCancelImport"
						type="is-light is-danger"
						icon-left="ban"
						@click="cancelImport"
					>
						{{ $t('Cancel Import') }}
					</b-button>
					<div>
						<b-button
							v-if="finalisationStepActive"
							type="is-primary"
							icon-right="save"
							:loading="changeStateButtonLoading"
							@click="approveAndSave"
						>
							{{ $t('Approve and Save') }}
						</b-button>
						<b-button
							v-if="finishedImport"
							type="is-primary"
							@click="$router.push({ name: 'Imports' })"
						>
							{{ $t('Back to Imports') }}
						</b-button>
						<b-button
							v-if="finishedImport"
							type="is-primary"
							@click="$router.push({ name: 'Households' })"
						>
							{{ $t('Go to Beneficiaries') }}
						</b-button>
						<b-button
							v-if="finishedImport && notImportedRows.length"
							type="is-info is-light"
							@click="showNotImportedRowsList"
						>
							{{ $t('Show Not Imported Rows') }} ({{ notImportedRows.length }})
						</b-button>
					</div>
				</div>
			</div>
		</div>
		<div v-if="notImportedRowsVisible" class="card">
			<div class="card-content">
				<div class="content">
					<h3 class="subtitle">{{ $t('Not Imported Rows') }}</h3>
					<table class="table">
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
										class="table-link"
										target="_blank"
										:to="{ name: 'EditHousehold', params: { householdId: item.householdId } }"
									>
										{{ item.householdId }}
									</router-link>
									<span v-else>{{ $t("None") }}</span>
								</td>
								<td>
									<span v-if="item.beneficiaryId">{{ item.beneficiaryId }}</span>
									<span v-else>{{ $t("None") }}</span>
								</td>
								<td>{{ item.failedAction }}</td>
								<td>{{ item.errorMessage }}</td>
								<td>
									<b-tooltip
										:label="item.enFamilyName || item.localFamilyName"
									>
										{{ item.localFamilyName || item.enFamilyName   }}
									</b-tooltip>
								</td>
								<td>
									<b-tooltip
										:label="item.enGivenName || item.localGivenName"
									>
										{{ item.localGivenName || item.enGivenName   }}
									</b-tooltip>
								</td>
								<td>
									<b-tooltip
										:label="item.enParentsName || item.localParentsName"
									>
										{{ item.localParentsName || item.enParentsName   }}
									</b-tooltip>
								</td>
								<td>{{ getIdCard(item.primaryIdCard) }}</td>
								<td>{{ getIdCardType(item.primaryIdCard) }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
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
			required: false,
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
		approveAndSave() {
			this.$emit("changeImportState", {
				state: IMPORT.STATUS.IMPORTING,
				successMessage: "Approved and Saved",
				goNext: false,
			});
		},

		showNotImportedRowsList() {
			this.notImportedRowsVisible = true;
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

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
