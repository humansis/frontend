<template>
	<Table
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
			:label="$t('Actions')"
		>
			<div class="buttons is-right">
				<ActionButton
					icon="search"
					type="is-primary"
					:tooltip="$t('Show Detail')"
					@click.native="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					icon="edit"
					:tooltip="$t('Edit')"
					@click.native="edit(props.row.id)"
				/>
				<SafeDelete
					icon="trash"
					:entity="$t('Project')"
					:tooltip="$t('Delete')"
					:disabled="!props.row.deletable"
					:id="props.row.id"
					@submitted="onDelete"
				/>
			</div>
		</b-table-column>
	</Table>
</template>

<script>
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

export default {
	name: "ProjectList",

	mixins: [grid, baseHelper],

	components: {
		SafeDelete,
		Table,
		ActionButton,
		ColumnField,
	},

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id", width: "90", sortable: true },
					{ key: "name", width: "434", sortable: true },
					{ key: "donors", width: "150" },
					{ key: "startDate", type: "datetime", width: "120", sortable: true },
					{ key: "endDate", type: "datetime", width: "120", sortable: true },
					{ key: "target", width: "90" },
					{ key: "numberOfHouseholds", label: "Number of Households", width: "130", sortable: true },
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

	mounted() {
		this.fetchData();
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
					await this.prepareDataForTable(data);
				}
			}).catch((e) => {
				Notification(`${this.$t("Projects")} ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		async prepareDataForTable(data) {
			this.table.data = data;
			const donorIds = [];
			data.map(async (item) => {
				donorIds.push(...item.donorIds);
			});
			await this.prepareDonorsForTable([...new Set(donorIds)]);
		},

		async prepareDonorsForTable(ids) {
			const donors = await this.getDonors(ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].donors = this.prepareDonors(item, donors);
			});
		},

		prepareDonors(item, donors) {
			if (!donors?.length) return this.$t("None");
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
					Notification(`${this.$t("Donors")} ${e}`, "is-danger");
				});
		},

		goToDetail(project) {
			this.$router.push({ name: "Project", params: { projectId: project.id } });
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

	},
};
</script>
