<template>
	<div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="onSearch" />
			<div class="column is-pulled-right">
				<b-field>
					<b-button
						type="is-success"
						icon-left="plus"
						@click="addTranslation"
					>
						Add Translation
					</b-button>
				</b-field>
			</div>
		</div>
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
				centered
			>
				<div class="block">
					<SafeDelete
						tabindex="-1"
						icon="trash"
						entity="Translation"
						:id="props.index"
						@submitted="remove"
					/>
				</div>
			</b-table-column>
		</Table>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="save"
			@click="submit"
		>
			Save
		</b-button>
	</div>
</template>

<script>
// TODO Fix translations and check all functionalities in table
import ColumnField from "@/components/DataGrid/ColumnField";
import Table from "@/components/DataGrid/Table";
import { generateColumns } from "@/utils/datagrid";
import TranslationService from "@/services/TranslationService";
import SafeDelete from "@/components/SafeDelete";
import { Toast, Notification } from "@/utils/UI";
import Search from "@/components/Search";
import grid from "@/mixins/grid";

export default {
	name: "TranslationsList",

	components: {
		Search,
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
					{
						type: "editable",
						key: "key",
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
			this.$store.commit("loading", true);

			this.table.columns = generateColumns(this.table.visibleColumns);
			await TranslationService.getTranslations(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				Notification(`Translations ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		async submit() {
			// TODO send data via API service
			// const data = this.table.data.filter((item) => item.key);
			await TranslationService.saveTranslation()
				.then((response) => {
					if (response.status === 200) {
						Toast("Translation successfully saved", "is-success");
						this.fetchData();
					}
				}).catch((e) => {
					Notification(`Translations ${e}`, "is-danger");
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
