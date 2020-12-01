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
				:editing="assistanceModal.isEditing"
				@formClosed="closeAssistanceModal"
				@formSubmitted="editAssistance"
			/>
		</Modal>
		<h2 class="title">Project assistances</h2>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="goToAddAssistance"
		>
			New
		</b-button>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@clicked="goToValidateAndLock"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>
			<template v-for="column in table.columns">
				<b-table-column
					v-bind="column"
					:key="column.id"
					v-slot="props"
				>
					<ColumnField :data="props" :column="column" />
				</b-table-column>
			</template>

			<b-table-column
				v-slot="props"
				label="Actions"
				width="220"
			>
				<div class="block">
					<ActionButton
						icon="edit"
						type="is-link"
						tooltip="Edit"
						@click.native="showEdit(props.row.id)"
					/>
					<ActionButton
						icon="search"
						type="is-link"
						tooltip="Show Detail"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="lock"
						type="is-danger"
						tooltip="Lock"
						@click.native="goToValidateAndLock(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Project"
						tooltip="Delete"
						:id="props.row.id"
						@submitted="removeAssistance"
					/>
					<ActionButton
						icon="copy"
						type="is-dark"
						tooltip="Print"
						@click.native="printAssistance(props.row.id)"
					/>
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import { Toast } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import Table from "@/components/DataGrid/Table";
import AssistancesService from "@/services/AssistancesService";
import ColumnField from "@/components/DataGrid/ColumnField";
import AssistanceForm from "@/components/Assistance/AssistanceForm";
import Modal from "@/components/Modal";

export default {
	name: "AssistancesList",

	components: {
		AssistanceForm,
		Table,
		ActionButton,
		SafeDelete,
		ColumnField,
		Modal,
	},

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
					{
						key: "name",
					},
					{
						key: "adm1Id",
						label: "Location",
					},
					{
						key: "dateDistribution",
						label: "Date Of Distribution",
					},
					{
						key: "target",
					},
					{
						key: "type",
					},
					{
						type: "count",
						key: "commodityIds",
						label: "Commodity",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			assistanceModal: {
				isOpened: false,
				isEditing: false,
			},
			assistanceModel: {
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
				dateOfAssistance: new Date(),
				target: "",
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

			await AssistancesService.getListOfProjectAssistances(
				this.$route.params.projectId,
				this.table.currentPage,
				this.table.perPage,
				"desc",
				false,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => { Toast(e, "is-danger"); });

			this.$store.commit("loading", false);
		},

		async removeAssistance(id) {
			await AssistancesService.removeAssistance(id).then((response) => {
				if (response.status === 204) {
					Toast("Assistance Successfully Deleted", "is-success");
					this.fetchData();
				}
			}).catch((e) => {
				Toast(`(Assistance) ${e}`, "is-danger");
			});
		},

		async printAssistance(id) {
			await AssistancesService.printAssistance(id).then((response) => {
				if (response.status === 200) {
					Toast("Download starting", "is-success");
				}
			}).catch((e) => {
				Toast(`(Assistance) ${e}`, "is-danger");
			});
		},

		goToAddAssistance() {
			this.$router.push({ name: "AddAssistance", params: { projectId: this.$route.params.projectId } });
		},

		goToValidateAndLock(id) {
			this.$router.push({ name: "Assistance",
				params: {
					assistanceId: id,
				} });
		},

		showDetailWithId(id) {
			this.assistanceModel = this.table.data.find((item) => item.id === id);
			this.assistanceModal = {
				isOpened: true,
				isEditing: false,
			};
		},

		showEdit(id) {
			this.assistanceModel = this.table.data.find((item) => item.id === id);
			this.assistanceModal = {
				isOpened: true,
				isEditing: true,
			};
		},

		closeAssistanceModal() {
			this.assistanceModal.isOpened = false;
		},

		async editAssistance(body) {
			await AssistancesService.updateAssistance(body.id, body).then((response) => {
				if (response.status === 200) {
					Toast("Assistance Successfully Updated", "is-success");
					this.fetchData();
				}
			}).catch((e) => {
				Toast(`(Assistance) ${e}`, "is-danger");
			});
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
