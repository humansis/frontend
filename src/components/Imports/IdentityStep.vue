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
							<td>{{ $t('Duplicities Corrected/Merged')}}:</td>
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
				<hr>

				<h2 class="subtitle is-5 mb-4">
					{{ $t("Duplicity Cases") }}
				</h2>

				<hr>

				<div class="content">
					<div
						v-for="{ id, itemId, status, recordValues, recordDuplicities } of duplicities"
						:key="id"
						class="resolve-table"
					>
						<table>
							<thead>
								<tr>
									<th>{{ $t('Imported Record') }}</th>
									<th>{{ $t('Records From Database') }}</th>
									<th>{{ $t('Reasons') }}</th>
									<th>{{ $t('Actions') }}</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<i>{{ itemId }} {{status}} {{ recordValues }}</i>
										Vestibulum fermentum tortor id mi. Etiam sapien elit, consequat
										eget, tristique non, venenatis quis, ante. Etiam bibendum elit
										eget erat. Vestibulum fermentum tortor id mi
									</td>
									<td>
										{{ recordDuplicities }}
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
											class="mb-2"
											type="is-info is-light"
											icon-right="play-circle"
										>
											{{ $t('To Update') }}
										</b-button>
										<b-button
											class="mb-2"
											type="is-info is-light"
											icon-right="play-circle"
										>
											{{ $t('To Link') }}
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
import ImportService from "@/services/ImportService";
import { Notification } from "@/utils/UI";

export default {
	name: "DuplicityStep",

	data() {
		return {
			importStatistics: {},
			duplicitiesContentOpened: true,
			file: {},
			changeStateButtonLoading: false,
			importStatus: "",
			duplicities: [
				{
					id: 0,
					itemId: 1024,
					status: "New",
					recordValues: "{ local_given_name: 'Abdul Mohamed', local_family_name: 'Hassan' }",
					recordDuplicities: [ // duplicityCandidateId
						{
							beneficiaryId: 64,
							name: "BeneficiaryName 1",
							reasonsOfDuplicity: [ // Reasons
								"same NationalID",
								"same given name",
								"similarity 70 % on family name",
							],
						},
						{
							beneficiaryId: 74,
							name: "BeneficiaryName 2",
							reasonsOfDuplicity: [ // Reasons
								"same NationalID",
								"same given name",
								"similarity 70 % on family name",
							],
						},
					],
				},
			],
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

		canStartSimilarityCheck() {
			return this.importStatus !== consts.STATUS.IDENTITY_CHECK_CORRECT;
		},

		canCancelImport() {
			return this.importStatus !== consts.STATUS.FINISH;
		},
	},

	mounted() {
		this.fetchDuplicities();
	},

	methods: {
		fetchDuplicities() {
			const { importId } = this.$route.params;

			ImportService.getDuplicitiesInImport(importId).then(({ data }) => {
				this.importDetail = data;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Import 2")} ${e}`, "is-danger");
			}).finally(() => {
				this.fetchProject(this.importDetail.projectId);
			});
		},

		startSimilarityCheck() {
			this.$emit("changeImportState", {
				state: consts.STATE.SIMILARITY_CHECKING,
				successMessage: "Similarity Check Started Successfully",
			});
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
