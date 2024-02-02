<template>
	<div v-if="!isDuplicitiesLoading && !this.isTotalCountLoading">
		<h2 class="text-h6 mb-4">
			{{ header }} ({{ totalCountOfDuplicities }})
		</h2>

		<DataGrid
			v-model:items-per-page="perPage"
			:headers="table.columns"
			:items="table.data"
			:total-count="table.total"
			:loading="isExportLoading"
			:no-data-text="$t('No data for these filters')"
			variant="text"
			is-row-click-disabled
			@perPageChanged="onPerPageChange"
			@pageChanged="onPageChange"
		>
			<template v-slot:tableControls>
				<div class="mr-3 ml-3">
					<v-icon icon="filter" />
					Filter
				</div>

				<v-btn
					:variant="statusActive.notSolved ? 'elevated' : 'outlined'"
					color="info"
					class="ml-2"
					@click="onStateFilter('notSolved')"
				>
					{{ $t('Not resolved') }}
				</v-btn>

				<v-btn
					:variant="statusActive.fromFile ? 'elevated' : 'outlined'"
					color="info"
					class="ml-2"
					@click="onStateFilter('fromFile')"
				>
					{{ $t('From file') }}
				</v-btn>

				<v-btn
					:variant="statusActive.fromHumansis ? 'elevated' : 'outlined'"
					color="info"
					class="ml-2"
					@click="onStateFilter('fromHumansis')"
				>
					{{ $t('From humansis') }}
				</v-btn>
			</template>

			<template v-slot:actions="{ index }">
				<v-btn
					:disabled="isResolveFromFileDisabled(index)"
					:loading="table.data[index].toUpdateLoading"
					:variant="isFromFileSelected(index) ? 'elevated' : 'outlined'"
					color="info"
					class="duplicity-button rounded-be-0 rounded-te-0"
					@click="onResolveToUpdate(
						table.data[index].itemId,
						table.data[index].duplicityCandidateId,
						index,
					)"
				>
					{{ $t('File') }}
				</v-btn>

				<v-btn
					:disabled="isDataForTableLoading(index)"
					:loading="table.data[index].toLinkLoading"
					:variant="isFromHumansisSelected(index) ? 'elevated' : 'outlined'"
					color="info"
					class="duplicity-button rounded-bs-0 rounded-ts-0"
					@click="onResolveToLink(
						table.data[index].itemId,
						table.data[index].duplicityCandidateId,
						index,
					)"
				>
					{{ $t('Humansis') }}
				</v-btn>
			</template>
		</DataGrid>
	</div>

	<Loading v-else is-large />
</template>

<script>
import ImportService from "@/services/ImportService";
import DataGrid from "@/components/DataGrid";
import Loading from "@/components/Loading";
import grid from "@/mixins/grid";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import { IMPORT } from "@/consts";

export default {
	name: "DuplicityResolver",

	components: {
		DataGrid,
		Loading,
	},

	mixins: [grid],

	props: {
		header: {
			type: String,
			required: true,
		},

		isDuplicitiesLoading: {
			type: Boolean,
			default: false,
		},

		isFormChangesLoading: {
			type: Boolean,
			default: false,
		},

	},

	data() {
		return {
			IMPORT,
			isExportLoading: false,
			isTotalCountLoading: false,
			selectedFilters: [IMPORT.ITEM_STATE.DUPLICITY_CANDIDATE],
			statusFilterConvention: {
				notSolved: IMPORT.ITEM_STATE.DUPLICITY_CANDIDATE,
				fromFile: IMPORT.ITEM_STATE.DUPLICITY_KEEP_OURS,
				fromHumansis: IMPORT.ITEM_STATE.DUPLICITY_KEEP_THEIRS,
			},
			filters: { status: [IMPORT.ITEM_STATE.DUPLICITY_CANDIDATE] },
			statusActive: {
				notSolved: true,
				fromFile: false,
				fromHumansis: false,
			},
			totalCountOfDuplicities: 0,
			table: {
				data: [],
				columns: generateColumns([
					{
						key: "familyName",
						title: "Local family name",
						type: "arrayTextBreakForDuplicities",
						boldText: true,
						sortable: false,
					},
					{
						key: "firstName",
						title: "Local given name",
						type: "arrayTextBreakForDuplicities",
						boldText: true,
						sortable: false,
					},
					{
						key: "idType",
						title: "ID Type",
						type: "arrayTextBreakForDuplicities",
						sortable: false,
					},
					{
						key: "idNumber",
						title: "ID Number",
						type: "arrayTextBreakForDuplicities",
						sortable: false,
					},
					{
						key: "recordFrom",
						title: "Records From File / Humansis",
						type: "arrayTextBreakForDuplicitiesRecords",
						sortable: false,
					},
					{
						key: "actions",
						value: "actions",
						title: "Records From File / Humansis",
						sortable: false,
					},
				]),
				total: 0,
				currentPage: 1,
			},
		};
	},

	created() {
		this.getTotalCountOfDuplicities();
		this.fetchData();
	},

	methods: {
		async getTotalCountOfDuplicities() {
			const { importId } = this.$route.params;
			this.isTotalCountLoading = true;

			await ImportService.getDuplicitiesInImport(
				importId,
				null,
				1,
			).then(({ data: { totalCount } }) => {
				this.totalCountOfDuplicities = totalCount;
			}).catch((e) => {
				Notification(`${this.$t("Duplicities")} ${e.message || e}`, "error");
			});
			this.isTotalCountLoading = false;
		},

		async fetchData() {
			this.isExportLoading = true;
			const { importId } = this.$route.params;

			await ImportService.getDuplicitiesInImport(
				importId,
				this.table.currentPage,
				this.perPage,
				this.filters,
			).then(({ data: { data, totalCount } }) => {
				this.table.data = [];
				this.table.total = totalCount;
				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			}).catch((e) => {
				Notification(`${this.$t("Duplicities")} ${e.message || e}`, "error");
			});
			this.isExportLoading = false;

			this.$emit("loaded");
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].state = item.state;
				this.table.data[key].familyName = [];
				this.table.data[key].firstName = [];
				this.table.data[key].idType = [];
				this.table.data[key].idNumber = [];
				this.table.data[key].recordFrom = [];

				this.extractDataForTable(item, key);
			});
		},

		extractDataForTable(data, key) {
			if (Object.hasOwn(data, "differences")) {
				Object.entries(data.differences).forEach((difference) => {
					this.setRecordFrom(difference, key);
				});
			}
			if (Object.hasOwn(data, "memberDuplicities")) {
				Object.values(data.memberDuplicities).forEach((memberDuplicity) => {
					this.table.data[key].familyName.push(memberDuplicity.familyName);
					this.table.data[key].firstName.push(memberDuplicity.givenName);

					if (Object.hasOwn(memberDuplicity, "reasons")) {
						Object.values(memberDuplicity.reasons).forEach((reason) => {
							if (typeof reason === "number" || typeof reason === "string") {
								this.table.data[key].idType.push(reason);
								this.table.data[key].idNumber.push(reason);
							} else {
								this.table.data[key].idType.push(reason["ID Type"]);
								this.table.data[key].idNumber.push(reason["ID Number"]);
							}
						});
						this.table.data[key].idType.push("memberDuplicitiesLastItem");
						this.table.data[key].idNumber.push("memberDuplicitiesLastItem");

						const isBeneficiaryIdDuplicityReason = memberDuplicity.reasons.some(
							(reason) => "Beneficiary ID" in reason,
						);

						if (isBeneficiaryIdDuplicityReason) {
							this.table.data[key].recordFrom.push("hasBeneficiaryIdDuplicity");
						}
					}

					if (Object.hasOwn(memberDuplicity, "differences")) {
						Object.entries(memberDuplicity.differences).forEach((difference) => {
							this.setRecordFrom(difference, key);
						});
						this.table.data[key].recordFrom.push("memberDuplicitiesLastItem");
					}

					if (!this.hasDuplicityDifferences(memberDuplicity.differences)) {
						this.table.data[key].recordFrom.push("hasNoDuplicityDifferences");
						this.table.data[key].recordFrom.push("memberDuplicitiesLastItem");
					}
					this.table.data[key].familyName.push("memberDuplicitiesLastItem");
					this.table.data[key].firstName.push("memberDuplicitiesLastItem");
				});

				this.table.data = this.table.data.map((items) => ({
					...items,
					toUpdateLoading: false,
					toLinkLoading: false,
				}));
			}
		},

		onStateFilter(filter) {
			const backendFilterName = this.statusFilterConvention[filter];

			this.statusActive[filter] = !this.statusActive[filter];

			if (this.selectedFilters.includes(backendFilterName)) {
				this.selectedFilters = this.selectedFilters.filter((item) => item !== backendFilterName);
			} else {
				this.selectedFilters.push(backendFilterName);
			}

			this.$emit("loaded", true);
			this.onFiltersChange({ status: this.selectedFilters });
		},

		async onFiltersChange(selectedFilters) {
			this.filters = selectedFilters;
			this.table.currentPage = 1;
			await this.fetchData();
		},

		transformProperty(text) {
			return text.replace(/([A-Z])/g, " $1")
				.replace(/^./, (str) => str.toUpperCase());
		},

		getSlashedArray(items) {
			const noData = "<b>No data</b>";

			if (typeof items.database === "string" && typeof items.import === "string"
				&& items.database?.length && items.import?.length) {
				return Object.values(items).reverse().join(" / ");
			}

			let database = typeof items.database === "number" || items.database?.length
				? items.database
				: noData;
			let imp = typeof items.import === "number" || items.import?.length
				? items.import
				: noData;

			if (Array.isArray(items.database)) {
				database = items.database[0]?.length ? items.database[0] : noData;
			}

			if (Array.isArray(items.import)) {
				imp = items.import[0]?.length ? items.import[0] : noData;
			}

			return `${imp} / ${database}`;
		},

		setRecordFrom(difference, key) {
			if (difference[1]?.database?.length || difference[1]?.import?.length) {
				if (typeof difference[1] === "number" || typeof difference[1] === "string") {
					this.table.data[key].recordFrom.push(`
						${difference[0]}
						-
						${difference[1]}
					`);
				} else {
					this.table.data[key].recordFrom.push(`
						${this.transformProperty(difference[0])}
						:
						${this.getSlashedArray(difference[1])}
					`);
				}
			}
		},

		hasDuplicityDifferences(differences) {
			return !Object.values(differences).every((item) => item === null);
		},

		async onResolveToUpdate(queueId, acceptedDuplicityId, duplicityKey) {
			await this.resolveImportItemDuplicity(
				queueId,
				IMPORT.ITEM_STATUS.TO_UPDATE,
				acceptedDuplicityId,
				duplicityKey,
				"toUpdateLoading",
			);
		},

		async onResolveToLink(queueId, acceptedDuplicityId, duplicityKey) {
			await this.resolveImportItemDuplicity(
				queueId,
				IMPORT.ITEM_STATUS.TO_LINK,
				acceptedDuplicityId,
				duplicityKey,
				"toLinkLoading",
			);
		},

		async resolveImportItemDuplicity(queueId, state, acceptedDuplicityId, duplicityKey, button) {
			if (duplicityKey !== null) {
				this.table.data[duplicityKey][button] = true;
			}

			this.table.data[duplicityKey].disabled = true;

			await ImportService.resolveImportItemDuplicity(queueId, state, acceptedDuplicityId)
				.then(({ status }) => {
					if (status === 202) {
						if (state === IMPORT.ITEM_STATUS.TO_LINK) {
							this.table.data[duplicityKey].state = IMPORT.ITEM_STATE.DUPLICITY_KEEP_THEIRS;
						}

						if (state === IMPORT.ITEM_STATUS.TO_UPDATE) {
							this.table.data[duplicityKey].state = IMPORT.ITEM_STATE.DUPLICITY_KEEP_OURS;
						}

						Notification(this.$t("Solved"), "success");
					}

					if (status === 400) {
						Notification(`${this.$t("Not Solved")}`, "warning");
					}
				}).catch((e) => {
					if (e.message) {
						if (duplicityKey !== null) {
							this.table.data[duplicityKey][button] = false;
						}

						this.table.data[duplicityKey].disabled = false;
					}
					Notification(`${this.$t("Duplicity resolve")} ${e.message || e}}`, "error");
				});

			this.table.data = this.table.data.map((item) => ({
				...item,
				toUpdateLoading: false,
				toLinkLoading: false,
			}));
			this.$emit("updated");
		},

		isFromFileSelected(item) {
			return this.table.data[item].state === IMPORT.ITEM_STATE.DUPLICITY_KEEP_OURS;
		},

		isFromHumansisSelected(item) {
			return this.table.data[item].state === IMPORT.ITEM_STATE.DUPLICITY_KEEP_THEIRS;
		},

		isDataForTableLoading(item) {
			return this.table.data[item].toUpdateLoading
				|| this.table.data[item].toLinkLoading
				|| this.isFormChangesLoading;
		},

		isResolveFromFileDisabled(item) {
			return this.isDataForTableLoading(item)
				|| this.table.data[item].recordFrom?.includes("hasBeneficiaryIdDuplicity");
		},
	},

};
</script>

<style scoped>
.duplicity-button {
	width: max-content !important;
}
</style>
