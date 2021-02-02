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
			ref="upcomingAssistances"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" sortable :key="column.id" v-slot="props">
					<ColumnField :data="props" :column="column" />
				</b-table-column>
			</template>
		</Table>
	</div>
</template>

<script>
import Modal from "@/components/Modal";
import Table from "@/components/DataGrid/Table";
import AssistanceForm from "@/components/Assistance/AssistanceForm";
import ColumnField from "@/components/DataGrid/ColumnField";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import grid from "@/mixins/grid";

export default {
	name: "UpcomingAssistances",

	components: {
		AssistanceForm,
		Table,
		Modal,
		ColumnField,
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
					{
						key: "beneficiaries",
						label: "Beneficiaries",
					},
					{
						key: "dateDistribution",
						label: "Date Of Distribution",
					},
					{ key: "target" },
					{
						type: "commodity",
						key: "commodityIds",
						label: "Commodity",
					},
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

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await AssistancesService.getListOfAssistances(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				true,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				Notification(`Upcoming Assistances ${e}`, "is-danger");
			});

			this.isLoadingList = false;
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
