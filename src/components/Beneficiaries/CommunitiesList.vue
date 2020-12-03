<template>
	<div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="fetchData" />
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
				width="150"
				centered
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-link"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="showEdit(props.row.id)"
					/>
					<SafeDelete
						:id="props.row.id"
						icon="trash"
						entity="Community"
						@submitted="remove"
					/>
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import CommunitiesService from "@/services/CommunitiesService";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import { Toast } from "@/utils/UI";
import Search from "@/components/Search";

export default {
	name: "CommunitiesList",

	components: {
		Search,
		SafeDelete,
		Table,
		ActionButton,
	},

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "name",
					},
					{
						key: "contactGivenName",
						label: "Contact Name",
					},
					{
						key: "contactFamilyName",
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
		async fetchData(value) {
			this.$store.commit("loading", true);

			await CommunitiesService.getListOfCommunities(
				this.table.currentPage,
				this.table.perPage,
				"desc",
				value,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => {
				Toast(`(Communities) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		showEdit(id) {
			const community = this.table.data.find((item) => item.id === id);
			this.$emit("onShowEdit", community);
		},

		showDetailWithId(id) {
			const community = this.table.data.find((item) => item.id === id);
			this.showDetail(community);
		},

		showDetail(community) {
			this.$emit("onShowDetail", community);
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
