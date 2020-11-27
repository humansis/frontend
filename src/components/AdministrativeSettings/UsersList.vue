<template>
	<div>
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input
						placeholder="Search..."
						type="search"
						icon="search"
					/>
				</b-field>
			</div>
		</div>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>
			<b-table-column
				v-slot="props"
				label="Actions"
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
import { Toast } from "@/utils/UI";

export default {
	name: "UsersList",

	components: {
		SafeDelete,
		Table,
		ActionButton,
	},

	data() {
		return {
			fetch: {
				error: null,
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "email",
						label: "Email",
					},
					{
						key: "rights",
						label: "Rights",
					},
					{
						key: "prefix",
						label: "Prefix",
					},
					{
						key: "organization",
						label: "Organization",
					},
					{
						key: "phoneNumber",
						label: "Phone Number",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
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
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open();

				await UsersService.getListOfUsers(
					this.table.currentPage,
					this.table.perPage,
					"desc",
				).then((response) => {
					this.table.data = response.data;
					this.table.total = response.totalCount;
					this.table.columns = generateColumns(
						this.table.visibleColumns,
					);
				}).catch((e) => { Toast(e, "is-danger"); });

				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
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

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},
	},
};
</script>
