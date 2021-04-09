<template>
	<div>
		<Modal
			can-cancel
			:header="addBeneficiaryModel.removingId ?
				$t('Remove Beneficiary From This Assistance')
				: $t('Add Beneficiaries To This Assistance')
			"
			:active="addBeneficiaryModal.isOpened"
			@close="closeAddBeneficiaryModal"
		>
			<AddBeneficiaryForm
				close-button
				:submit-button-label="$t('Confirm')"
				:formModel="addBeneficiaryModel"
				:assistance="assistance"
				@addingSubmitted="submitAddBeneficiaryForm"
				@removingSubmitted="removeBeneficiaryFromAssistance"
				@formClosed="closeAddBeneficiaryModal"
			/>
		</Modal>
		<Modal
			can-cancel
			:header="$t('Assign Booklet to a Beneficiary')"
			:active="assignVoucherModal.isOpened"
			:is-waiting="assignVoucherModal.isWaiting"
			@close="closeAssignVoucherModal"
		>
			<AssignVoucherForm
				close-button
				:submit-button-label="$t('Confirm')"
				:beneficiary="assignVoucherToBeneficiary"
				:assistance="assistance"
				:project="project"
				@scannedCode="assignBookletToBeneficiary"
				@formClosed="closeAssignVoucherModal"
			/>
		</Modal>
		<Modal
			can-cancel
			:header="beneficiaryModal.isEditing ? $t('Edit This Beneficiary')
				: $t('Detail of Beneficiary')"
			:active="beneficiaryModal.isOpened"
			@close="closeBeneficiaryModal"
		>
			<EditBeneficiaryForm
				close-button
				:submit-button-label="$t('Save')"
				class="modal-card"
				:disabled="!beneficiaryModal.isEditing"
				:formModel="beneficiaryModel"
				@formSubmitted="submitEditBeneficiaryForm"
				@formClosed="closeBeneficiaryModal"
			/>
		</Modal>
		<div class="buttons space-between">
			<b-button
				v-if="addButton"
				type="is-primary"
				icon-left="plus"
				@click="openAddBeneficiaryModal(null)"
			>
				{{ $t('Add') }}
			</b-button>
			<b-field v-if="changeButton">
				<p class="control">
					<b-button rounded @click="randomSample">
						<b-icon icon="exchange-alt" />
					</b-button>
				</p>
				<b-input
					v-model="randomSampleSize"
					type="number"
					placeholder="%"
					custom-class="has-text-centered"
					min="1"
					max="100"
					icon-right="percent"
				/>
			</b-field>
			<ExportButton
				v-if="exportButton"
				class="is-pulled-right"
				:formats="{ xlsx: true, csv: true, ods: true, pdf: true}"
				@exportData="exportAssistance"
			/>
		</div>
		<Table
			has-reset-sort
			has-search
			disable-prechecked-rows
			:paginated="!table.customPerPage"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:custom-per-page="table.customPerPage"
			:is-loading="isLoadingList"
			:checkable="table.settings.checkableTable"
			:checked-rows="table.checkedRows"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@changePerPage="onChangePerPage"
			@resetSort="resetSort"
			@search="onSearch"
			@checked="onRowsCheck"
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
			<template #export>
				<ExportButton
					v-if="exportButton"
					:formats="{ xlsx: true, csv: true, ods: true, pdf: true}"
					@exportData="exportAssistance"
				/>
			</template>
			<b-table-column
				v-slot="props"
				:label="$t('Actions')"
				centered
				width="140"
			>
				<div class="buttons is-right">
					<ActionButton
						icon="edit"
						:tooltip="$t('Edit')"
						@click.native="showEdit(props.row)"
					/>
					<ActionButton
						icon="trash"
						type="is-danger"
						:tooltip="$t('Delete')"
						@click.native="openAddBeneficiaryModal(props.row.id)"
					/>
					<ActionButton
						v-if="table.settings.assignVoucherAction"
						icon="qrcode"
						type="is-dark"
						:disabled="!props.row.canAssignVoucher"
						:tooltip="$t('Assign Voucher')"
						@click.native="openAssignVoucherModal(props.row.id, props.row.canAssignVoucher)"
					/>
				</div>
			</b-table-column>
			<template #progress>
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
import ColumnField from "@/components/DataGrid/ColumnField";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import grid from "@/mixins/grid";
import baseHelper from "@/mixins/baseHelper";
import consts from "@/utils/assistanceConst";
import AssignVoucherForm from "@/components/Assistance/BeneficiariesList/AssignVoucherForm";
import assistanceHelper from "@/mixins/assistanceHelper";

export default {
	name: "BeneficiariesList",

	props: {
		assistance: Object,
		project: Object,
		isAssistanceDetail: Boolean,
		addButton: Boolean,
		changeButton: Boolean,
		exportButton: Boolean,
	},

	components: {
		AssignVoucherForm,
		AddBeneficiaryForm,
		EditBeneficiaryForm,
		Table,
		ActionButton,
		Modal,
		ExportButton,
		ColumnField,
	},

	mixins: [grid, baseHelper, assistanceHelper],

	data() {
		return {
			advancedSearchVisible: false,
			commodities: [],
			table: {
				data: [],
				columns: [],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
				progress: null,
				customPerPage: null,
				checkedRows: [],
				settings: {
					assignVoucherAction: false,
					checkableTable: false,
				},
			},
			addBeneficiaryModal: {
				isOpened: false,
			},
			addBeneficiaryModel: {
				beneficiaries: [],
				removingId: null,
				justification: "",
			},
			beneficiaryModal: {
				isOpened: false,
				isEditing: false,
			},
			beneficiaryModel: {
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
			assignVoucherModal: {
				isOpened: false,
				isWaiting: false,
			},
			assignVoucherToBeneficiary: null,
		};
	},

	watch: {
		$route: "fetchData",
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData(page, size) {
			this.isLoadingList = true;
			this.table.progress = null;
			this.table.data = [];

			await this.getAssistanceCommodities();
			await this.prepareTableColumns();

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
				Notification(`${this.$t("Beneficiaries")} ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		async prepareTableColumns() {
			const assistanceEditColumns = [
				{ key: "id", label: "Beneficiary ID", sortable: true },
				{ key: "givenName", label: "First Name", sortable: true, sortKey: "localGivenName" },
				{ key: "familyName", label: "Family Name", sortable: true, sortKey: "localFamilyName" },
				{ key: "gender" },
				{ key: "dateOfBirth", label: "Date of Birth" },
				{ key: "residencyStatus" },
				{ key: "vulnerabilities" },
			];

			const assistanceDetailColumns = [
				{ key: "id", label: this.$t("Beneficiary ID"), sortable: true },
				{ key: "givenName", label: this.$t("First Name"), sortable: true, sortKey: "localGivenName" },
				{ key: "familyName", label: this.$t("Family Name"), sortable: true, sortKey: "localFamilyName" },
				{ key: "nationalId", label: this.$t("National ID"), sortable: true },
			];

			const baseColumns = this.isAssistanceDetail
				? assistanceDetailColumns : assistanceEditColumns;

			let additionalColumns = [];

			if (this.isAssistanceDetail && this.assistance.type === consts.TYPE.DISTRIBUTION) {
				switch (this.commodities[0]?.modalityType) {
					case consts.COMMODITY.SMARTCARD:
						additionalColumns = [
							{ key: "distributed", label: this.$t("Distributed") },
							{ key: "value", label: this.$t("Value") },
						];
						break;
					case consts.COMMODITY.MOBILE_MONEY:
						additionalColumns = [
							{ key: "phone", label: this.$t("Phone") },
							{ key: "distributed", label: this.$t("Status") },
							{ key: "value", label: this.$t("Value") },
						];
						break;
					case consts.COMMODITY.QR_CODE_VOUCHER:
						additionalColumns = [
							{ key: "booklet", label: this.$t("Booklet") },
							{ key: "distributed", label: this.$t("Used") },
							{ key: "value", label: this.$t("Value") },
						];
						break;
					default:
						additionalColumns = [
							{ key: "distributed", label: this.$t("Distributed") },
							{ key: "value", label: this.$t("Value") },
						];
				}
			}

			if (this.isAssistanceDetail && this.assistance.type === consts.TYPE.ACTIVITY) {
				additionalColumns = [
					{ key: "distributed", label: this.$t("Distributed") },
					{ key: "value", label: this.$t("Value") },
				];
			}

			this.table.columns = generateColumns([...baseColumns, ...additionalColumns]);
		},

		async prepareDataForTable(data) {
			this.table.progress += 15;
			const phoneIds = [];
			const nationalIdIds = [];
			const beneficiaryIds = [];

			data.forEach((item, key) => {
				beneficiaryIds.push(item.id);

				this.table.data[key] = item;
				this.table.data[key].givenName = this.prepareName(item.localGivenName, item.enGivenName);
				this.table.data[key].familyName = this.prepareName(item.localFamilyName, item.enFamilyName);
				this.table.data[key].gender = this.prepareGender(item.gender);
				this.table.data[key].vulnerabilities = this
					.prepareVulnerabilities(item.vulnerabilityCriteria);

				if (item.nationalIds.length) nationalIdIds.push(item.nationalIds);
				if (item.phoneIds.length) phoneIds.push(item.phoneIds);
			});

			this.table.progress += 15;

			this.preparePhoneForTable(phoneIds);
			this.prepareNationalIdForTable(nationalIdIds);

			if (this.isAssistanceDetail && this.assistance.type === consts.TYPE.DISTRIBUTION) {
				await this.settingsOfBeneficiaryDistribution(beneficiaryIds);
			}

			if (this.isAssistanceDetail && this.assistance.type === consts.TYPE.ACTIVITY) {
				await this.settingsOfBeneficiaryActivity(beneficiaryIds);
			}
		},

		async settingsOfBeneficiaryDistribution(beneficiaryIds) {
			switch (this.commodities[0].modalityType) {
				case consts.COMMODITY.SMARTCARD:
					await this.setAssignedSmartCards(beneficiaryIds);

					this.table.settings = {
						assignVoucherAction: false,
						checkableTable: false,
					};
					break;
				case consts.COMMODITY.MOBILE_MONEY:
					// TODO Call action for setting rules for transactions
					this.table.settings = {
						assignVoucherAction: false,
						checkableTable: false,
					};
					break;
				case consts.COMMODITY.QR_CODE_VOUCHER:
					await this.setAssignedBooklets(beneficiaryIds);

					this.table.settings = {
						assignVoucherAction: true,
						checkableTable: false,
					};
					break;
				default:
					await this.setAssignedGeneralRelief(beneficiaryIds);

					this.table.settings = {
						assignVoucherAction: false,
						checkableTable: true,
					};
			}
		},

		async settingsOfBeneficiaryActivity() {
			// TODO Get info about beneficiary activity
			this.table.settings = {
				assignVoucherAction: false,
				checkableTable: true,
			};
		},
	},
};
</script>

<style scoped>
.input-text-center input {
	text-align: center;
}
</style>
