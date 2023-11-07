<template>
	<div class="card">
		<div
			v-if="similarityStepActive && status"
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
							:value="totalEntries - amountSimilarityDuplicities"
						/>
						<b-progress-bar
							v-if="amountSimilarityDuplicities"
							type="is-warning"
							show-value
							:value="amountSimilarityDuplicities"
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
							<td>{{ $t('Similarities Found')}}:</td>
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
							<td>{{ $t('Resolved Similarities and Correct Records')}}:</td>
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
					</tbody>
				</table>
			</div>

			<div class="buttons mt-5 space-between">
				<b-button
					v-if="canCancelImport"
					type="is-light is-danger"
					icon-left="ban"
					@click="cancelImport"
				>
					{{ $t('Cancel Import') }}
				</b-button>
				<b-button
					v-if="amountSimilarityDuplicities"
					type="is-primary"
					icon-right="tasks"
					:loading="resolveDuplicitiesLoading"
					@click="resolveDuplicities"
				>
					{{ $t('Resolve Similarities') }}
				</b-button>
				<b-button
					v-if="canGoToFinalisation"
					type="is-primary"
					icon-left="play-circle"
					:loading="changeStateButtonLoading"
					@click="goToFinalisation"
				>
					{{ $t('Go to Finalisation') }}
				</b-button>
			</div>

			<div v-if="duplicitiesContentOpened">
				<DuplicityResolver
					:header="$t('Similarity Cases')"
					@loaded="onDuplicityLoaded"
					@updated="update"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import DuplicityResolver from "@/components/Imports/DuplicityResolver";
import { IMPORT } from "@/consts";

export default {
	name: "SimilarityStep",

	components: {
		DuplicityResolver,
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

	data() {
		return {
			importStatistics: {},
			duplicitiesContentOpened: false,
			resolveDuplicitiesLoading: false,
			file: {},
			changeStateButtonLoading: false,
			importStatus: "",
		};
	},

	computed: {
		similarityStepActive() {
			return this.status === IMPORT.STATUS.SIMILARITY_CHECK
				|| this.status === IMPORT.STATUS.SIMILARITY_CHECK_CORRECT
				|| this.status === IMPORT.STATUS.SIMILARITY_CHECK_FAILED;
		},

		totalEntries() {
			return this.importStatistics?.totalEntries || 0;
		},

		amountSimilarityDuplicities() {
			return this.importStatistics?.amountSimilarityDuplicities || 0;
		},

		amountSimilarityDuplicitiesResolved() {
			return this.importStatistics?.amountSimilarityDuplicitiesResolved || 0;
		},

		canGoToFinalisation() {
			return this.importStatus === IMPORT.STATUS.SIMILARITY_CHECK_CORRECT;
		},

		canCancelImport() {
			return this.importStatus !== IMPORT.STATUS.FINISH
				&& this.importStatus !== IMPORT.STATUS.CANCEL
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

	methods: {
		resolveDuplicities() {
			if (!this.duplicitiesContentOpened) this.resolveDuplicitiesLoading = true;
			this.duplicitiesContentOpened = true;
		},

		onDuplicityLoaded() {
			this.resolveDuplicitiesLoading = false;
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
