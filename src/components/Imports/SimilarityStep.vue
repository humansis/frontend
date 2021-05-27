<template>
	<div class="card">
		<b-notification
			v-if="!similarityStepActive"
			class="is-light"
			type="is-info"
			has-icon
			:closable="false"
		>
			<div class="mt-3">
				{{ $t("This step currently is not in progress")}}
			</div>
		</b-notification>
		<div
			v-if="similarityStepActive"
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
							type="is-success"
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
							<td>{{ $t('Similarities Found')}}:</td>
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
							<td>{{ $t('Similarities Corrected/Merged')}}:</td>
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
					@click="duplicitiesContentOpened = !duplicitiesContentOpened"
				>
					{{ $t('Resolve Similarities') }}
				</b-button>
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

			<div v-if="duplicitiesContentOpened">
				<hr>

				<h2 class="subtitle is-5 mb-4">
					{{ $t("Similarity Cases") }}
				</h2>

				<hr>

				<div class="content">
					<div class="resolve-table">
						<table>
							<thead>
								<tr>
									<th>{{ $t('Imported Record') }}</th>
									<th>{{ $t('Records From Database') }}</th>
									<th>{{ $t('Similarities') }}</th>
									<th>{{ $t('Actions') }}</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										Vestibulum fermentum tortor id mi. Etiam sapien elit, consequat
										eget, tristique non, venenatis quis, ante. Etiam bibendum elit
										eget erat. Vestibulum fermentum tortor id mi
									</td>
									<td>
										Vestibulum fermentum tortor id mi. Etiam sapien elit, consequat
										eget, tristique non, venenatis quis, ante. Etiam bibendum elit
										eget erat. Vestibulum fermentum tortor id mi
									</td>
									<td>
										Vestibulum fermentum tortor id mi. Etiam sapien elit, consequat
										eget, tristique non, venenatis quis, ante. Etiam bibendum elit
										eget erat. Vestibulum fermentum tortor id mi
									</td>
									<td>
										<b-button
											type="is-info is-light"
											icon-right="play-circle"
										>
											{{ $t('Use Existing') }}
										</b-button>
									</td>
									<td>
										<b-button
											type="is-info is-light"
											icon-right="play-circle"
										>
											{{ $t('Use New') }}
										</b-button>
									</td>
								</tr>
							</tbody>
						</table>
						<hr>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import consts from "@/utils/importConst";

export default {
	name: "SimilarityStep",

	data() {
		return {
			importStatistics: {},
			duplicitiesContentOpened: false,
			file: {},
			changeStateButtonLoading: false,
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
		similarityStepActive() {
			return this.status === consts.STATUS.SIMILARITY_CHECK
				|| this.status === consts.STATUS.SIMILARITY_CHECK_CORRECT
				|| this.status === consts.STATUS.SIMILARITY_CHECK_FAILED;
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

		canGoToFinalisation() {
			return this.importStatus === consts.STATUS.SIMILARITY_CHECK_CORRECT;
		},

		canCancelImport() {
			return this.importStatus !== consts.STATUS.FINISH;
		},
	},

	methods: {
		goToFinalisation() {
			this.$emit("goToFinalStep");
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
