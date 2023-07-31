<template>
	<div v-if="!duplicitiesLoading && !this.isTotalCountLoading">
		<hr class="content-separator">

		<h2 class="subtitle is-5 mb-4">
			{{ header }} ({{ totalCountOfDuplicities  }})
		</h2>

		<hr>

		<div class="level p-3 has-border-bottom">
			<div class="level-left">
				<div class="mr-3">
					<b-icon icon="filter" />
					Filter
				</div>

				<b-button
					:class="filterButtonNotSolved"
					@click="stateFilter('notSolved')"
				>
					{{ $t('Not resolved') }}
				</b-button>

				<b-button
					:class="filterButtonFromFile"
					@click="stateFilter('fromFile')"
				>
					{{ $t('From file') }}
				</b-button>

				<b-button
					:class="filterButtonFromHumansis"
					@click="stateFilter('fromHumansis')"
				>
					{{ $t('From humansis') }}
				</b-button>
			</div>
		</div>

		<Table
			default-sort-key="dateDistribution"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isExportLoading"
			:show-table-header="false"
			no-data-message="No data for these filters"
			@pageChanged="onPageChange"
			@changePerPage="onChangePerPage"
		>
			<template v-for="column in table.columns">
				<b-table-column
					v-bind="column"
					:sortable="column.sortable"
					:key="column.id"
					v-slot="props"
				>
					<ColumnField :data="props" :column="column" />
				</b-table-column>
			</template>
			<b-table-column
				v-slot="props"
				width="230"
				field="actions"
				:label="$t('Use Record From')"
			>
				<b-field grouped class="action-row">
					<b-button
						:class="fromFileClasses(props.index)"
						:disabled="isDataForTableLoading(props.index)"
						:loading="table.data[props.index].toUpdateLoading"
						@click="resolveToUpdate(
							table.data[props.index].itemId,
							table.data[props.index].duplicityCandidateId,
							props.index
						)"
					>
						{{ $t('File') }}
					</b-button>

					<b-button
						:class="fromHumansisClasses(props.index)"
						:disabled="isDataForTableLoading(props.index)"
						:loading="table.data[props.index].toLinkLoading"
						@click="resolveToLink(
							table.data[props.index].itemId,
							table.data[props.index].duplicityCandidateId,
							props.index
						)"
					>
						{{ $t('Humansis') }}
					</b-button>
				</b-field>
			</b-table-column>
		</Table>
	</div>
	<div v-else>
		<b-loading :is-full-page="false" :active="true" />
	</div>
</template>

<script>
import ImportService from "@/services/ImportService";
import { Notification, Toast } from "@/utils/UI";
import consts from "@/utils/importConst";
import ColumnField from "@/components/DataGrid/ColumnField";
import { generateColumns } from "@/utils/datagrid";
import Table from "@/components/DataGrid/Table";
import grid from "@/mixins/grid";

export default {
	name: "DuplicityResolver",

	components: {
		ColumnField,
		Table,
	},

	mixins: [grid],

	data() {
		return {
			consts,
			isExportLoading: false,
			isTotalCountLoading: false,
			selectedFilters: [consts.ITEM_STATE.DUPLICITY_CANDIDATE],
			statusFilterConvention: {
				notSolved: consts.ITEM_STATE.DUPLICITY_CANDIDATE,
				fromFile: consts.ITEM_STATE.DUPLICITY_KEEP_OURS,
				fromHumansis: consts.ITEM_STATE.DUPLICITY_KEEP_THEIRS,
			},
			filters: { status: [consts.ITEM_STATE.DUPLICITY_CANDIDATE] },
			statusActive: {
				notSolved: true,
				fromFile: false,
				fromHumansis: false,
			},
			totalCountOfDuplicities: 0,
			table: {
				data: [],
				columns: generateColumns([
					{ key: "familyName", label: "Local family name", type: "arrayTextBreakForDuplicities", bold: true },
					{ key: "firstName", label: "Local given name", type: "arrayTextBreakForDuplicities", bold: true },
					{ key: "idType", type: "arrayTextBreakForDuplicities", label: "ID Type" },
					{ key: "idNumber", type: "arrayTextBreakForDuplicities", label: "ID Number" },
					{
						key: "recordFrom",
						type: "arrayTextBreakForDuplicitiesRecords",
						label: "Records From File / Humansis",
					},
				]),
				total: 0,
				currentPage: 1,
			},
		};
	},

	props: {
		header: {
			type: String,
			required: true,
		},
		duplicitiesLoading: {
			type: Boolean,
		},
		formChangesLoading: {
			type: Boolean,
		},

	},

	created() {
		this.getTotalCountOfDuplicities();
		this.fetchData();
	},

	watch: {
		duplicites(value) {
			this.$emit("duplicitiesChange", value);
		},
	},

	computed: {
		filterButtonNotSolved() {
			return [
				"btn",
				"mr-1",
				{ "is-selected": this.statusActive.notSolved },
			];
		},

		filterButtonFromFile() {
			return [
				"btn",
				"mr-1",
				{ "is-selected": this.statusActive.fromFile },
			];
		},

		filterButtonFromHumansis() {
			return [
				"btn",
				"mr-1",
				{ "is-selected": this.statusActive.fromHumansis },
			];
		},

		duplicities() {
			return this.table.data;
		},
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
				if (e.message) Notification(`${this.$t("Duplicities")} ${e}`, "is-danger");
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
				if (e.message) Notification(`${this.$t("Duplicities")} ${e}`, "is-danger");
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

		stateFilter(filter) {
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

		async resolveToUpdate(queueId, acceptedDuplicityId, duplicityKey) {
			await this.resolveImportItemDuplicity(
				queueId,
				consts.ITEM_STATUS.TO_UPDATE,
				acceptedDuplicityId,
				duplicityKey,
				"toUpdateLoading",
			);
		},

		async resolveToLink(queueId, acceptedDuplicityId, duplicityKey) {
			await this.resolveImportItemDuplicity(
				queueId,
				consts.ITEM_STATUS.TO_LINK,
				acceptedDuplicityId,
				duplicityKey,
				"toLinkLoading",
			);
		},

		async resolveImportItemDuplicity(
			queueId, state, acceptedDuplicityId, duplicityKey, button,
		) {
			if (duplicityKey !== null) {
				this.table.data[duplicityKey][button] = true;
			}

			this.table.data[duplicityKey].disabled = true;

			await ImportService.resolveImportItemDuplicity(queueId, state, acceptedDuplicityId)
				.then(({ status }) => {
					if (status === 202) {
						if (state === consts.ITEM_STATUS.TO_LINK) {
							this.table.data[duplicityKey].state = consts.ITEM_STATE.DUPLICITY_KEEP_THEIRS;
						}

						if (state === consts.ITEM_STATUS.TO_UPDATE) {
							this.table.data[duplicityKey].state = consts.ITEM_STATE.DUPLICITY_KEEP_OURS;
						}

						Toast(this.$t("Solved"), "is-success");
					}

					if (status === 400) {
						Notification(`${this.$t("Not Solved")}`, "is-warning");
					}
				}).catch((e) => {
					if (e.message) {
						if (duplicityKey !== null) {
							this.table.data[duplicityKey][button] = false;
						}

						this.table.data[duplicityKey].disabled = false;
					}
				});

			this.table.data = this.table.data.map((item) => ({
				...item,
				toUpdateLoading: false,
				toLinkLoading: false,
			}));
			this.$emit("updated");
		},

		fromFileClasses(item) {
			const isOutlined = this.table.data[item].state === consts.ITEM_STATE.DUPLICITY_KEEP_OURS;

			return [
				"is-info",
				"button-to-update",
				{ "is-outlined": !isOutlined },
			];
		},

		fromHumansisClasses(item) {
			const isOutlined = this.table.data[item].state === consts.ITEM_STATE.DUPLICITY_KEEP_THEIRS;

			return [
				"is-info",
				"button-to-link",
				{ "is-outlined": !isOutlined },
			];
		},

		isDataForTableLoading(item) {
			return this.table.data[item].toUpdateLoading
				|| this.table.data[item].toLinkLoading
				|| this.formChangesLoading;
		},
	},

};
</script>

<style lang="scss" scoped>
.btn {
	outline: none !important;
	box-shadow: none !important;
	color: #0f77ea;
	border-color: #0f77ea;

	&.is-selected,
	&.is-selected:focus,
	&:hover	{
		background-color: #0f77ea;
		border-color: transparent;
		color: #fff;
	}
}

.content-separator {
	height: 3px;
	background: #074f60;
}
</style>

<style>
.button-to-update {
	border-bottom-right-radius: 0;
	border-top-right-radius: 0;
}

.button-to-link {
	border-bottom-left-radius: 0;
	border-top-left-radius: 0;
	border-left: none;
}

.action-row .is-grouped {
	justify-content: right;
}
</style>
