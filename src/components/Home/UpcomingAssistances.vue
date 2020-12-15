<template>
	<div>
		<Modal
			can-cancel
			header="Assistance Detail"
			:active="assistanceModal.isOpened"
			@close="closeAssistanceModal"
		>
			<AssistanceForm
				close-button
				:formModel="assistanceModel"
				@formClosed="closeAssistanceModal"
			/>
		</Modal>
		<h2 class="title">Upcoming assistances</h2>
		<Table
			ref="table"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
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
		</Table>
	</div>
</template>

<script>
import { Toast } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import grid from "@/mixins/grid";
import Table from "@/components/DataGrid/Table";
import Modal from "@/components/Modal";
import AssistancesService from "@/services/AssistancesService";
import AssistanceForm from "@/components/Assistance/AssistanceForm";

export default {
	name: "UpcomingAssistances",

	components: {
		AssistanceForm,
		Table,
		Modal,
	},

	mixins: [grid],

	data() {
		return {
			assistanceModal: {
				isOpened: false,
			},
			assistanceModel: {},
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
						key: "adm1Id",
						label: "Location",
					},
					{ key: "beneficiaries" },
					{
						key: "dateDistribution",
						label: "Date of Distribution",
					},
					{ key: "target" },
					{
						type: "commodity",
						key: "commodity",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
				sortDirection: "",
				sortColumn: "",
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
			const loadingComponent = this.$buefy.loading.open({
				container: this.$refs.table,
			});

			await AssistancesService.getListOfAssistances(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				true,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => {
				Toast(`(Assistances) ${e}`, "is-danger");
			});

			loadingComponent.close();
		},

		closeAssistanceModal() {
			this.assistanceModal.isOpened = false;
		},

		showDetail(model) {
			// TODO Fix with connect locations
			this.assistanceModel = model;
			this.assistanceModal.isOpened = true;
		},
	},
};
</script>
