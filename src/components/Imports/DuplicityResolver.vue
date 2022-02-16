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
					status,
					duplicities,
					toCreateLoading,
					disabled,
					toUpdate,
					toLink,
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
								beneficiaries,
								reasons,
								toUpdateLoading,
								toLinkLoading
							}, duplicityKey) of duplicities"
							:key="duplicityKey"
						>
							<td class="td-width-30">
								<span v-if="duplicityKey === 0">
									<span v-html="values" />
									<br>
									<b-tag
										class="mt-2 mr-2"
										type="is-light"
									>
										{{ $t('Row') }} {{ queueId }}
									</b-tag>
									<b-tag
										v-if="status"
										class="mt-2"
										type="is-light"
									>
										{{ status }}
									</b-tag>
								</span>
							</td>
							<td class="td-width-30">
								<span v-html="beneficiaries" />
							</td>
							<td class="td-width-30">
								<div v-html="reasons" />
							</td>
							<td>
								<b-field grouped>
									<b-button
										:class="[
											'is-link button-to-update',
											(toUpdate || status === 'To Update') ? '' : 'is-outlined'
										]"
										:disabled="toUpdateLoading || toLinkLoading"
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
										:class="[
											'is-info button-to-link',
											(toLink || status === 'To Link') ? '' : 'is-outlined'
										]"
										:disabled="toUpdateLoading || toLinkLoading"
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
								</b-field>

							</td>
						</tr>
					</tbody>
				</table>
				<div v-if="hasToCreateButton" class="buttons flex-end">
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
			visibleBeneficiaryAttributes: [
				"Local given name",
				"Local family name",
			],
		};
	},

	props: {
		header: {
			type: String,
			required: true,
		},

		hasToCreateButton: {
			type: Boolean,
			default: true,
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
									beneficiariesIds: [],
									beneficiaries: "",
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
			} else {
				this.$emit("loaded", true);
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
				const parsedValues = queueItem?.values;

				let values = "";

				if (parsedValues?.length) {
					parsedValues.forEach((parsedValue, parsedValueKey) => {
						Object.entries(parsedValue).forEach(([attr, value]) => {
							if (this.visibleBeneficiaryAttributes.includes(attr)) {
								let finalValue = value;

								if (typeof value !== "string") {
									finalValue = JSON.stringify(value);
								}

								values += `${attr}: ${finalValue}, `;
							}
						});

						if (!((parsedValues.length - 1) === parsedValueKey)) {
							values += "</br></br>";
						}
					});
				}

				this.recordItems[key].values = values;
				this.recordItems[key].status = queueItem?.status;
			});
		},

		async prepareDuplicityCandidatesForDuplicity(duplicityCandidateIds) {
			const households = await this.getHouseholds(duplicityCandidateIds);

			this.recordItems.forEach(({ duplicities }, recordKey) => {
				if (duplicities?.length && households?.length) {
					duplicities.forEach(async (duplicity, duplicityKey) => {
						const { householdHeadId, beneficiaryIds } = households?.find(
							({ id }) => id === duplicity.duplicityCandidateId,
						);

						let values = "";

						if (householdHeadId) {
							const beneficiaries = await this.getBeneficiaries([
								householdHeadId,
								...beneficiaryIds,
							]);

							if (beneficiaries?.length) {
								beneficiaries.forEach(({ localGivenName, localFamilyName }, key) => {
									values += `${localGivenName}, ${localFamilyName}`;

									if (!((beneficiaries.length - 1) === key)) {
										values += "</br></br>";
									}
								});
							}

							this.recordItems[recordKey].duplicities[duplicityKey]
								.beneficiariesIds = [householdHeadId, ...beneficiaryIds];
						}

						this.recordItems[recordKey].duplicities[duplicityKey].beneficiaries = values;
					});
				}
			});
		},

		getDuplicities() {
			const { importId } = this.$route.params;

			return ImportService.getDuplicitiesInImport(importId)
				.then(({ data: { data } }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Duplicities")} ${e}`, "is-danger");
				});
		},

		getImportItemsDetail(importId, ids) {
			if (!ids.length) return [];
			return ImportService.getImportItemsDetail(importId, ids)
				.then(({ data: { data } }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Duplicity Item")} ${e}`, "is-danger");
					return [];
				});
		},

		getHouseholds(ids) {
			if (!ids.length) return [];
			return BeneficiariesService.getListOfHouseholds(null, null, null, null, null, ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`Beneficiaries ${e}`, "is-danger");
					return [];
				});
		},

		async getBeneficiaries(ids) {
			return BeneficiariesService.getBeneficiaries(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Beneficiaries")} ${e}`, "is-danger");
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
			this.recordItems[recordKey].toUpdate = state === consts.ITEM_STATUS.TO_UPDATE;
			this.recordItems[recordKey].toLink = state === consts.ITEM_STATUS.TO_LINK;

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
				}).finally(() => {
					this.$emit("updated");
				});
		},
	},
};
</script>

<style>
.td-width-30 {
	width: 30%;
}

.button-to-update {
	border-bottom-right-radius: 0;
	border-top-right-radius: 0;
}

.button-to-link {
	border-bottom-left-radius: 0;
	border-top-left-radius: 0;
	border-left: none;
}
</style>
