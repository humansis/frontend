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
import ColumnField from "@/components/DataGrid/ColumnField";
import Table from "@/components/DataGrid/Table";
import { generateColumns } from "@/utils/datagrid";
import TranslationService from "@/services/TranslationService";
import SafeDelete from "@/components/SafeDelete";
import { Toast } from "@/utils/UI";

export default {
	name: "Translations",

	components: {
		SafeDelete,
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
				}).catch((e) => { Toast(e, "is-danger"); });

				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
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
				}).catch((e) => { Toast(e, "is-danger"); });
		},

		remove(index) {
			this.table.data.splice(index, 1);
		},

		addTranslation() {
			this.table.data.unshift({});
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
