<template>
	<div>
		<ReportNavbar
			@periodChanged="onPeriodFilterChange"
			@choosePeriodChanged="onChoosePeriodFilterChange"
		/>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			:is-loading="isLoadingList"
			@clicked="goToDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" sortable :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>
			<b-table-column
				label="Actions"
			>
				<div class="block">
					<ActionButton icon="search" type="is-info" />
					<ActionButton icon="trash" type="is-danger" />
					<ActionButton icon="copy" type="is-dark" />
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import CountryReportService from "@/services/CountryReportService";
import ReportNavbar from "@/components/Reports/ReportNavbar";
import grid from "@/mixins/grid";

export default {
	name: "CountryReportList",

	components: {
		ReportNavbar,
		Table,
		ActionButton,
	},

	mixins: [grid],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "name",
						label: "Name",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
				sortDirection: "",
				sortColumn: "",
			},
			selectedPeriod: null,
			choosePeriod: null,
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
			await CountryReportService.getListOfCountryReports(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.period,
				this.choosePeriod,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				Notification(`Country Reports ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		goToDetail() {
			// TODO go to detail
		},

		onPeriodFilterChange(period) {
			this.selectedPeriod = period;
			this.fetchData();
		},

		onChoosePeriodFilterChange(choosePeriod) {
			this.choosePeriod = choosePeriod;
			this.fetchData();
		},
	},
};
</script>
