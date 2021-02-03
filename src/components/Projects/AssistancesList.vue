<template>
	<div>
		<div v-if="!upcoming" class="columns">
			<Search class="column is-two-fifths" @search="onSearch" />
			<ExportButton
				class="column"
				type="is-success"
				size="is-default"
				space-between
				:formats="{ xlsx: true, csv: true, ods: true}"
				@exportData="exportAssistance"
			/>
		</div>
		<b-progress :value="table.progress" format="percent" />
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			@clicked="onRowClick"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@changePerPage="onChangePerPage"
		>
			<template v-for="column in table.columns">
				<b-table-column
					sortable
					v-bind="column"
					:key="column.id"
					v-slot="props"
				>
					<ColumnField :data="props" :column="column" />
				</b-table-column>
			</template>
			<b-table-column
				v-if="!upcoming"
				v-slot="props"
				label="Actions"
				centered
				width="230"
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-info"
						tooltip="Show Detail"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						tooltip="Edit"
						@click.native="showEdit(props.row.id)"
					/>
					<ActionButton
						icon="lock"
						type="is-danger"
						tooltip="Lock"
						@click.native="goToValidateAndLockWithId(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Assistance"
						tooltip="Delete"
						:id="props.row.id"
						@submitted="$emit('onRemove', $event)"
					/>
					<ActionButton
						icon="copy"
						type="is-dark"
						tooltip="Print"
						@click.native="$emit('onPrint', props.row.id)"
					/>
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import Table from "@/components/DataGrid/Table";
import SafeDelete from "@/components/SafeDelete";
import ActionButton from "@/components/ActionButton";
import ExportButton from "@/components/ExportButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import Search from "@/components/Search";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import { prepareDataForTable } from "@/mappers/assistanceMapper";
import grid from "@/mixins/grid";

export default {
	name: "AssistancesList",

	components: {
		Search,
		Table,
		ActionButton,
		SafeDelete,
		ColumnField,
		ExportButton,
	},

	props: {
		upcoming: Boolean,
	},

	mixins: [grid],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "id",
						label: "Assistance ID",
					},
					{ key: "name" },
					{
						key: "location",
						label: "Location",
					},
					{
						key: "beneficiaries",
						label: "Beneficiaries",
					},
					{
						key: "dateDistribution",
						label: "Date Of Distribution",
						type: "date",
					},
					{ key: "target" },
					{
						key: "commodity",
						label: "Commodity",
					},
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
				progress: null,
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	computed: {
		title() {
			return this.upcoming ? "Upcoming Assistances" : "Project Assistances";
		},
	},

	methods: {
		...mapActions(["addAssistanceToState"]),

		async fetchData() {
			this.isLoadingList = true;
			this.table.progress = null;

			this.table.columns = generateColumns(this.table.visibleColumns);
			if (this.upcoming) {
				await this.fetchUpcomingAssistances();
			} else {
				await this.fetchProjectAssistances();
			}
			this.isLoadingList = false;
		},

		async fetchProjectAssistances() {
			await AssistancesService.getListOfProjectAssistances(
				this.$route.params.projectId,
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then(async ({ data, totalCount }) => {
				this.table.progress = 0;
				this.table.total = totalCount;
				if (totalCount !== 0) {
					this.table.data = await prepareDataForTable(data);
				}
			}).catch((e) => {
				Notification(`Assistance ${e}`, "is-danger");
			});
		},

		async fetchUpcomingAssistances() {
			await AssistancesService.getListOfAssistances(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				true,
			).then(async ({ data, totalCount }) => {
				this.table.total = totalCount;
				this.table.data = await prepareDataForTable(data);
			}).catch((e) => {
				Notification(`Upcoming Assistances ${e}`, "is-danger");
			});
		},

		goToValidateAndLockWithId(id) {
			const assistance = this.table.data.find((item) => item.id === id);
			this.onRowClick(assistance);
		},

		onRowClick(assistance) {
			if (this.upcoming) {
				this.showDetail(assistance);
			} else {
				this.addAssistanceToState(assistance);
				this.$router.push({ name: "Assistance",
					params: {
						assistanceId: assistance.id,
					},
				});
			}
		},

		exportAssistance(format) {
			// TODO Export assistance
			console.log(format);
		},
	},
};
</script>
