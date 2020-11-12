<template>
	<div>
		<Modal
			:active="addBeneficiaryModal.isOpened"
			:can-cancel="true"
			header="Add Beneficiaries To This Assistance"
			@close="closeAddBeneficiaryModal"
		>
			<AddBeneficiaryForm
				close-button
				:formModel="addBeneficiaryModel"
				submit-button-label="Add"
				@formSubmitted="submitAddBeneficiaryForm"
				@formClosed="closeAddBeneficiaryModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="openAddBeneficiaryModal"
		>
			Add
		</b-button>
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input placeholder="Search by keyword" type="search" icon="search" />
				</b-field>
			</div>
		</div>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>
			<template v-for="column in table.columns">
				<b-table-column :key="column.id" v-bind="column">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>

			<b-table-column
				label="Actions"
				v-slot="props"
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-info"
						@click.native="showDetail(props.row)"
					/>
					<ActionButton icon="trash" type="is-danger" />
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import BeneficiariesService from "@/services/BeneficiariesService";
import Table from "@/components/Table";
import ActionButton from "@/components/ActionButton";
import AddBeneficiaryForm from "@/components/Assistance/AssistanceList/AddBeneficiaryForm";
import Modal from "@/components/Modal";

export default {
	name: "AssistanceList",

	components: {
		AddBeneficiaryForm,
		Table,
		ActionButton,
		Modal,
	},

	data() {
		return {
			fetch: {
				error: null,
			},
			advancedSearchVisible: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "id",
						label: "Id",
					},
					{
						key: "shelterStatus",
						label: "Shelter Status",
					},
					{
						key: "notes",
						label: "Notes",
					},
					{
						key: "longitude",
						label: "Longitude",
					},
					{
						key: "latitude",
						label: "Latitude",
					},
					{
						key: "incomeLevel",
						label: "Income Level",
					},
					{
						key: "deptLevel",
						label: "Dept Level",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			addBeneficiaryModal: {
				isOpened: false,
			},
			addBeneficiaryModel: {
				beneficiaries: null,
				justification: null,
			},
			editBeneficiaryModal: {
				isOpened: false,
			},
			editBeneficiaryModel: {
				beneficiaries: null,
				justification: null,
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

				// TODO Get list of households by assistance id
				await BeneficiariesService.getListOfHouseholds(
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

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
		},

		openAddBeneficiaryModal() {
			this.addBeneficiaryModal.isOpened = true;
		},

		closeAddBeneficiaryModal() {
			this.addBeneficiaryModal.isOpened = false;
		},

		submitAddBeneficiaryForm() {
			this.addBeneficiaryModal.isOpened = false;
		},

		showDetail(beneficiary) {
			console.log(beneficiary.id);
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
