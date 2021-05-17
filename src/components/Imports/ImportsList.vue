<!-- TODO Refactor this for Imports, not Projects -->
<template>
	<Table
		v-show="show"
		has-reset-sort
		has-search
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		@clicked="goToDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort"
		@search="onSearch"
	>
		<template v-for="column in table.columns">
			<b-table-column
				:sortable="column.sortable"
				v-bind="column"
				:key="column.id"
				v-slot="props"
			>
				<ColumnField :data="props" :column="column" />
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			centered
			width="180"
			field="actions"
			:label="$t('Actions')"
		>
			<div class="buttons is-right">
				<ActionButton
					icon="search"
					type="is-primary"
					:tooltip="$t('Show Detail')"
					@click="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					v-if="userCan.editProject"
					icon="edit"
					:tooltip="$t('Edit')"
					@click="showEdit(props.row.id)"
				/>
				<SafeDelete
					v-if="userCan.deleteProject"
					icon="trash"
					:entity="$t('Project')"
					:tooltip="$t('Delete')"
					:disabled="!props.row.deletable"
					:id="props.row.id"
					@submitted="onDelete"
				/>
			</div>
		</b-table-column>
		<template #filterButton>
			<b-button
				slot="trigger"
				:icon-right="advancedSearchVisible ? 'arrow-up' : 'arrow-down'"
				@click="filtersToggle"
			>
				{{ $t('Advanced Search') }}
			</b-button>
			<b-button
				class="ml-3 is-info is-light"
				slot="trigger"
				icon-right="spinner"
			>
				{{ $t('In Progress') }}
			</b-button>
			<b-button
				class="ml-3 is-success is-light"
				slot="trigger"
				icon-right="check"
			>
				{{ $t('Done') }}
			</b-button>
			<b-button
				class="ml-3 is-warning is-light"
				slot="trigger"
				icon-right="ban"
			>
				{{ $t('Canceled') }}
			</b-button>
		</template>
		<template #filter>
			<b-collapse v-model="advancedSearchVisible">
				<ImportsFilter
					@filtersChanged="onFiltersChange"
				/>
			</b-collapse>
		</template>
		<template #progress>
			<b-progress :value="table.progress" format="percent" />
		</template>
	</Table>
</template>

<script>
import { mapState } from "vuex";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import ColumnField from "@/components/DataGrid/ColumnField";
import ProjectService from "@/services/ProjectService";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import grid from "@/mixins/grid";
import baseHelper from "@/mixins/baseHelper";
import DonorService from "@/services/DonorService";
import permissions from "@/mixins/permissions";
import ImportsFilter from "@/components/Imports/ImportsFilter";

export default {
	name: "ProjectList",

	components: {
		SafeDelete,
		Table,
		ActionButton,
		ColumnField,
		ImportsFilter,
	},

	mixins: [permissions, grid, baseHelper],

	data() {
		return {
			advancedSearchVisible: false,
			filters: [],
			exportLoading: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id", width: "90", sortable: true },
					{ key: "name", width: "200", sortable: true },
					{ key: "sectors", width: "150", type: "svgIcon" },
					{ key: "startDate", type: "datetime", width: "120", sortable: true },
					{ key: "endDate", type: "datetime", width: "120", sortable: true },
					{ key: "donors", width: "150" },
					{ key: "target", label: "Target Households", width: "90" },
					{ key: "numberOfHouseholds", label: "Registered Households", width: "130", sortable: true },
					{ key: "beneficiariesReached", label: "Beneficiaries Reached", width: "130", sortable: true },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	created() {
		this.fetchData();
	},

	computed: {
		...mapState(["availableProjects"]),
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await ProjectService.getListOfProjects(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then(async ({ data, totalCount }) => {
				this.table.data = [];
				this.table.total = totalCount;
				if (data.length > 0) {
					this.prepareDataForTable(data);
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Projects")} ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		async onFiltersChange(selectedFilters) {
			this.filters = selectedFilters;
			await this.fetchData();
		},

		prepareDataForTable(data) {
			const donorIds = [];
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].sectors = item.sectors
					.map((sector) => ({ code: sector, value: sector }));

				donorIds.push(...item.donorIds);
			});
			this.prepareDonorsForTable([...new Set(donorIds)]);
		},

		async prepareDonorsForTable(ids) {
			const donors = await this.getDonors(ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].donors = this.prepareDonors(item, donors);
			});
			this.reload();
		},

		prepareDonors(item, donors) {
			if (!donors?.length || !item.donorIds?.length) return this.$t("None");
			let result = "";

			item.donorIds.forEach((id) => {
				const foundDonor = donors.find((donor) => donor.id === id);

				if (foundDonor) {
					if (result === "") {
						result = foundDonor.shortname;
					} else {
						result += `, ${foundDonor.shortname}`;
					}
				}
			});

			return result;
		},

		async getDonors(ids) {
			return DonorService.getListOfDonors(null, null, null, null, ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Donors")} ${e}`, "is-danger");
				});
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		goToDetail(project) {
			if (this.userCan.viewProject) this.$router.push({ name: "Import", params: { importId: project.id } });
		},

		edit(id) {
			const project = this.table.data.find((item) => item.id === id);
			this.$emit("onEdit", project);
		},

		onDelete(id) {
			this.$emit("onDelete", id);
		},

		showDetailWithId(id) {
			const project = this.table.data.find((item) => item.id === id);
			this.$emit("onShowDetail", project);
		},

		async exportProjects(format) {
			this.exportLoading = true;
			await ProjectService.exportProjects(format)
				.then(({ data }) => {
					const blob = new Blob([data], { type: data.type });
					const link = document.createElement("a");
					link.href = window.URL.createObjectURL(blob);
					link.download = `projects.${format}`;
					link.click();
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Export Projects")} ${e}`, "is-danger");
				});
			this.exportLoading = false;
		},
	},
};
</script>