<template>
	<Table
		has-reset-sort
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:search-phrase="table.searchPhrase"
		@clicked="showDetail"
		@pageChanged="onPageChange"
		@changePerPage="onChangePerPage"
	>
		<template v-for="column in table.columns">
			<b-table-column
				v-bind="column"
				v-slot="props"
				:key="column.id"
			>
				<ColumnField :column="column" :data="props" />
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			width="150"
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
					icon="edit"
					:tooltip="$t('Edit')"
					@click="showEdit(props.row.id)"
				/>
				<ActionButton
					icon="print"
					type="is-dark"
					:tooltip="$t('Print')"
					@click="print(props.row.id)"
				/>
			</div>
		</b-table-column>
	</Table>
</template>

<script>
import MyOrganizationsService from "@/services/MyOrganizationsService";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import Table from "@/components/DataGrid/Table";
import grid from "@/mixins/grid";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

export default {
	name: "MyOrganizationsList",

	components: {
		ColumnField,
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
					{ key: "name", label: "Organization Name" },
					{ type: "image", key: "logo", label: "Organization Logo" },
					{ type: "font", key: "font", label: "Font to Apply to The PDF" },
					{ type: "color", key: "primaryColor", label: "Organization Primary Color" },
					{ type: "color", key: "secondaryColor", label: "Organization Secondary Color" },
					{ key: "footerContent", label: "PDF Footer Content" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await MyOrganizationsService.getListOfMyOrganizations()
				.then((response) => {
					this.table.data = response.data;
					this.table.total = response.totalCount;
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Organizations")} ${e}`, "is-danger");
				});

			this.isLoadingList = false;
		},

		print(id) {
			this.$emit("onPrint", id);
		},
	},

};
</script>
