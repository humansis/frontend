<template>
	<div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="onSearch" />
			<ExportButton
				class="column"
				type="is-success"
				size="is-default"
				space-between
				:formats="{ xlsx: true, csv: true, ods: true}"
			/>
		</div>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			:is-loading="isLoadingList"
			@clicked="showDetail"
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
				v-slot="props"
				label="Actions"
				centered
			>
				<div class="block">
					<ActionButton
						icon="history"
						type="is-link"
						@click.native="sendHistory(props.row.id)"
					/>
					<ActionButton
						icon="search"
						type="is-link"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="showDetail(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="User"
						:id="props.row.id"
						@submitted="remove"
					/>
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import { generateColumns } from "@/utils/datagrid";
import SafeDelete from "@/components/SafeDelete";
import UsersService from "@/services/UsersService";
import { Notification } from "@/utils/UI";
import Search from "@/components/Search";
import ExportButton from "@/components/ExportButton";
import grid from "@/mixins/grid";

export default {
	name: "UsersList",

	components: {
		Search,
		ExportButton,
		SafeDelete,
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
					{ key: "email" },
					{ key: "rights" },
					{ key: "prefix" },
					{ key: "phoneNumber" },
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
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
			await UsersService.getListOfUsers(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				Notification(`Users ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		showEdit(id) {
			const user = this.table.data.find((item) => item.id === id);
			this.$emit("onShowEdit", user);
		},

		showDetailWithId(id) {
			const user = this.table.data.find((item) => item.id === id);
			this.showDetail(user);
		},

		showDetail(user) {
			this.$emit("onShowDetail", user);
		},

		sendHistory(id) {
			UsersService.sendHistory(id);
		},

		remove(id) {
			this.$emit("onRemove", id);
		},
	},
};
</script>
