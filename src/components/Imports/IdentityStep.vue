<template>
	<!-- TODO Implement else -->
	<div v-if="identityStepActive && importStatus">
		<v-card class="pa-5">
			<div>
				<Loading v-if="isCheckingIdentity" is-large />

				<v-sheet
					v-if="amountIdentityDuplicitiesIncrement || amountIdentityDuplicitiesResolved"
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
						:disabled="!isAllProjectsAccessibleForThisImport"
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
							:disabled="isAllFromFileButtonDisabled"
							:variant="isAllFromFileUnselected ? 'outlined' : 'elevated'"
							color="info"
							@click="onChangeBulkDuplicitiesStatus(IMPORT.ITEM_STATUS.TO_UPDATE)"
						>
							{{ $t('All From File') }}
						</v-btn>

						<v-btn
							v-if="amountIdentityDuplicities && canResolveDuplicities"
							:disabled="!isUserPermissionGranted(PERMISSIONS.IMPORT_APPROVE_AND_SAVE)"
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
							v-if="isGoToFinalisationButtonVisible"
							:loading="changeStateButtonLoading"
							:disabled="isGoToFinalisationButtonDisabled"
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
				:is-form-changes-loading="isAllRecordsFormLoading"
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
import permissions from "@/mixins/permissions";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { IMPORT } from "@/consts";

export default {
	name: "IdentityStep",

	emits: [
		"goToFinalStep",
		"updated",
		"changeImportState",
		"canceledImport",
	],

	components: {
		DuplicityResolver,
		Loading,
	},

	mixins: [permissions],

	props: {
		statistics: {
			type: Object,
			required: true,
		},

		loadingChangeStateButton: {
			type: Boolean,
			required: true,
		},

		importStatus: {
			type: String,
			default: "",
		},

		isAllProjectsAccessibleForThisImport: {
			type: Boolean,
			default: true,
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
			duplicities: [],
			resolversAllLoading: false,
			resolversAllActive: "",
			allFromSolved: true,
			amountIdentityDuplicitiesIncrement: 0,
			amountIdentityDuplicitiesResolvedIncrement: 0,
		};
	},

	computed: {
		isAllRecordsFormLoading() {
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
			return this.importStatus === IMPORT.STATUS.IDENTITY_CHECK
				|| this.importStatus === IMPORT.STATUS.IDENTITY_CHECK_CORRECT
				|| this.importStatus === IMPORT.STATUS.IDENTITY_CHECK_FAILED;
		},

		isCheckingIdentity() {
			return this.importStatus === IMPORT.STATUS.IDENTITY_CHECK;
		},

		isGoToFinalisationButtonDisabled() {
			return !this.isUserPermissionGranted(this.PERMISSIONS.IMPORT_MANAGE)
				|| !this.isAllProjectsAccessibleForThisImport;
		},

		canResolveDuplicities() {
			return this.importStatus === IMPORT.STATUS.IDENTITY_CHECK_CORRECT
				|| this.importStatus === IMPORT.STATUS.IDENTITY_CHECK_FAILED;
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
			return this.importStatistics?.amountEntriesToImport || 0;
		},

		canStartSimilarityCheck() {
			return this.importStatus === IMPORT.STATUS.IDENTITY_CHECK_CORRECT;
		},

		canCancelImport() {
			return this.importStatus !== IMPORT.STATUS.FINISH
				&& this.importStatus !== IMPORT.STATUS.CANCEL
				&& this.importStatus !== IMPORT.STATUS.IMPORTING;
		},

		isGoToFinalisationButtonVisible() {
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
				/ (this.amountIdentityDuplicitiesIncrement || this.amountIdentityDuplicitiesResolved)) * 100}%`;
		},

		amountIdentityDuplicitiesWidth() {
			return `${((this.amountIdentityDuplicitiesIncrement
				- this.amountIdentityDuplicitiesResolvedIncrement)
				/ (this.amountIdentityDuplicitiesIncrement || this.amountIdentityDuplicitiesResolved)) * 100}%`;
		},

		isAllFromFileButtonDisabled() {
			return this.isAllRecordsFormLoading
				|| !this.isUserPermissionGranted(this.PERMISSIONS.IMPORT_APPROVE_AND_SAVE);
		},
	},

	watch: {
		statistics(value) {
			this.importStatistics = value;
		},

		loadingChangeStateButton(value) {
			this.changeStateButtonLoading = value;
		},

		duplicities() {
			this.allFromSolved = true;
		},

		amountIdentityDuplicities(newValue) {
			this.amountIdentityDuplicitiesIncrement = newValue;
		},

		amountIdentityDuplicitiesResolved(newValue) {
			this.amountIdentityDuplicitiesResolvedIncrement = newValue;
		},
	},

	methods: {
		onLoadDuplicities(value) {
			this.duplicities = value;
		},

		async onChangeBulkDuplicitiesStatus(duplicitiesStatus) {
			try {
				this.resolversAllLoading = true;
				this.allFromSolved = false;

				const { importId } = this.$route.params;

				const {
					status,
					message,
				} = await ImportService.changeBulkDuplicitiesStatus({
					body: { status: duplicitiesStatus },
					importId,
				});

				checkResponseStatus(status, message);

				this.resolversAllActive = duplicitiesStatus;

				if (this.duplicitiesContentOpened) {
					await this.$refs.duplicityResolver.fetchData();
				}

				Notification(this.$t("Duplicities were resolved"), "success");
			} catch (e) {
				Notification(`${this.$t("Change Duplicities")}: ${e.message || e}`, "error");
			} finally {
				this.resolversAllLoading = false;
				this.$emit("updated");
			}
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
