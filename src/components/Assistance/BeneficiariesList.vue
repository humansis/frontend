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
				class="modal-card"
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
					<b-button rounded class="button is-danger is-medium" @click="randomSample">
						<b-icon icon="exchange-alt" />
					</b-button>
				</p>
				<b-input
					v-model="randomSampleSize"
					type="number"
					size="is-medium"
					placeholder="%"
					min="1"
					custom-class="has-text-centered"
					max="100"
					controls-position="compact"
					controls-alignment="right"
				/>
				<b-button disabled size="is-medium">
					<span class="is-size-3">%</span>
				</b-button>
			</b-field>
		</div>
		<Table
			has-reset-sort
			has-search
			:paginated="!table.customPerPage"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:custom-per-page="table.customPerPage"
			:is-loading="isLoadingList"
			:checkable="withCheckbox"
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
			<template slot="export">
				<div class="column">
					<ExportButton
						v-if="exportButton"
						type="is-success"
						size="is-default"
						:formats="{ xlsx: true, csv: true, ods: true, pdf: true}"
						@exportData="exportAssistance"
					/>
				</div>
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
import { generateColumns, normalizeText } from "@/utils/datagrid";
import { getArrayOfIdsByParam } from "@/utils/codeList";
import grid from "@/mixins/grid";
import baseHelper from "@/mixins/baseHelper";

export default {
	name: "BeneficiariesList",

	props: {
		addButton: Boolean,
		changeButton: Boolean,
		exportButton: Boolean,
		withCheckbox: Boolean,
		customColumns: Array,
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
					{ key: "givenName", label: "First Name", sortable: true, sortKey: "localGivenName" },
					{ key: "familyName", label: "Family Name", sortable: true, sortKey: "localFamilyName" },
					{ key: "gender" },
					{ key: "dateOfBirth" },
					{ key: "residencyStatus" },
					{ key: "vulnerabilities" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
				progress: null,
				customPerPage: null,
			},
			addBeneficiaryModal: {
				isOpened: false,
			},
			addBeneficiaryModel: {
				beneficiaries: [],
				justification: "",
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
			randomSampleSize: 10,
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData(page, size) {
			this.isLoadingList = true;
			this.table.progress = null;
			this.table.data = [];

			this.table.columns = generateColumns(
				this.customColumns?.length ? this.customColumns : this.table.visibleColumns,
			);
			await AssistancesService.getListOfBeneficiaries(
				this.$route.params.assistanceId,
				page || this.table.currentPage,
				size || this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then(async ({ data, totalCount }) => {
				this.table.data = [];
				this.table.progress = 0;
				this.$emit("beneficiariesCounted", totalCount);
				this.table.total = totalCount;
				if (totalCount > 0) {
					await this.prepareDataForTable(data);
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
				this.table.data[key].gender = this.prepareGender(item.gender);
				this.table.data[key].distributed = item.dateDistributed || "none";
				this.table.data[key].vulnerabilities = this
					.prepareVulnerabilities(item.vulnerabilityCriteria);
				if (item.nationalIds.length) {
					nationalIdIds.push(item.nationalIds);
				}
				if (item.phoneIds.length) {
					phoneIds.push(item.phoneIds);
				}
			});
			this.table.progress += 15;

			this.preparePhoneForTable(phoneIds);

			this.prepareValue();

			this.prepareNationalIdForTable(nationalIdIds);
		},

		prepareVulnerabilities(vulnerabilities) {
			let result = "none";
			if (vulnerabilities) {
				vulnerabilities.forEach((item) => {
					if (result === "none") {
						result = normalizeText(item);
					} else {
						result += `, ${normalizeText(item)}`;
					}
				});
			}
			return result;
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

		async prepareValue() {
			const commodities = await this.getAssistanceCommodities();
			this.table.data.forEach((item, key) => {
				this.table.data[key].value = `${commodities[0].value} ${commodities[0].unit}`;
			});
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

		async submitAddBeneficiaryForm(form) {
			const { beneficiaries, justification } = form;
			const body = {
				beneficiaryIds: getArrayOfIdsByParam(beneficiaries, "id"),
				justification,
			};
			const { assistanceId } = this.$route.params;
			await BeneficiariesService.addBeneficiaryToAssistance(assistanceId, body);
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

		prepareGender(gender) {
			return gender === "F" ? "Female" : "Male";
		},

		showEdit({ id }) {
			this.editBeneficiaryModel = this.table.data.find((item) => item.id === id);
			this.editBeneficiaryModal.isOpened = true;
		},

		getAssistanceCommodities() {
			return AssistancesService.getAssistanceCommodities(this.$route.params.assistanceId)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`Commodities ${e}`, "is-danger");
				});
		},

		async randomSample() {
			const size = Math.round(this.table.total * (this.randomSampleSize / 100));
			const randomPage = this.rnd(1, this.table.total / size);
			this.table.customPerPage = size;
			await this.fetchData(randomPage, size);
		},

		rnd(a, b) {
			return Math.floor((b - a + 1) * Math.random()) + a;
		},
	},
};
</script>

<style scoped>
.input-text-center input {
	text-align: center;
}
</style>
