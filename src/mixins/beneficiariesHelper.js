import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import institutionHelper from "@/mixins/institutionHelper";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";

export default {
	emits: ["rowsChecked"],

	mixins: [institutionHelper],

	methods: {
		async getTransactions(transactionIds) {
			try {
				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getTransactionsForAssistance(transactionIds);

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Transactions")}: ${e.message || e}`, "error");
			}

			return [];
		},

		async getTransactionStatuses() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getTransactionStatuses();

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Transaction Statuses")}: ${e.message || e}`, "error");
			}

			return [];
		},

		async getSmartCardDeposits(smartcardDepositIds) {
			try {
				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getSmartCardDepositsForAssistance(smartcardDepositIds);

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Smartcard Deposit")}: ${e.message || e}`, "error");
			}

			return [];
		},

		async getBooklets(bookletIds) {
			try {
				const {
					data: { data },
					status,
					message,
				} = await AssistancesService
					.getBookletsForAssistance(
						bookletIds,
					);

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Booklets")}: ${e.message || e}`, "error");
			}

			return [];
		},

		async getBookletStatuses() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getBookletStatuses();

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Booklet Statuses")}: ${e.message || e}`, "error");
			}

			return [];
		},

		async onAssignBookletToBeneficiary(booklet) {
			this.assignVoucherModal.isWaiting = true;
			let target = "";

			switch (this.assistance.target) {
				case ASSISTANCE.TARGET.INSTITUTION:
					target = "institutions";
					break;
				case ASSISTANCE.TARGET.HOUSEHOLD:
				case ASSISTANCE.TARGET.INDIVIDUAL:
				default:
					target = "beneficiaries";
			}

			try {
				const { status, message } = await AssistancesService.assignBookletInAssistance({
					assistanceId: this.$route.params.assistanceId,
					beneficiaryId: booklet.beneficiaryId,
					bookletCode: booklet.code,
					target,
				});

				checkResponseStatus(status, message);

				Notification(
					`${this.$t("Success for Beneficiary")}: ${booklet.beneficiaryId}`,
					"success",
				);

				this.onCloseAssignVoucherModal();
			} catch (e) {
				Notification(
					`${this.$t("Error for Beneficiary")}: ${booklet.beneficiaryId} ${e.message || e}`,
					"error",
				);
				this.onCloseAssignVoucherModal();
			} finally {
				this.assignVoucherModal.isWaiting = false;
			}
		},

		setAssignedReliefPackages() {
			const modality = this.commodities[0]?.modalityType;

			const isTableCheckable = modality !== ASSISTANCE.COMMODITY.SMARTCARD
				&& modality !== ASSISTANCE.COMMODITY.QR_CODE_VOUCHER
				&& modality !== ASSISTANCE.COMMODITY.MOBILE_MONEY;

			this.table.settings = {
				assignVoucherAction: modality === ASSISTANCE.COMMODITY.QR_CODE_VOUCHER,
				checkableTable: isTableCheckable,
			};

			this.table.progress = 100;
		},

		async getReliefPackages(reliefPackageIds) {
			try {
				const {
					data: { data },
					status,
					message,
				} = await AssistancesService
					.getReliefPackagesForAssistance(
						this.$route.params.assistanceId,
						reliefPackageIds,
					);

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Relief Packages")}: ${e.message || e}`, "error");
			}

			return [];
		},

		preparePhoneForTable(phones) {
			return phones.map((phone) => phone.number).join(", ");
		},

		prepareColumnFormatForNationalIds(nationalIds, nationalType) {
			return nationalIds ? `${this.$t(nationalType)} : <b>${nationalIds}</b><br>` : "";
		},

		prepareNationalIdsValuesForTable(nationalIds) {
			let idNumbers = "";

			if (nationalIds.length) {
				nationalIds.forEach((item) => {
					idNumbers += this.prepareColumnFormatForNationalIds(item.idNumber, item.idType);
				});
			}
			return idNumbers;
		},

		onOpenAssignVoucherModal(id, canAssignVoucher) {
			if (canAssignVoucher) {
				this.assignVoucherToBeneficiaryId = this.table.data.find((item) => item.id === id);
				this.assignVoucherModal.isOpened = true;
			}
		},

		onCloseAssignVoucherModal() {
			this.assignVoucherModal.isOpened = false;
		},

		onOpenAddBeneficiaryModal(id, canBeOpened) {
			if (canBeOpened) {
				this.addBeneficiaryModel.removingId = id;
				this.addBeneficiaryModal.isOpened = true;
			}
		},

		onCloseAddBeneficiaryModal() {
			this.addBeneficiaryModal.isOpened = false;
		},

		showDetailModal(beneficiary) {
			switch (this.assistance.target) {
				case ASSISTANCE.TARGET.INSTITUTION:
					this.showInstitutionDetail(beneficiary);
					break;
				case ASSISTANCE.TARGET.HOUSEHOLD:
				case ASSISTANCE.TARGET.INDIVIDUAL:
				default:
					this.showBeneficiaryDetail(beneficiary);
			}
		},

		showEditModal({ id }) {
			switch (this.assistance.target) {
				case ASSISTANCE.TARGET.INSTITUTION:
					break;
				case ASSISTANCE.TARGET.HOUSEHOLD:
				case ASSISTANCE.TARGET.INDIVIDUAL:
				default:
					this.showBeneficiaryEdit(id);
			}
		},

		showBeneficiaryDetail(beneficiary) {
			this.beneficiaryModel = {
				...beneficiary,
				dateOfBirth: new Date(beneficiary.dateOfBirth),
			};
			this.beneficiaryModal = {
				isOpened: true,
				isEditing: false,
			};
		},

		async showInstitutionDetail(detailedInstitution) {
			this.institutionModal = {
				isOpened: true,
				isEditing: false,
				isWaiting: true,
			};

			try {
				await Promise.all([
					this.fetchInstitutionIdNames(),
					this.fetchSupportReceivedTypes(),
					this.fetchNationalCardTypes(),
					this.fetchPhoneTypes(),
					this.fetchProjects(),
					this.fetchInstitutionTypes(),
				]);

				try {
					const {
						data,
						status,
						message,
					} = await BeneficiariesService.getInstitution({
						id: detailedInstitution.institution.id,
						filters: { includeArchived: true },
					});

					checkResponseStatus(status, message);

					this.institutionModel = this.mapToModel(data);
				} catch (e) {
					Notification(`${this.$t("Institution")}: ${e.message || e}`, "error");
				}
			} catch (e) {
				Notification(`${this.$t("Institution detail")} ${e.message || e}`, "error");
			} finally {
				this.institutionModal.isWaiting = false;
			}
		},

		showBeneficiaryEdit(id) {
			const beneficiary = this.table.data.find((item) => item.id === id);
			this.beneficiaryModel = {
				...beneficiary,
				dateOfBirth: new Date(beneficiary.dateOfBirth),
			};
			this.beneficiaryModal = {
				isOpened: true,
				isEditing: true,
			};
		},

		onCloseBeneficiaryModal() {
			this.beneficiaryModal = {
				isOpened: false,
				isEditing: false,
			};
		},

		closeInstitutionModal() {
			this.institutionModal = {
				isOpened: false,
			};
		},

		onRowsCheck() {
			const selectedData = this.table.data.filter(
				(item) => this.table.checkedRows.includes(item.id)
					&& (item.reliefPackages[0].state !== ASSISTANCE.RELIEF_PACKAGES.STATE.DISTRIBUTED
							|| (item.status?.length === 1
								&& item.status[0] !== ASSISTANCE.RELIEF_PACKAGES.STATE.DISTRIBUTED)),
			);

			this.selectedRows = selectedData.length;
			this.$emit("rowsChecked", selectedData);
		},

		async onRandomSample() {
			const size = Math.round(this.table.total * (this.randomSampleSize / 100));
			const randomPage = this.rnd(1, this.table.total / size);
			this.table.customPerPage = size;
			await this.fetchData(randomPage, size);
		},

		rnd(a, b) {
			return Math.floor((b - a + 1) * Math.random()) + a;
		},

		async onSubmitEditBeneficiaryForm() {
			this.beneficiaryModal = {
				isOpened: false,
				isEditing: false,
			};
			await this.reloadBeneficiariesList();
		},

		async onPageChange(currentPage) {
			this.table.currentPage = currentPage;
			await this.reloadBeneficiariesList();
		},

		async onSort(column) {
			const currentColumn = this.table.visibleColumns.find(({ key }) => key === column);
			const sortKey = currentColumn.sortKey || column;

			if (!this.table.sortReset) {
				if (this.table.sortColumn === sortKey) {
					this.table.sortDirection = this.table.sortDirection === "asc" ? "desc" : "asc";
				} else {
					this.table.sortColumn = sortKey;
					this.table.sortDirection = "desc";
				}
			}

			this.table.sortReset = false;
			await this.reloadBeneficiariesList();
		},

		async onBeneficiariesSearch(search) {
			this.table.searchPhrase = this.assistanceDetail
				? search.phrase
				: search;
			this.table.searchField = this.assistanceDetail
				? search.field.code
				: "";

			await this.reloadBeneficiariesList();
		},

		async onChangePerPage() {
			await this.reloadBeneficiariesList();
		},

		async onResetSort(sortColumn = "", sortDirection = "", forceFetch = false) {
			this.table.sortReset = true;
			if (this.table.sortColumn !== "" || this.table.sortDirection !== "") {
				this.table.sortColumn = sortColumn;
				this.table.sortDirection = sortDirection;

				if (forceFetch) {
					await this.reloadBeneficiariesList();
				}
			}
		},
	},
};
