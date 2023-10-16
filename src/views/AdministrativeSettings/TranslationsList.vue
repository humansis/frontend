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
		>
			<template v-for="column in table.columns">
				<b-table-column
					v-slot="props"
					:key="column.id"
					sortable
					v-bind="column"
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
						:id="props.index"
						tabindex="-1"
						icon="trash"
						entity="Translation"
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
					{{ $t('Add Translation') }}
				</b-button>
			</template>
		</Table>

		<div class="buttons flex-end">
			<b-button
				type="is-primary"
				icon-left="save"
				@click="submit"
			>
				{{ $t('Save') }}
			</b-button>
		</div>
	</div>
</template>

<script>
import TranslationService from "@/services/TranslationService";
import ColumnField from "@/components/DataGrid/ColumnField";
import Table from "@/components/DataGrid/Table";
import SafeDelete from "@/components/SafeDelete";
import grid from "@/mixins/grid";
import { generateColumns } from "@/utils/datagrid";
import { Notification, Toast } from "@/utils/UI";

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
				if (e.message) Notification(`${this.$t("Translations")} ${e}`, "is-danger");
			});
		},

		async submit() {
			// const data = this.table.data.filter((item) => item.key);
			await TranslationService.saveTranslation()
				.then((response) => {
					if (response.status === 200) {
						Toast(this.$t("Translation successfully saved"), "is-success");
						this.fetchData();
					}
				}).catch((e) => {
					Toast(`${this.$t("Translations")} ${e}`, "is-danger");
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
