<template>
	<div>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@pageChanged="onPageChange"
			@sorted="onSort"
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
		</Table>

		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="submit"
		>
			Save
		</b-button>
	</div>
</template>

<script>
import ColumnField from "@/components/DataGrid/ColumnField";
import Table from "@/components/DataGrid/Table";
import { generateColumns } from "@/utils/datagrid";
import TranslationService from "@/services/TranslationService";

export default {
	name: "Translations",

	components: {
		Table,
		ColumnField,
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
						type: "editable",
						key: "key",
						label: "Key",
					},
					{
						type: "editable",
						key: "en",
						label: "English",
					},
					{
						type: "editable",
						key: "de",
						label: "Deutsch",
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

				await TranslationService.getTranslations(
					this.table.currentPage,
					this.table.perPage,
					"desc",
				).then((response) => {
					this.table.data = response.data;
					this.table.total = response.totalCount;
					this.table.columns = generateColumns(
						this.table.visibleColumns,
					);
				});

				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},
		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},

		submit() {
			console.log(this.table.data);
		},
	},
};
</script>

<style scoped>

</style>
