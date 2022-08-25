<template>
	<div class="card">
		<div
			v-if="identityStepActive && status"
			class="card-content"
		>
			<div class="content loading-wrapper">
				<Loading v-if="isCheckingIdentity" b-loading />
				<b-progress
					v-if="totalEntries"
					size="is-large"
					:max="totalEntries"
				>
					<template #bar>
						<b-progress-bar
							type="is-light"
							show-value
							:value="entriesLeft"
						/>
						<b-progress-bar
							v-if="amountIdentityDuplicities"
							type="is-warning"
							show-value
							:value="amountIdentityDuplicitiesIncrement"
						/>
						<b-progress-bar
							v-if="amountIdentityDuplicitiesResolved"
							type="is-success"
							show-value
							:value="amountIdentityDuplicitiesResolvedIncrement"
						/>
					</template>
				</b-progress>
				<table>
					<tbody>
						<tr>
							<td>{{ $t('Number of Records')}}:</td>
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
							<td>{{ $t('Duplicities Found')}}:</td>
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
							<td>{{ $t('Resolved Duplicities')}}:</td>
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
					</tbody>
				</table>
			</div>

			<div class="buttons mt-5 space-between">
				<b-button
					v-if="canCancelImport"
					type="is-light is-danger"
					icon-right="ban"
					@click="cancelImport"
				>
					{{ $t('Cancel Import') }}
				</b-button>
				<div>
					<b-button
						v-if="amountIdentityDuplicities && canResolveDuplicities"
						:type="['is-link' , { 'is-outlined': this.resolversAllActive
							? this.resolversAllActive !== consts.ITEM_STATUS.TO_UPDATE : true }]"
						:disabled="resolversAllLoading"
						@click="changeBulkDuplicitiesStatus(consts.ITEM_STATUS.TO_UPDATE)"
					>
						{{ $t('All From File') }}
					</b-button>
					<b-button
						v-if="amountIdentityDuplicities && canResolveDuplicities"
						:type="['is-info' , { 'is-outlined': this.resolversAllActive
							? this.resolversAllActive !== consts.ITEM_STATUS.TO_LINK : true }]"
						:disabled="resolversAllLoading"
						@click="changeBulkDuplicitiesStatus(consts.ITEM_STATUS.TO_LINK)"
					>
						{{ $t('All From Humansis') }}
					</b-button>
					<b-button
						v-if="amountIdentityDuplicities && canResolveDuplicities"
						type="is-primary"
						icon-right="tasks"
						:loading="resolveDuplicitiesLoading"
						:disabled="resolversAllLoading"
						@click="resolveDuplicities"
					>
						{{ $t('Manage Duplicities') }}
					</b-button>
					<!--
					<b-button
						v-if="canStartSimilarityCheck"
						type="is-primary"
						icon-right="play-circle"
						:loading="changeStateButtonLoading"
						@click="startSimilarityCheck"
					>
						{{ $t('Start Similarity Check') }}
					</b-button>
					-->
					<b-button
						v-if="canGoToFinalisation"
						type="is-primary"
						icon-right="play-circle"
						:loading="changeStateButtonLoading"
						@click="goToFinalisation"
					>
						{{ $t('Go to Finalisation') }}
					</b-button>
				</div>
			</div>

			<div v-if="duplicitiesContentOpened">
				<DuplicityResolver
					ref="duplicityResolver"
					:header="$t('Duplicity Cases')"
					@loaded="onDuplicityLoaded"
					@updated="update"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import graduallyIncrement from "@/mixins/graduallyIncrement";
import consts from "@/utils/importConst";
import DuplicityResolver from "@/components/Imports/DuplicityResolver";
import ImportService from "@/services/ImportService";
import Loading from "@/components/Loading";
import { Toast } from "@/utils/UI";

export default {
	name: "IdentityStep",

	mixins: [graduallyIncrement],

	components: {
		DuplicityResolver,
		Loading,
	},

	data() {
		return {
			consts,
			importStatistics: {},
			duplicitiesContentOpened: false,
			file: {},
			changeStateButtonLoading: false,
			resolveDuplicitiesLoading: false,
			importStatus: "",
			resolversAllLoading: false,
			resolversAllActive: "",
			amountIdentityDuplicitiesIncrement: 0,
			amountIdentityDuplicitiesResolvedIncrement: 0,
		};
	},

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
			required: false,
			default: "",
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

	computed: {
		identityStepActive() {
			return this.status === consts.STATUS.IDENTITY_CHECK
				|| this.status === consts.STATUS.IDENTITY_CHECK_CORRECT
				|| this.status === consts.STATUS.IDENTITY_CHECK_FAILED;
		},

		isCheckingIdentity() {
			return this.status === consts.STATUS.IDENTITY_CHECK;
		},

		canResolveDuplicities() {
			return this.status === consts.STATUS.IDENTITY_CHECK_CORRECT
				|| this.status === consts.STATUS.IDENTITY_CHECK_FAILED;
		},

		totalEntries() {
			return this.importStatistics?.totalEntries || 0;
		},

		entriesLeft() {
			if (this.amountIdentityDuplicities) {
				return this.totalEntries - this.amountIdentityDuplicitiesIncrement
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
			return this.importStatus === consts.STATUS.IDENTITY_CHECK_CORRECT;
		},

		canCancelImport() {
			return this.importStatus !== consts.STATUS.FINISH
				&& this.importStatus !== consts.STATUS.CANCEL
				&& this.importStatus !== consts.STATUS.IMPORTING;
		},

		canGoToFinalisation() {
			return this.importStatus === consts.STATUS.IDENTITY_CHECK_CORRECT;
		},
	},

	methods: {
		changeBulkDuplicitiesStatus(status) {
			const { importId } = this.$route.params;
			this.resolversAllLoading = true;

			ImportService.changeBulkDuplicitiesStatus(importId, { status })
				.then((response) => {
					if (response.status === 202) {
						this.resolversAllActive = status;
						this.$refs.duplicityResolver.fetchDuplicities();
						Toast(this.$t("Duplicities were resolved"), "is-success");
					}
				}).finally(() => {
					this.resolversAllLoading = false;
					this.$emit("updated");
				});
		},

		resolveDuplicities() {
			if (!this.duplicitiesContentOpened) this.resolveDuplicitiesLoading = true;
			this.duplicitiesContentOpened = true;
		},

		onDuplicityLoaded() {
			this.resolveDuplicitiesLoading = false;
		},

		startSimilarityCheck() {
			this.$emit("changeImportState", {
				state: consts.STATE.SIMILARITY_CHECKING,
				successMessage: "Similarity Check Started Successfully",
				goNext: true,
			});
		},

		goToFinalisation() {
			this.$emit("goToFinalStep");
		},

		update() {
			this.$emit("updated");
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>

<style scoped>
.loading-wrapper {
	position: relative;
}
</style>
