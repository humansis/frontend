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
				type="is-primary"
				class="is-pulled-right"
				:formats="{ xlsx: true, csv: true, ods: true, pdf: true}"
				@exportData="exportAssistance"
			/>
		</div>
		<Table
			has-reset-sort
			has-search
			:key="resetSortKey"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@changePerPage="onChangePerPage"
			@resetSort="resetSort"
			@search="onSearch"
		>
			<template v-for="column in table.columns">
				<b-table-column
					v-bind="column"
					:sortable="column.sortable"
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
				<div class="buttons is-right">
					<ActionButton
						icon="edit"
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
			<template slot="progress">
				<b-progress :value="table.progress" format="percent" />
			</template>
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
import ColumnField from "@/components/DataGrid/ColumnField";
import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import grid from "@/mixins/grid";
import baseHelper from "@/mixins/baseHelper";

export default {
	name: "BeneficiariesList",

	props: {
		addButton: Boolean,
		changeButton: Boolean,
		exportButton: Boolean,
	},

	components: {
		SafeDelete,
		AddBeneficiaryForm,
		EditBeneficiaryForm,
		Table,
		ActionButton,
		Modal,
		ExportButton,
		ColumnField,
	},

	mixins: [grid, baseHelper],

	data() {
		return {
			advancedSearchVisible: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id", label: "Beneficiary ID", sortable: true },
					{ key: "transactionId", label: "Transaction ID" },
					{ key: "givenName", label: "First Name", sortable: true, sortKey: "localGivenName" },
					{ key: "familyName", label: "Family Name", sortable: true, sortKey: "localFamilyName" },
					{ key: "phone", label: "Phone" },
					{ key: "nationalId", label: "National ID", sortable: true },
					{ key: "status" },
					{ key: "value" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
				progress: null,
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
			this.table.progress = null;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await AssistancesService.getListOfBeneficiaries(
				this.$route.params.assistanceId,
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then(async ({ data, totalCount }) => {
				this.table.progress = 0;
				this.$emit("beneficiariesCounted", totalCount);
				this.table.total = totalCount;
				if (totalCount !== 0) {
					await this.prepareDataForTable(data);
				} else {
					this.table.data = [];
				}
			}).catch((e) => {
				Notification(`Households ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		prepareDataForTable(data) {
			this.table.progress += 15;
			const phoneIds = [];
			const nationalIdIds = [];
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].givenName = this.prepareName(item.localGivenName, item.enGivenName);
				this.table.data[key].familyName = this.prepareName(item.localFamilyName, item.enFamilyName);
				if (item.nationalIds.length) {
					nationalIdIds.push(item.nationalIds);
				}
				if (item.phoneIds.length) {
					phoneIds.push(item.phoneIds);
				}
			});
			this.table.progress += 15;

			this.preparePhoneForTable(phoneIds);

			this.prepareNationalIdForTable(nationalIdIds);
		},

		async preparePhoneForTable(phoneIds) {
			const phones = await this.getPhones(phoneIds);
			this.table.progress += 20;
			this.table.data.forEach((item, key) => {
				this.table.data[key].phone = !item.phoneIds.length
					? "none"
					: this.prepareEntityForTable(item.phoneIds[0], phones, "number", "none");
			});
			this.table.progress += 15;
		},

		async prepareNationalIdForTable(ids) {
			const nationalIds = await this.getNationalIds(ids);
			this.table.progress += 20;
			this.table.data.map(async (item, key) => {
				this.table.data[key].nationalId = !item.nationalIds.length
					? "none"
					: this.prepareEntityForTable(item.nationalIds[0], nationalIds, "number", "none");
			});
			this.table.progress += 15;
		},

		async getNationalIds(ids) {
			if (!ids.length) return [];
			return BeneficiariesService.getNationalIds(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`NationalIds ${e}`, "is-danger");
				});
		},

		async getPhones(ids) {
			if (!ids.length) return [];
			return BeneficiariesService.getPhones(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`Phones ${e}`, "is-danger");
				});
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
			// TODO Add Beneficiaries to Assistance
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
