<template>
	<!-- TODO Implement else -->
	<div v-if="identityStepActive && status">
		<v-card class="pa-5">
			<div>
				<Loading v-if="isCheckingIdentity" is-large />

				<v-sheet
					v-if="amountIdentityDuplicitiesIncrement"
					color="grey-lighten-2"
					class="d-flex my-4 rounded-xl overflow-hidden import-progress-bar"
				>
					<v-sheet
						v-if="amountIdentityDuplicitiesResolved"
						color="success"
						:width="amountIdentityDuplicitiesResolvedWidth"
					>
						{{ amountIdentityDuplicitiesResolvedIncrement }}
					</v-sheet>

					<v-sheet
						v-if="amountIdentityDuplicities"
						color="warning"
						:width="amountIdentityDuplicitiesWidth"
					>
						{{ (amountIdentityDuplicitiesIncrement - amountIdentityDuplicitiesResolvedIncrement) }}
					</v-sheet>
				</v-sheet>

				<table class="import-table">
					<tbody>
						<tr>
							<td>{{ $t('Number of Households')}}:</td>

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
							<td>{{ $t('Duplicities Found')}}:</td>

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
							<td>{{ $t('Resolved Duplicities')}}:</td>

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
					</tbody>
				</table>

				<div class="d-flex flex-wrap ga-2 justify-space-between mt-4">
					<v-btn
						v-if="canCancelImport"
						color="error"
						prepend-icon="ban"
						class="text-none"
						@click="onCancelImport"
					>
						{{ $t('Cancel Import') }}
					</v-btn>

					<div class="d-flex flex-wrap ga-2">
						<v-btn
							v-if="amountIdentityDuplicities && canResolveDuplicities"
							:disabled="allRecordsFormLoading"
							:variant="isAllFromFileUnselected ? 'outlined' : 'elevated'"
							color="info"
							@click="onChangeBulkDuplicitiesStatus(IMPORT.ITEM_STATUS.TO_UPDATE)"
						>
							{{ $t('All From File') }}
						</v-btn>

						<v-btn
							v-if="amountIdentityDuplicities && canResolveDuplicities"
							:variant="isAllFromHumansisUnselected ? 'outlined' : 'elevated'"
							color="info"
							@click="onChangeBulkDuplicitiesStatus(IMPORT.ITEM_STATUS.TO_LINK)"
						>
							{{ $t('All From Humansis') }}
						</v-btn>

						<v-btn
							v-if="amountIdentityDuplicities && canResolveDuplicities"
							:loading="resolveDuplicitiesLoading"
							:disabled="duplicitiesContentOpened"
							:append-icon="!duplicitiesContentOpened ? 'arrow-down' : null"
							prepend-icon="tasks"
							variant="outlined"
							@click="onResolveDuplicities"
						>
							{{ $t('Manage Duplicities') }}
						</v-btn>
					</div>

					<div>
						<v-btn
							v-if="canGoToFinalisation"
							:loading="changeStateButtonLoading"
							:disabled="!canGoToFinalisation"
							color="primary"
							append-icon="play-circle"
							class="text-none"
							@click="onGoToFinalisation"
						>
							{{ $t('Go to Finalisation') }}
						</v-btn>
					</div>
				</div>
			</div>
		</v-card>

		<v-card v-if="duplicitiesContentOpened" class="pa-5 my-10">
			<DuplicityResolver
				ref="duplicityResolver"
				:header="$t('Duplicity Cases')"
				:is-duplicities-loading="resolveDuplicitiesLoading"
				:is-form-changes-loading="allRecordsFormLoading"
				@loaded="onDuplicityLoaded"
				@updated="onUpdate"
				@duplicitiesChange="onLoadDuplicities"
			/>
		</v-card>
	</div>
</template>

<script>
import ImportService from "@/services/ImportService";
import DuplicityResolver from "@/components/Imports/DuplicityResolver";
import Loading from "@/components/Loading";
import graduallyIncrement from "@/mixins/graduallyIncrement";
import { Notification } from "@/utils/UI";
import { IMPORT } from "@/consts";

export default {
	name: "IdentityStep",

	components: {
		DuplicityResolver,
		Loading,
	},

	mixins: [graduallyIncrement],

	props: {
		statistics: {
			type: Object,
			required: true,
		},

		loadingChangeStateButton: {
			type: Boolean,
			required: true,
		},

		status: {
			type: String,
			default: "",
		},
	},

	data() {
		return {
			IMPORT,
			importStatistics: {},
			duplicitiesContentOpened: false,
			file: {},
			changeStateButtonLoading: false,
			resolveDuplicitiesLoading: false,
			importStatus: "",
			duplicities: [],
			resolversAllLoading: false,
			resolversAllActive: "",
			allFromSolved: true,
			amountIdentityDuplicitiesIncrement: 0,
			amountIdentityDuplicitiesResolvedIncrement: 0,
		};
	},

	computed: {
		allRecordsFormLoading() {
			if (this.resolversAllActive === IMPORT.ITEM_STATUS.TO_UPDATE) {
				return this.resolversAllLoading
					|| (!this.duplicities.every(
						(duplicity) => duplicity.state === IMPORT.ITEM_STATE.DUPLICITY_KEEP_OURS,
					)
						&& !this.allFromSolved);
			}

			if (this.resolversAllActive === IMPORT.ITEM_STATUS.TO_LINK) {
				return this.resolversAllLoading
					|| (!this.duplicities.every(
						(duplicity) => duplicity.state === IMPORT.ITEM_STATE.DUPLICITY_KEEP_THEIRS,
					)
						&& !this.allFromSolved);
			}

			return this.resolversAllLoading;
		},

		identityStepActive() {
			return this.status === IMPORT.STATUS.IDENTITY_CHECK
				|| this.status === IMPORT.STATUS.IDENTITY_CHECK_CORRECT
				|| this.status === IMPORT.STATUS.IDENTITY_CHECK_FAILED;
		},

		isCheckingIdentity() {
			return this.status === IMPORT.STATUS.IDENTITY_CHECK;
		},

		canResolveDuplicities() {
			return this.status === IMPORT.STATUS.IDENTITY_CHECK_CORRECT
				|| this.status === IMPORT.STATUS.IDENTITY_CHECK_FAILED;
		},

		totalEntries() {
			return this.importStatistics?.totalEntries || 0;
		},

		entriesLeft() {
			if (this.amountIdentityDuplicities) {
				return this.amountIdentityDuplicitiesIncrement
					- this.amountIdentityDuplicitiesResolvedIncrement;
			}
			return this.totalEntries - this.amountIdentityDuplicitiesResolvedIncrement;
		},

		amountIdentityDuplicities() {
			return this.importStatistics?.amountIdentityDuplicities || 0;
		},

		amountIdentityDuplicitiesResolved() {
			return this.importStatistics?.amountIdentityDuplicitiesResolved || 0;
		},

		canStartSimilarityCheck() {
			return this.importStatus === IMPORT.STATUS.IDENTITY_CHECK_CORRECT;
		},

		canCancelImport() {
			return this.importStatus !== IMPORT.STATUS.FINISH
				&& this.importStatus !== IMPORT.STATUS.CANCEL
				&& this.importStatus !== IMPORT.STATUS.IMPORTING;
		},

		canGoToFinalisation() {
			return this.importStatus === IMPORT.STATUS.IDENTITY_CHECK_CORRECT;
		},

		isAllFromFileUnselected() {
			return this.resolversAllActive !== IMPORT.ITEM_STATUS.TO_UPDATE;
		},

		isAllFromHumansisUnselected() {
			return this.resolversAllActive !== IMPORT.ITEM_STATUS.TO_LINK;
		},

		amountIdentityDuplicitiesResolvedWidth() {
			return `${(this.amountIdentityDuplicitiesResolvedIncrement
				/ this.amountIdentityDuplicitiesIncrement) * 100}%`;
		},

		amountIdentityDuplicitiesWidth() {
			return `${((this.amountIdentityDuplicitiesIncrement
				- this.amountIdentityDuplicitiesResolvedIncrement)
				/ this.amountIdentityDuplicitiesIncrement) * 100}%`;
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

		duplicities() {
			this.allFromSolved = true;
		},

		amountIdentityDuplicities(newValue) {
			if (this.isCheckingIdentity) {
				this.graduallyIncrement("amountIdentityDuplicitiesIncrement", newValue, 60);
			} else {
				this.amountIdentityDuplicitiesIncrement = newValue;
			}
		},

		amountIdentityDuplicitiesResolved(newValue) {
			if (this.isCheckingIdentity) {
				this.graduallyIncrement("amountIdentityDuplicitiesResolvedIncrement", newValue, 120);
			} else {
				this.amountIdentityDuplicitiesResolvedIncrement = newValue;
			}
		},
	},

	methods: {
		onLoadDuplicities(value) {
			this.duplicities = value;
		},

		onChangeBulkDuplicitiesStatus(status) {
			const { importId } = this.$route.params;
			this.resolversAllLoading = true;
			this.allFromSolved = false;

			ImportService.changeBulkDuplicitiesStatus(importId, { status })
				.then((response) => {
					if (response.status === 202) {
						this.resolversAllActive = status;

						if (this.duplicitiesContentOpened) {
							this.$refs.duplicityResolver.fetchData();
						}
						Notification(this.$t("Duplicities were resolved"), "success");
					}
				}).finally(() => {
					this.resolversAllLoading = false;
					this.$emit("updated");
				});
		},

		onResolveDuplicities() {
			if (!this.duplicitiesContentOpened) this.resolveDuplicitiesLoading = true;
			this.duplicitiesContentOpened = true;
		},

		onDuplicityLoaded() {
			this.resolveDuplicitiesLoading = false;
		},

		startSimilarityCheck() {
			this.$emit("changeImportState", {
				state: IMPORT.STATUS.SIMILARITY_CHECK,
				successMessage: "Similarity Check Started Successfully",
				goNext: true,
			});
		},

		onGoToFinalisation() {
			this.$emit("goToFinalStep");
		},

		onUpdate() {
			this.$emit("updated");
		},

		onCancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
