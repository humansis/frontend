<template>
	<div>
		<Modal
			can-cancel
			:header="addBeneficiaryModel.removingId ?
				$t('Remove Beneficiary From This Assistance')
				: $t('Add Beneficiaries to This Assistance')
			"
			:active="addBeneficiaryModal.isOpened"
			@close="closeAddBeneficiaryModal"
		>
			<AddBeneficiaryForm
				close-button
				:submit-button-label="$t('Confirm')"
				:formModel="addBeneficiaryModel"
				:assistance="assistance"
				@addingOrRemovingSubmitted="reloadBeneficiariesList"
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
				:beneficiary="assignVoucherToBeneficiaryId"
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
					:loading="exportLoading"
					:formats="{ xlsx: true, csv: true, ods: true, pdf: true}"
					@onExport="exportData"
				/>
			</template>
			<b-table-column
				v-if="table.columns.length"
				v-slot="props"
				:label="$t('Actions')"
				centered
				width="140"
			>
				<div class="buttons is-right">
					<ActionButton
						icon="search"
						type="is-primary"
						:tooltip="$t('View')"
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
import baseHelper from "@/mixins/baseHelper";
import consts from "@/utils/assistanceConst";
import AssignVoucherForm from "@/components/Assistance/BeneficiariesList/AssignVoucherForm";
import beneficiariesHelper from "@/mixins/beneficiariesHelper";

export default {
	name: "BeneficiariesList",

	props: {
		assistance: Object,
		project: Object,
		isAssistanceDetail: Boolean,
		addButton: Boolean,
		changeButton: {
			type: Boolean,
			default: false,
		},
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

	mixins: [baseHelper, beneficiariesHelper],

	data() {
		return {
			exportLoading: false,
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
				householdsAndIndividualEditColumns: [
					{ key: "id", label: "Beneficiary ID", sortable: true },
					{ key: "givenName", label: "First Name", sortable: true, sortKey: "localGivenName" },
					{ key: "familyName", sortable: true, sortKey: "localFamilyName" },
					{ key: "gender" },
					{ key: "dateOfBirth", label: "Date of Birth", type: "date" },
					{ key: "residencyStatus" },
					{ key: "vulnerabilities", type: "svgIcon" },
				],
				householdsAndIndividualDetailColumns: [
					{ key: "id", label: "Beneficiary ID", sortable: true },
					{ key: "givenName", label: "First Name", sortable: true, sortKey: "localGivenName" },
					{ key: "familyName", label: "Family Name", sortable: true, sortKey: "localFamilyName" },
					{ key: "nationalId", label: "National ID", sortable: true },
				],
				communityColumns: [
					{ key: "name" },
					{ key: "contactGivenName", label: "Contact Name" },
					{ key: "contactFamilyName" },
				],
				institutionColumns: [
					{ key: "name" },
					{ key: "type" },
					{ key: "contactGivenName", label: "Contact Name" },
					{ key: "contactFamilyName" },
				],
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
			assignVoucherToBeneficiaryId: null,
		};
	},

	async created() {
		await this.getAssistanceCommodities();
	},

	watch: {
		async assistance(newAssistance) {
			if (newAssistance) {
				await this.reloadBeneficiariesList();
			}
		},
	},

	methods: {
		async reloadBeneficiariesList() {
			await this.fetchData();
			await this.prepareTableColumns();
		},

		async fetchData(page, size) {
			this.isLoadingList = true;
			this.table.progress = null;
			this.table.data = [];

			switch (this.assistance.target) {
				case consts.TARGET.COMMUNITY:
					// TODO Call AssistancesService.getListOfCommunities()
					break;
				case consts.TARGET.INSTITUTION:
					// TODO Call AssistancesService.getListOfInstitutions()
					break;
				default:
					/** @summary For target HOUSEHOLD and INDIVIDUAL */
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
			}

			this.isLoadingList = false;
		},

		prepareTableColumns() {
			let baseColumns = [];
			let additionalColumns = [];

			switch (this.assistance.target) {
				case consts.TARGET.COMMUNITY:
					baseColumns = this.table.communityColumns;
					break;
				case consts.TARGET.INSTITUTION:
					baseColumns = this.table.institutionColumns;
					break;
				default:
					/** @summary For target HOUSEHOLD and INDIVIDUAL */
					baseColumns = this.isAssistanceDetail
						? this.table.householdsAndIndividualDetailColumns
						: this.table.householdsAndIndividualEditColumns;
			}

			if (this.isAssistanceDetail && this.assistance.type === consts.TYPE.DISTRIBUTION) {
				switch (this.commodities[0]?.modalityType) {
					case consts.COMMODITY.MOBILE_MONEY:
						additionalColumns = [
							{ key: "phone", label: "Phone" },
							{ key: "status", label: "Status" },
							{ key: "value", label: "Value" },
						];
						break;
					case consts.COMMODITY.QR_CODE_VOUCHER:
						additionalColumns = [
							{ key: "booklet", label: "Booklet" },
							{ key: "status", label: "Status" },
							{ key: "used", label: "Used" },
							{ key: "value", label: "Value" },
						];
						break;
					case consts.COMMODITY.SMARTCARD:
					default:
						/** @summary For commodity type GENERAL RELIEF and SMART CARD */
						additionalColumns = [
							{ key: "distributed", label: "Distributed" },
							{ key: "value", label: "Value" },
						];
				}
			}

			if (this.isAssistanceDetail && this.assistance.type === consts.TYPE.ACTIVITY) {
				additionalColumns = [
					{ key: "distributed", label: "Distributed" },
					{ key: "value", label: "Value" },
				];
			}

			this.table.columns = generateColumns([...baseColumns, ...additionalColumns]);
		},

		async prepareDataForTable(data) {
			this.table.progress += 15;
			const phoneIds = [];
			const nationalIdIds = [];
			const beneficiaryIds = [];

			switch (this.assistance.target) {
				case consts.TARGET.COMMUNITY:
					// TODO Set data to table for COMMUNITY
					break;
				case consts.TARGET.INSTITUTION:
					// TODO Set data to table for INSTITUTION
					break;
				default:
					/** @summary For target HOUSEHOLD and INDIVIDUAL */
					data.forEach((item, key) => {
						beneficiaryIds.push(item.id);

						this.table.data[key] = item;
						this.table.data[key].givenName = this
							.prepareName(item.localGivenName, item.enGivenName);
						this.table.data[key].familyName = this
							.prepareName(item.localFamilyName, item.enFamilyName);
						this.table.data[key].gender = this.prepareGender(item.gender);

						this.table.data[key].vulnerabilities = item.vulnerabilityCriteria;

						if (item.nationalIds.length) nationalIdIds.push(item.nationalIds);
						if (item.phoneIds.length) phoneIds.push(item.phoneIds);
					});

					this.table.progress += 15;

					this.preparePhoneForTable(phoneIds);
					this.prepareNationalIdForTable(nationalIdIds);
			}

			if (this.isAssistanceDetail && this.assistance.type === consts.TYPE.DISTRIBUTION) {
				await this.settingsOfBeneficiaryDistribution(beneficiaryIds);
			}

			if (this.isAssistanceDetail && this.assistance.type === consts.TYPE.ACTIVITY) {
				await this.settingsOfBeneficiaryActivity(beneficiaryIds);
			}
		},

		settingsOfBeneficiaryDistribution(beneficiaryIds) {
			switch (this.commodities[0].modalityType) {
				case consts.COMMODITY.SMARTCARD:
					this.setAssignedSmartCards(beneficiaryIds);
					break;
				case consts.COMMODITY.MOBILE_MONEY:
					this.setAssignedTransactions(beneficiaryIds);
					break;
				case consts.COMMODITY.QR_CODE_VOUCHER:
					this.setAssignedBooklets(beneficiaryIds);
					break;
				default:
					this.setAssignedGeneralRelief(beneficiaryIds);
			}
		},

		settingsOfBeneficiaryActivity(beneficiaryIds) {
			this.setAssignedGeneralRelief(beneficiaryIds);
		},

		getSmartCardDeposits(beneficiaryId) {
			return AssistancesService
				.getSmartCardDepositForBeneficiaryInAssistance(
					this.$route.params.assistanceId, beneficiaryId,
				).then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Smartcard Deposit")} ${e}`, "is-danger");
				});
		},

		async setAssignedBooklets(beneficiaryIds) {
			if (beneficiaryIds.length) {
				await Promise.all(beneficiaryIds.map(async (beneficiaryId) => {
					const booklets = await this.getBookletsForBeneficiary(beneficiaryId);

					const beneficiaryItemIndex = this.table.data.findIndex(
						({ id }) => id === beneficiaryId,
					);

					this.table.data[beneficiaryItemIndex].canAssignVoucher = !(booklets?.length
						? booklets[0].distributed : false);
				}));
			}
		},

		async assignBookletToBeneficiary(booklet) {
			this.assignVoucherModal.isWaiting = true;

			await AssistancesService.assignBookletForBeneficiaryInAssistance(
				this.$route.params.assistanceId, booklet.beneficiaryId, booklet.code,
			).then(({ status }) => {
				if (status === 200) {
					Toast(
						`${this.$t("Success for Beneficiary")} ${booklet.beneficiaryId}`,
						"is-success",
					);
					this.closeAssignVoucherModal();
				}
			}).catch((e) => {
				Notification(
					`${this.$t("Error for Beneficiary")} ${booklet.beneficiaryId} ${e}`,
					"is-danger",
				);
				this.closeAssignVoucherModal();
			});

			this.assignVoucherModal.isWaiting = false;
		},

		getBookletsForBeneficiary(beneficiaryId) {
			return AssistancesService
				.getBookletsForBeneficiaryInAssistance(
					this.$route.params.assistanceId, beneficiaryId,
				).then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Booklets")} ${e}`, "is-danger");
				});
		},

		async setGeneralRelief(beneficiaryIds) {
			if (beneficiaryIds.length) {
				await Promise.all(beneficiaryIds.map(async (beneficiaryId) => {
					const generalRelief = await this.getGeneralReliefForBeneficiary(beneficiaryId);

					const beneficiaryItemIndex = this.table.data.findIndex(
						({ id }) => id === beneficiaryId,
					);

					if (generalRelief[0].distributed) {
						this.table.checkedRows.push(this.table.data[beneficiaryItemIndex]);
					}

					this.table.data[beneficiaryItemIndex].generalReliefItem = generalRelief?.[0];

					this.table.data[beneficiaryItemIndex].distributed =	generalRelief?.[0].dateOfDistribution
						? this.$moment(generalRelief[0].dateOfDistribution).format("YYYY-MM-DD h:mm")
						: this.$t("Not Distributed");
				}));
			}
		},

		getGeneralReliefForBeneficiary(beneficiaryId) {
			return AssistancesService
				.getGeneralReliefForBeneficiaryInAssistance(
					this.$route.params.assistanceId, beneficiaryId,
				).then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("General Relief")} ${e}`, "is-danger");
				});
		},

		prepareVulnerabilities(vulnerabilities) {
			let result = "none";
			if (vulnerabilities) {
				vulnerabilities.forEach((item) => {
					if (result === "none") {
						result = this.$t(normalizeText(item));
					} else {
						result += `, ${this.$t(normalizeText(item))}`;
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
					: this.prepareEntityForTable(item.phoneIds[0], phones,
						"number", "none");
			});
			this.table.progress += 15;
		},

		async prepareValue() {
			this.table.data.forEach((item, key) => {
				this.table.data[key].value = `${this.commodities[0].value} ${this.commodities[0].unit}`;
			});
		},

		async prepareNationalIdForTable(ids) {
			const nationalIds = await this.getNationalIds(ids);
			this.table.progress += 20;
			this.table.data.map(async (item, key) => {
				this.table.data[key].nationalId = !item.nationalIds.length
					? "none"
					: this.prepareEntityForTable(item.nationalIds[0],
						nationalIds, "number", "none");
			});
			this.table.progress += 15;
		},

		async getNationalIds(ids) {
			if (!ids.length) return [];
			return BeneficiariesService.getNationalIds(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("National IDs")} ${e}`, "is-danger");
				});
		},

		async getPhones(ids) {
			if (!ids.length) return [];
			return BeneficiariesService.getPhones(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Phones")} ${e}`, "is-danger");
				});
		},

		onRowsCheck(rows) {
			this.$emit("rowsChecked", rows);
		},

		async exportData(format) {
			this.exportLoading = true;
			console.log(this.$route.name);
			if (this.$route.name === "AssistanceEdit") {
				// If I am on this page export should be for Beneficiaries
				await BeneficiariesService.exportBeneficiaries(format, this.$route.params.assistanceId)
					.then(({ data }) => {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `beneficiaries.${format}`;
						link.click();
					})
					.catch((e) => {
						Notification(`${this.$t("Export Beneficiaries")} ${e}`, "is-danger");
					});
			} else if (this.$route.name === "AssistanceDetail") {
				// If I am on this page export should be for Assistance
				await AssistancesService.exportAssistance(format, this.$route.params.assistanceId)
					.then(({ data }) => {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `assistance.${format}`;
						link.click();
					})
					.catch((e) => {
						Notification(`${this.$t("Export Assistance")} ${e}`, "is-danger");
					});
			}
			this.exportLoading = false;
		},

		openAddBeneficiaryModal(id) {
			this.addBeneficiaryModel.removingId = id;
			this.addBeneficiaryModal.isOpened = true;
		},

		closeAddBeneficiaryModal() {
			this.addBeneficiaryModal.isOpened = false;
		},

		openAssignVoucherModal(id, canAssignVoucher) {
			if (canAssignVoucher) {
				this.assignVoucherToBeneficiary = this.table.data.find((item) => item.id === id);
				this.assignVoucherModal.isOpened = true;
			}
		},

		closeAssignVoucherModal() {
			this.assignVoucherModal.isOpened = false;
		},

		async removeBeneficiaryFromAssistance({ justification, removingId }) {
			const body = {
				beneficiaryIds: [removingId],
				justification,
			};

			await BeneficiariesService
				.removeBeneficiaryFromAssistance(this.$route.params.assistanceId, body)
				.then(() => {
					Toast(this.$t("Beneficiary Successfully Removed"), "is-success");
					this.fetchData();
				})
				.catch((e) => {
					Notification(
						`${this.$t("Beneficiary")} ${e}`,
						"is-danger",
					);
				});

			this.closeAddBeneficiaryModal();
		},

		async submitAddBeneficiaryForm(form) {
			const { beneficiaries, justification } = form;
			const body = {
				beneficiaryIds: getArrayOfIdsByParam(beneficiaries, "id"),
				justification,
			};
			const { assistanceId } = this.$route.params;
			await BeneficiariesService.addBeneficiaryToAssistance(assistanceId, body)
				.then(({ status }) => {
					if (status === 200) {
						Toast(this.$t("Beneficiary Successfully Added"), "is-success");
						this.fetchData();
					}
				}).catch((e) => {
					Notification(`${this.$t("Beneficiary")} ${e}`, "is-danger");
				});
			this.addBeneficiaryModal.isOpened = false;
			this.$emit("onBeneficiaryListChange");
		},

		closeBeneficiaryModal() {
			this.beneficiaryModal = {
				isOpened: false,
				isEditing: false,
			};
		},

		submitEditBeneficiaryForm() {
			// TODO Update Beneficiary in this assistance
			this.beneficiaryModal = {
				isOpened: false,
				isEditing: false,
			};
			this.$emit("onBeneficiaryListChange");
		},

		showDetail(beneficiary) {
			this.beneficiaryModel = beneficiary;
			this.beneficiaryModal = {
				isOpened: true,
				isEditing: false,
			};
		},

		prepareGender(gender) {
			return gender === "F" ? this.$t("Female") : this.$t("Male");
		},

		showEdit({ id }) {
			this.beneficiaryModel = this.table.data.find((item) => item.id === id);
			this.beneficiaryModal = {
				isOpened: true,
				isEditing: true,
			};
		},

		async getAssistanceCommodities() {
			await AssistancesService.getAssistanceCommodities(this.$route.params.assistanceId)
				.then(({ data }) => { this.commodities = data; })
				.catch((e) => {
					Notification(`${this.$t("Commodities")} ${e}`, "is-danger");
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

<style>
.table-wrapper {
	min-height: 75px;
}
</style>
