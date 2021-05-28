<template>
	<div>
		<hr>

		<h2 class="subtitle is-5 mb-4">
			{{ $t("Duplicity Cases") }} ({{ duplicities.length }})
		</h2>

		<hr>

		<div class="content">
			<div
				v-for="({ queueId, recordValues, recordDuplicities }, key) of duplicities"
				:key="key"
				class="resolve-table"
			>
				<table>
					<thead>
						<tr>
							<th>{{ $t('Imported Record') }}</th>
							<th>{{ $t('Records From Database') }}</th>
							<th>{{ $t('Reasons') }}</th>
							<th class="has-text-right">{{ $t('Actions') }}</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="({id, name, duplicityReasons}, key) of recordDuplicities"
							:key="key"
						>
							<td class="td-width-30">
								<span v-if="key === 0">
									{{ recordValues }}
									<br>
									<b-tag
										class="mt-2"
										type="is-light"
									>
										{{ $t('Row') }} {{ queueId }}
									</b-tag>
								</span>
							</td>
							<td class="td-width-30">
								{{ name }}
							</td>
							<td>
								{{ duplicityReasons }}
							</td>
							<td>
								<div class="buttons flex-end">
									<b-button
										class="mb-2 mr-0"
										type="is-warning is-light"
										@click="resolveToUpdate(queueId, id)"
									>
										{{ $t('To Update') }}
									</b-button>
									<b-button
										class="mb-2 ml-2"
										type="is-info is-light"
										@click="resolveToLink(queueId, id)"
									>
										{{ $t('To Link') }}
									</b-button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
				<div class="buttons flex-end">
					<b-button
						class="mt-2 mr-3"
						type="is-success is-light"
						@click="resolveToCreate(queueId)"
					>
						{{ $t('To Create') }}
					</b-button>
				</div>
				<hr>
			</div>
		</div>
	</div>
</template>

<script>
import ImportService from "@/services/ImportService";
import { Notification, Toast } from "@/utils/UI";
import BeneficiariesService from "@/services/BeneficiariesService";
import consts from "@/utils/importConst";

export default {
	name: "DuplicityResolver",

	data() {
		return {
			duplicities: [
				{
					id: 0,
					queueId: 1024, // --> Will be filled from /imports/queue/{id}
					status: null, // --> Will be filled from /imports/queue/{id}
					recordValues: "{ local_given_name: 'Abdul Mohamed', local_family_name: 'Hassan' }", // --> Will be filled from /imports/queue/{id}
					recordDuplicities: [
						{
							id: 0,
							duplicityCandidateId: 64,
							name: "BeneficiaryName 1", // --> Will be filled from /beneficiary/{id}
							duplicityReasons: [
								"same NationalID",
								"same given name",
								"similarity 70 % on family name",
							],
						},
						{
							id: 0,
							duplicityCandidateId: 64,
							name: "BeneficiaryName 1", // --> Will be filled from /beneficiary/{id}
							duplicityReasons: [
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

	mounted() {
		this.prepareDuplicities();
	},

	methods: {
		async preparedDuplicitiesObject() {
			// const originalDuplicities = await this.getDuplicities() || [];
			const originalDuplicities = [
				{
					id: 3,
					itemId: 1025,
					duplicityCandidateId: 66,
					reasons: [
						"same NationalID",
						"same given name",
						"similarity 70 % on family name",
					],
				},
				{
					itemId: 1024,
					duplicityCandidateId: 64,
					reasons: [
						"same NationalID",
						"same given name",
						"similarity 70 % on family name",
					],
				},
				{
					itemId: 1024,
					duplicityCandidateId: 65,
					reasons: [
						"same NationalID",
						"same given name",
						"similarity 70 % on family name",
					],
				},
			];

			const duplicities = [];

			if (originalDuplicities?.length) {
				originalDuplicities.forEach(({ itemId, duplicityCandidateId, reasons }) => {
					// console.log(duplicities);
					// console.log(duplicities.find((duplicity) => duplicity.queueId === itemId));

					if (duplicities.find((duplicity) => duplicity.queueId === itemId)) {
						const existIndex = duplicities.findIndex((x) => x.queueId === itemId);
						console.log(existIndex);
					} else {
						const duplicity = {
							queueId: itemId,
							status: "", // --> Will be filled from /imports/queue/{id}
							recordValues: "", // --> Will be filled from /imports/queue/{id}
							recordDuplicities: [
								{
									id: 0,
									duplicityCandidateId,
									candidate: {}, // Will be filled from /beneficiaries/{id}
									duplicityReasons: reasons
										.toString().replace(",", ", "),
								},
							],
						};

						duplicities.push(duplicity);
					}
				});

				console.log(duplicities);
			}
		},

		async prepareDuplicities() {
			const duplicities = await this.preparedDuplicitiesObject() || [];

			const queueIds = [];
			const duplicityCandidateIds = [];

			if (duplicities?.length) {
				duplicities.forEach((item, key) => {
					this.duplicities[key] = item;

					if (item.queueId) {
						queueIds.push(item.queueId);
					}

					if (item.recordDuplicities?.length) {
						item.recordDuplicities.forEach(({ duplicityCandidateId }) => {
							duplicityCandidateIds.push(duplicityCandidateId);
						});
					}
				});

				this.prepareQueueItemForDuplicity(queueIds);
				this.prepareDuplicityCandidatesForDuplicity(duplicityCandidateIds);
			}
		},

		async prepareQueueItemForDuplicity(queueIds) {
			const queueItems = await this.getImportItemsDetail(queueIds);

			// TODO Prepare queueItems for duplicities
			console.log(queueItems);
		},

		async prepareDuplicityCandidatesForDuplicity(duplicityCandidateIds) {
			const beneficiaries = await this.getBeneficiaries(duplicityCandidateIds);

			// TODO Prepare beneficiaries for duplicities
			console.log(beneficiaries);
		},

		getDuplicities() {
			const { importId } = this.$route.params;

			return ImportService.getDuplicitiesInImport(importId)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Duplicities")} ${e}`, "is-danger");
				});
		},

		getImportItemsDetail(ids) {
			if (!ids.length) return [];
			return ImportService.getImportItemsDetail(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Duplicity Item")} ${e}`, "is-danger");
					return [];
				});
		},

		getBeneficiaries(ids) {
			if (!ids.length) return [];
			return BeneficiariesService.getBeneficiaries(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`Beneficiaries ${e}`, "is-danger");
					return [];
				});
		},

		resolveToUpdate(queueId, acceptedDuplicityId) {
			this.resolveImportItemDuplicity(queueId, consts.ITEM_STATUS.TO_UPDATE, acceptedDuplicityId);
		},

		resolveToLink(queueId, acceptedDuplicityId) {
			this.resolveImportItemDuplicity(queueId, consts.ITEM_STATUS.TO_LINK, acceptedDuplicityId);
		},

		resolveToCreate(queueId) {
			this.resolveImportItemDuplicity(queueId, consts.ITEM_STATUS.TO_CREATE, null);
		},

		async resolveImportItemDuplicity(queueId, state, acceptedDuplicityId) {
			await ImportService.resolveImportItemDuplicity(queueId, state, acceptedDuplicityId)
				.then(({ status, data }) => {
					if (status === 202) {
						Toast(this.$t("Solved"), "is-success");
					}

					if (status === 400) {
						Notification(`${this.$t("Not Solved")} ${data?.message}`, "is-warning");
					}
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Not Solved")} ${e}`, "is-danger");
				});
		},
	},
};
</script>
