<!-- TODO Not used for now -->
<template>
	<div>
		<Table
			has-reset-sort
			has-search
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:search-phrase="table.searchPhrase"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@resetSort="resetSort"
			@onSearch="onSearch"
			@updateSearchPhrase="updateSearchPhrase"
		>
			<template v-for="column in table.columns">
				<b-table-column
					sortable
					v-bind="column"
					v-slot="props"
					:key="column.id"
				>
					<ColumnField :column="column" :data="props" />
				</b-table-column>
			</template>
			<b-table-column
				v-slot="props"
				label="Actions"
			>
				<div class="buttons is-right">
					<SafeDelete
						tabindex="-1"
						icon="trash"
						entity="Translation"
						:id="props.index"
						@submitted="remove"
					/>
				</div>
			</b-table-column>
			<template #export>
				<b-button
					type="is-primary"
					icon-left="plus"
					@click="addTranslation"
				>
					Add Translation
				</b-button>
			</template>
		</Table>

		<div class="buttons flex-end">
			<b-button
				type="is-primary"
				icon-left="save"
				@click="submit"
			>
				Save
			</b-button>
		</div>
	</div>
</template>

<script>
import ColumnField from "@/components/DataGrid/ColumnField";
import SafeDelete from "@/components/SafeDelete";
import Table from "@/components/DataGrid/Table";
import TranslationService from "@/services/TranslationService";
import { generateColumns } from "@/utils/datagrid";
import { Toast, Notification } from "@/utils/UI";
import grid from "@/mixins/grid";

export default {
	name: "TranslationsList",

	components: {
		SafeDelete,
		Table,
		ColumnField,
	},

	mixins: [grid],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ type: "editable", key: "key" },
					{ type: "editable", key: "en", label: "English" },
					{ type: "editable", key: "de", label: "Deutsch" },
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

	methods: {
		async fetchData() {
			this.table.columns = generateColumns(this.table.visibleColumns);
			await TranslationService.getTranslations(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				if (e.message) Notification(`Translations ${e}`, "is-danger");
			});
		},

		async submit() {
			// const data = this.table.data.filter((item) => item.key);
			await TranslationService.saveTranslation()
				.then((response) => {
					if (response.status === 200) {
						Toast("Translation successfully saved", "is-success");
						this.fetchData();
					}
				}).catch((e) => {
					Toast(`Translations ${e}`, "is-danger");
				});
		},

		remove(index) {
			this.table.data.splice(index, 1);
		},

		addTranslation() {
			this.table.data.unshift({});
		},
	},
};
</script>
