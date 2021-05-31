<template>
	<div>
		<hr>

		<h2 class="subtitle is-5 mb-4">
			{{ header }} ({{ recordItems.length }})
		</h2>

		<hr>

		<div class="content">
			<div
				v-for="({
					queueId,
					values,
					duplicities,
					toCreateLoading,
					disabled
				}, recordKey) of recordItems"
				:key="recordKey"
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
							v-for="({
								duplicityCandidateId,
								reasons,
								toUpdateLoading,
								toLinkLoading
							}, duplicityKey) of duplicities"
							:key="duplicityKey"
						>
							<td class="td-width-30">
								<span v-if="duplicityKey === 0">
									{{ values }}
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
								Candidate ID: {{ duplicityCandidateId }}
							</td>
							<td>
								{{ reasons }}
							</td>
							<td>
								<div class="buttons flex-end">
									<b-button
										class="mb-2 mr-0"
										type="is-link"
										:disabled="disabled"
										:loading="toUpdateLoading"
										@click="resolveToUpdate(
											queueId,
											duplicityCandidateId,
											recordKey,
											duplicityKey
										)"
									>
										{{ $t('To Update') }}
									</b-button>
									<b-button
										class="mb-2 ml-2"
										type="is-info"
										:disabled="disabled"
										:loading="toLinkLoading"
										@click="resolveToLink(
											queueId,
											duplicityCandidateId,
											recordKey,
											duplicityKey
										)"
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
						type="is-success"
						:disabled="disabled"
						:loading="toCreateLoading"
						@click="resolveToCreate(queueId, recordKey)"
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
			recordItems: [],
		};
	},

	props: {
		header: {
			type: String,
			required: true,
		},
	},

	mounted() {
		this.prepareDuplicities();
	},

	methods: {
		async preparedDuplicitiesObject() {
			const originalDuplicities = await this.getDuplicities() || [];

			const records = [];

			if (originalDuplicities?.length) {
				originalDuplicities.forEach(({ id, itemId, duplicityCandidateId, reasons }) => {
					if (records.find((duplicity) => duplicity.queueId === itemId)) {
						const existIndex = records.findIndex((item) => item.queueId === itemId);
						records[existIndex].duplicities.push({
							id,
							duplicityCandidateId,
							candidate: {},
							reasons: reasons.toString().replace(",", ", "),
							toUpdateLoading: false,
							toLinkLoading: false,
						});
					} else {
						const record = {
							queueId: itemId,
							status: "",
							values: "",
							disabled: false,
							toCreateLoading: false,
							duplicities: [
								{
									id,
									duplicityCandidateId,
									candidate: {},
									reasons: reasons
										.toString().replace(",", ", "),
									toUpdateLoading: false,
									toLinkLoading: false,
								},
							],
						};

						records.push(record);
					}
				});
			}

			return records;
		},

		async prepareDuplicities() {
			const duplicities = await this.preparedDuplicitiesObject() || [];

			const newDuplicities = [];
			const queueIds = [];
			const duplicityCandidateIds = [];

			if (duplicities?.length) {
				duplicities.forEach((item, key) => {
					newDuplicities[key] = item;

					if (item.queueId) {
						queueIds.push(item.queueId);
					}

					if (item.duplicities?.length) {
						item.duplicities.forEach(({ duplicityCandidateId }) => {
							duplicityCandidateIds.push(duplicityCandidateId);
						});
					}
				});

				this.recordItems = newDuplicities;

				this.prepareQueueItemsForDuplicity(queueIds);
				this.prepareDuplicityCandidatesForDuplicity(duplicityCandidateIds);

				this.$emit("loaded", true);
			}
		},

		async prepareQueueItemsForDuplicity(queueIds) {
			const { importId } = this.$route.params;

			const queueItems = await this.getImportItemsDetail(importId, queueIds);

			if (!queueItems?.length) return;

			this.recordItems.forEach((item, key) => {
				const queueItem = queueItems?.find(({ id }) => id === item.queueId);

				this.recordItems[key].values = queueItem?.values;
				this.recordItems[key].status = queueItem?.status;
			});
		},

		async prepareDuplicityCandidatesForDuplicity(duplicityCandidateIds) {
			const beneficiaries = await this.getBeneficiaries(duplicityCandidateIds);

			this.recordItems.forEach(({ duplicities }, recordKey) => {
				if (duplicities.length) {
					duplicities.forEach((duplicity, duplicityKey) => {
						const candidate = beneficiaries?.find(
							({ id }) => id === duplicity.duplicityCandidateId,
						);

						this.recordItems[recordKey].duplicities[duplicityKey].candidate = candidate;
					});
				}
			});
		},

		getDuplicities() {
			const { importId } = this.$route.params;

			return ImportService.getDuplicitiesInImport(importId)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Duplicities")} ${e}`, "is-danger");
				});
		},

		getImportItemsDetail(importId, ids) {
			if (!ids.length) return [];
			return ImportService.getImportItemsDetail(importId, ids)
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

		async resolveToUpdate(queueId, acceptedDuplicityId, recordKey, duplicityKey) {
			this.recordItems[recordKey].duplicities[duplicityKey].buttonLoading = true;

			await this.resolveImportItemDuplicity(
				queueId,
				consts.ITEM_STATUS.TO_UPDATE,
				acceptedDuplicityId,
				recordKey,
				duplicityKey,
				"toUpdateLoading",
			);
		},

		async resolveToLink(queueId, acceptedDuplicityId, recordKey, duplicityKey) {
			await this.resolveImportItemDuplicity(
				queueId,
				consts.ITEM_STATUS.TO_LINK,
				acceptedDuplicityId,
				recordKey,
				duplicityKey,
				"toLinkLoading",
			);
		},

		async resolveToCreate(queueId, recordKey) {
			await this.resolveImportItemDuplicity(
				queueId,
				consts.ITEM_STATUS.TO_CREATE,
				null,
				recordKey,
				null,
				"toCreateLoading",
			);
		},

		async resolveImportItemDuplicity(
			queueId, state, acceptedDuplicityId, recordKey, duplicityKey, button,
		) {
			if (duplicityKey !== null) {
				this.recordItems[recordKey].duplicities[duplicityKey][button] = true;
			} else {
				this.recordItems[recordKey].toCreateLoading = true;
			}

			this.recordItems[recordKey].disabled = true;

			await ImportService.resolveImportItemDuplicity(queueId, state, acceptedDuplicityId)
				.then(({ status, data }) => {
					if (status === 202) {
						Toast(this.$t("Solved"), "is-success");
					}

					if (status === 400) {
						Notification(`${this.$t("Not Solved")} ${data?.message}`, "is-warning");
					}

					if (duplicityKey !== null) {
						this.recordItems[recordKey].duplicities[duplicityKey][button] = false;
					} else {
						this.recordItems[recordKey].toCreateLoading = false;
					}
				}).catch((e) => {
					if (e.message) {
						Notification(`${this.$t("Not Solved")} ${e}`, "is-danger");

						if (duplicityKey !== null) {
							this.recordItems[recordKey].duplicities[duplicityKey][button] = false;
						} else {
							this.recordItems[recordKey].toCreateLoading = false;
						}

						this.recordItems[recordKey].disabled = false;
					}
				});
		},
	},
};
</script>
