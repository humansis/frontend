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
				<b-numberinput
					expanded
					size="is-medium"
					placeholder="%"
					controls-position="compact"
					controls-alignment="right"
				/>
			</b-field>
			<ExportButton
				v-if="exportButton"
				type="is-success"
				size="is-default"
				class="is-pulled-right"
				:formats="{ xlsx: true, csv: true, ods: true, pdf: true}"
				@exportData="exportAssistance"
			/>
		</div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="onSearch" />
		</div>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			@clicked="showDetail"
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
				v-slot="props"
				label="Actions"
				centered
				width="110"
			>
				<div class="block">
					<ActionButton
						icon="edit"
						type="is-link"
						tooltip="Edit"
						@click.native="showEdit(props.row)"
					/>
					<SafeDelete
						icon="trash"
						entity="Assistance"
						tooltip="Delete"
						:id="props.row.id"
						@submitted="removeAssistance"
					/>
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import Modal from "@/components/Modal";
import Table from "@/components/DataGrid/Table";
import ExportButton from "@/components/ExportButton";
import ActionButton from "@/components/ActionButton";
import AddBeneficiaryForm from "@/components/Assistance/BeneficiariesList/AddBeneficiaryForm";
import EditBeneficiaryForm from "@/components/Assistance/BeneficiariesList/EditBeneficiaryForm";
import SafeDelete from "@/components/SafeDelete";
import Search from "@/components/Search";
import ColumnField from "@/components/DataGrid/ColumnField";
import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import grid from "@/mixins/grid";

export default {
	name: "BeneficiariesList",

	props: {
		addButton: Boolean,
		changeButton: Boolean,
		exportButton: Boolean,
	},

	components: {
		Search,
		SafeDelete,
		AddBeneficiaryForm,
		EditBeneficiaryForm,
		Table,
		ActionButton,
		Modal,
		ExportButton,
		ColumnField,
	},

	mixins: [grid],

	data() {
		return {
			advancedSearchVisible: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "id",
						label: "Beneficiary ID",
					},
					{
						key: "transactionId",
						label: "Transaction ID",
					},
					{
						key: "givenName",
						label: "First Name",
					},
					{
						key: "familyName",
						label: "Family Name",
					},
					{
						key: "phone",
						label: "Phone",
					},
					{
						key: "nationalId",
						label: "National ID",
					},
					{
						key: "status",
					},
					{
						key: "value",
					},
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
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
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await AssistancesService.getListOfBeneficiaries(
				this.$route.params.assistanceId,
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then(async ({ data, totalCount }) => {
				this.$emit("beneficiariesCounted", totalCount);
				this.table.total = totalCount;
				this.table.data = await this.prepareDataForTable(data);
			}).catch((e) => {
				Notification(`Households ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		async prepareDataForTable(data) {
			const filledData = [];
			const promise = data.map(async (item, key) => {
				filledData[key] = item;
				filledData[key].givenName = this.prepareName(item.localGivenName, item.enGivenName);
				filledData[key].familyName = this.prepareName(item.localFamilyName, item.enFamilyName);
				filledData[key].phone = await this.preparePhone(item.phoneIds);
				filledData[key].nationalId = await this.prepareNationalId(item.nationalIds);
			});
			await Promise.all(promise);
			return filledData;
		},

		async preparePhone(phoneIds) {
			if (phoneIds.length > 0) {
				return BeneficiariesService.getPhone(phoneIds[0])
					.then(({ number }) => number);
			}
			return "";
		},

		async prepareNationalId(nationalIds) {
			if (nationalIds.length > 0) {
				return BeneficiariesService.getNationalId(nationalIds[0])
					.then(({ number }) => number);
			}
			return "";
		},

		prepareName(localName, enName) {
			let preparedName = localName;
			if (enName) {
				preparedName += ` (${enName})`;
			}
			return preparedName;
		},

		exportAssistance(format) {
			console.log(format);
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
			this.$emit("onBeneficiaryListChange");
		},

		closeEditBeneficiaryModal() {
			this.editBeneficiaryModal.isOpened = false;
		},

		submitEditBeneficiaryForm() {
			// TODO Update Beneficiary in thi assistance
			this.editBeneficiaryModal.isOpened = false;
			this.$emit("onBeneficiaryListChange");
		},

		showDetail(beneficiary) {
			// TODO Show detail of beneficiary
			console.log(beneficiary.id);
			this.editBeneficiaryModal.isOpened = true;
		},

		removeAssistance(id) {
			this.table.data = this.table.data.filter((item) => item.id !== id);
		},
	},
};
</script>
