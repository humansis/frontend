<template>
	<div class="card">
		<div class="card-content">
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
							type="is-warning"
							show-value
							:value="amountDuplicities"
						/>
					</template>
				</b-progress>
				<table>
					<tbody>
						<tr>
							<td>Number of Records:</td>
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
							<td>Similarities or Duplicities Found:</td>
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
							<td>Similarities or Duplicities Corrected/Merged:</td>
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
					v-if="!amountDuplicities"
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
					Similarity or Duplicity Cases
				</h2>

				<hr>

				<div class="content">
					<div class="resolve-table">
						<table>
							<thead>
								<tr>
									<th>Imported Record</th>
									<th>Records From Database</th>
									<th>Similarities</th>
									<th>Actions</th>
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
											{{ $t('Merge with this') }}
										</b-button>
									</td>
								</tr>
								<tr>
									<td />
									<td />
									<td />
									<td>
										<b-upload v-model="file">
											<span class="file-cta button is-light">
												<span v-if="file" class="file-label">
													{{ file.name || "Import as New Beneficiary"}}
												</span>
												<b-icon icon="file-upload" />
											</span>
										</b-upload>
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
export default {
	name: "DuplicityStep",

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
		totalEntries() {
			return this.importStatistics?.totalEntries || 0;
		},

		amountDuplicities() {
			return this.importStatistics?.amountDuplicities || 0;
		},

		amountDuplicitiesResolved() {
			return this.importStatistics?.amountDuplicitiesResolved || 0;
		},
	},

	methods: {
		goToFinalisation() {
			// TODO Solve this
			this.$emit("changeImportState", {
				state: "",
				successMessage: "",
			});
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
