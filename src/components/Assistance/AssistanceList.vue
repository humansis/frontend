<template>
	<div>
		<Modal
			can-cancel
			header="Add Beneficiaries To This Assistance"
			:active="addBeneficiaryModal.isOpened"
			@close="closeAddBeneficiaryModal"
		>
			<AddBeneficiaryForm
				close-button
				submit-button-label="Confirm"
				:formModel="addBeneficiaryModel"
				@formSubmitted="submitAddBeneficiaryForm"
				@formClosed="closeAddBeneficiaryModal"
			/>
		</Modal>
		<Modal
			can-cancel
			header="Edit This Beneficiary"
			:active="editBeneficiaryModal.isOpened"
			@close="closeEditBeneficiaryModal"
		>
			<EditBeneficiaryForm
				close-button
				submit-button-label="Save"
				:formModel="editBeneficiaryModel"
				@formSubmitted="submitEditBeneficiaryForm"
				@formClosed="closeEditBeneficiaryModal"
			/>
		</Modal>
		<div class="buttons space-between">
			<b-button
				v-if="addButton"
				class="mb-5"
				size="is-medium"
				type="is-danger"
				icon-left="plus"
				@click="openAddBeneficiaryModal"
			>
				Add
			</b-button>
			<b-field v-if="changeButton" class="mb-5">
				<p class="control">
					<button class="button is-danger is-medium">
						<b-icon icon="exchange-alt" />
						<span>
							Change
						</span>
					</button>
				</p>
				<b-numberinput size="is-medium" placeholder="%" controls-position="compact" />
			</b-field>
			<b-button
				v-if="exportButton"
				class="mb-5"
				size="is-medium"
				type="is-success"
				icon-left="file-download"
			>
				Export
			</b-button>
		</div>
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
				<b-table-column v-bind="column" :key="column.id">
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
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import AddBeneficiaryForm from "@/components/Assistance/AssistanceList/AddBeneficiaryForm";
import EditBeneficiaryForm from "@/components/Assistance/AssistanceList/EditBeneficiaryForm";
import Modal from "@/components/Modal";
import { Toast } from "@/utils/UI";

export default {
	name: "AssistanceList",

	props: {
		addButton: Boolean,
		changeButton: Boolean,
		exportButton: Boolean,
	},

	components: {
		AddBeneficiaryForm,
		EditBeneficiaryForm,
		Table,
		ActionButton,
		Modal,
	},

	data() {
		return {
			advancedSearchVisible: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "id",
					},
					{
						key: "shelterStatus",
					},
					{
						key: "notes",
					},
					{
						key: "longitude",
					},
					{
						key: "latitude",
					},
					{
						key: "incomeLevel",
					},
					{
						key: "deptLevel",
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
				firstName: null,
				familyName: null,
				gender: null,
				dateOfBirth: null,
				residencyStatus: null,
				status: null,
				referralType: null,
				comment: null,
				justificationForAdding: null,
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
			}).catch((e) => {
				Toast(`(Households) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		openAddBeneficiaryModal() {
			this.addBeneficiaryModal.isOpened = true;
		},

		closeAddBeneficiaryModal() {
			this.addBeneficiaryModal.isOpened = false;
		},

		submitAddBeneficiaryForm() {
			// TODO Add Beneficiaries to Assistances
			this.addBeneficiaryModal.isOpened = false;
		},

		closeEditBeneficiaryModal() {
			this.editBeneficiaryModal.isOpened = false;
		},

		submitEditBeneficiaryForm() {
			// TODO Update Beneficiary in thi assistance
			this.editBeneficiaryModal.isOpened = false;
		},

		showDetail(beneficiary) {
			console.log(beneficiary.id);
			this.editBeneficiaryModal.isOpened = true;
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
