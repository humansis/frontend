<template>
	<Table
		has-search
		has-reset-sort
		has-export
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		@clicked="showDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort"
		@search="onSearch"
	>
		<template v-for="column in table.columns">
			<b-table-column
				v-bind="column"
				v-slot="props"
				:sortable="column.sortable"
				:key="column.id"
			>
				<ColumnField :column="column" :data="props" />
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			:label="$t('Actions')"
			width="145"
			centered
		>
			<div class="buttons is-right">
				<ActionButton
					icon="search"
					type="is-primary"
					:tooltip="$t('Show Detail')"
					@click.native="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					v-if="userCan.addEditDonors"
					icon="edit"
					:tooltip="$t('Edit')"
					@click.native="showEdit(props.row.id)"
				/>
				<SafeDelete
					v-if="userCan.addEditDonors"
					icon="trash"
					:entity="$t('Donor')"
					:id="props.row.id"
					:tooltip="$t('Delete')"
					@submitted="remove"
				/>
			</div>
		</b-table-column>
		<template #export>
			<ExportButton
				space-between
				:formats="{ xlsx: true, csv: true, ods: true}"
			/>
		</template>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import ColumnField from "@/components/DataGrid/ColumnField";
import DonorService from "@/services/DonorService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";
import ExportButton from "@/components/ExportButton";
import permissions from "@/mixins/permissions";

export default {
	name: "DonorList",

	components: {
		ExportButton,
		ColumnField,
		SafeDelete,
		Table,
		ActionButton,
	},

	mixins: [grid, permissions],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ type: "text", key: "fullname", label: "Donor Name", width: "500", sortable: true },
					{ type: "text", key: "shortname", width: "200", sortable: true },
					{ type: "image", key: "logo", label: "Organization Logo", width: "200" },
					{ type: "text", key: "notes", width: "200" },
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
			await DonorService.getListOfDonors(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				Notification(`${this.$t("Donors")} ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},
	},
};
</script>
