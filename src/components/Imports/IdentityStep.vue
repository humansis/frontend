<template>
	<div class="card">
		<div
			v-if="identityStepActive && status"
			class="card-content"
		>
			<div class="content">
				<b-progress
					v-if="totalEntries"
					size="is-large"
					:max="totalEntries"
				>
					<template #bar>
						<b-progress-bar
							type="is-light"
							show-value
							:value="totalEntries - amountDuplicities"
						/>
						<b-progress-bar
							v-if="amountDuplicities"
							type="is-warning"
							show-value
							:value="amountDuplicities"
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
									{{ amountDuplicities }}
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>{{ $t('Resolved Duplicities and Correct Records')}}:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-success"
									size="is-medium"
								>
									{{ amountDuplicitiesResolved }}
								</b-tag>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div class="buttons mt-5 flex-end">
				<b-button
					v-if="canCancelImport"
					type="is-light is-danger"
					icon-right="ban"
					@click="cancelImport"
				>
					{{ $t('Cancel Import') }}
				</b-button>
				<b-button
					v-if="amountDuplicities"
					type="is-primary"
					icon-right="tasks"
					:loading="resolveDuplicitiesLoading"
					@click="resolveDuplicities"
				>
					{{ $t('Resolve Duplicities') }}
				</b-button>
				<b-button
					v-if="canStartSimilarityCheck"
					type="is-primary"
					icon-right="play-circle"
					:loading="changeStateButtonLoading"
					@click="startSimilarityCheck"
				>
					{{ $t('Start Similarity Check') }}
				</b-button>
			</div>

			<div v-if="duplicitiesContentOpened">
				<DuplicityResolver
					:header="$t('Duplicity Cases')"
					@loaded="onDuplicityLoaded"
					@updated="update"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import consts from "@/utils/importConst";
import DuplicityResolver from "@/components/Imports/DuplicityResolver";

export default {
	name: "DuplicityStep",

	components: {
		DuplicityResolver,
	},

	data() {
		return {
			importStatistics: {},
			duplicitiesContentOpened: false,
			file: {},
			changeStateButtonLoading: false,
			resolveDuplicitiesLoading: false,
			importStatus: "",
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
	},

	computed: {
		identityStepActive() {
			return this.status === consts.STATUS.IDENTITY_CHECK
				|| this.status === consts.STATUS.IDENTITY_CHECK_CORRECT
				|| this.status === consts.STATUS.IDENTITY_CHECK_FAILED;
		},

		totalEntries() {
			return this.importStatistics?.totalEntries || 0;
		},

		amountDuplicities() {
			return this.importStatistics?.amountDuplicities || 0;
		},

		amountDuplicitiesResolved() {
			return this.importStatistics?.amountDuplicitiesResolved || 0;
		},

		canStartSimilarityCheck() {
			return this.importStatus === consts.STATUS.IDENTITY_CHECK_CORRECT;
		},

		canCancelImport() {
			return this.importStatus !== consts.STATUS.FINISH
				&& this.importStatus !== consts.STATUS.CANCEL
				&& this.importStatus !== consts.STATUS.IMPORTING;
		},
	},

	methods: {
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

		update() {
			this.$emit("updated");
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
