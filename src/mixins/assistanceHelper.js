import AssistancesService from "@/services/AssistancesService";
import { Notification, Toast } from "@/utils/UI";
import { normalizeText } from "@/utils/datagrid";
import BeneficiariesService from "@/services/BeneficiariesService";
import { getArrayOfIdsByParam } from "@/utils/codeList";
import { mapActions, mapState } from "vuex";

export default {
	data() {
		return {
			show: true,
			isLoadingList: false,
		};
	},

	computed: {
		...mapState(["perPage"]),
	},

	methods: {
		/** @summary Setting the BNF if the MOBILE MONEY was already distributed to him */
		async setAssignedTransactions(beneficiaryIds) {
			if (beneficiaryIds.length) {
				await Promise.all(beneficiaryIds.map(async (beneficiaryId) => {
					const transactions = await this.getTransactions(beneficiaryId);

					const beneficiaryItemIndex = this.table.data.findIndex(
						({ id }) => id === beneficiaryId,
					);

					this.table.data[beneficiaryItemIndex].status = transactions?.[0]?.status || this.$t("none");
					this.table.data[beneficiaryItemIndex].value = `
						${this.commodities[0].value} ${this.commodities[0].unit}`;

					this.table.data = [...this.table.data];

					this.table.settings = {
						assignVoucherAction: false,
						checkableTable: false,
					};
				}));
			}
		},

		/** @summary Obtaining information about the beneficiary MOBILE MONEY */
		getTransactions(beneficiaryId) {
			return AssistancesService
				.getTransactionsForBeneficiaryInAssistance(
					this.$route.params.assistanceId, beneficiaryId,
				).then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Transactions")} ${e}`, "is-danger");
				});
		},

		/** @summary Setting the BNF if the SMART CARD was already distributed to him */
		async setAssignedSmartCards(beneficiaryIds) {
			if (beneficiaryIds.length) {
				await Promise.all(beneficiaryIds.map(async (beneficiaryId) => {
					const smartCardDeposits = await this.getSmartCardDeposits(beneficiaryId);

					const beneficiaryItemIndex = this.table.data.findIndex(
						({ id }) => id === beneficiaryId,
					);

					if (smartCardDeposits?.length) {
						this.table.data[beneficiaryItemIndex].distributed =	smartCardDeposits[0].distributed
							? this.$moment(smartCardDeposits[0].dateOfDistribution).format("DD-MM-YYYY h:mm")
							: this.$t("Not Distributed");
						this.table.data[beneficiaryItemIndex].value = `
						${smartCardDeposits[0].value} ${this.commodities[0].unit}`;
					}

					this.table.data = [...this.table.data];

					this.table.settings = {
						assignVoucherAction: false,
						checkableTable: false,
					};
				}));
			}
		},

		/** @summary Obtaining information about the beneficiary SMART CARD */
		getSmartCardDeposits(beneficiaryId) {
			return AssistancesService
				.getSmartCardDepositForBeneficiaryInAssistance(
					this.$route.params.assistanceId, beneficiaryId,
				).then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Smartcard Deposit")} ${e}`, "is-danger");
				});
		},

		/** @summary Setting the BNF if the QR VOUCHER CODE was already distributed to him */
		async setAssignedBooklets(beneficiaryIds) {
			if (beneficiaryIds.length) {
				await Promise.all(beneficiaryIds.map(async (beneficiaryId) => {
					const booklets = await this.getBookletsForBeneficiary(beneficiaryId);

					const beneficiaryItemIndex = this.table.data.findIndex(
						({ id }) => id === beneficiaryId,
					);

					if (booklets?.length) {
						this.table.data[beneficiaryItemIndex].canAssignVoucher = !booklets[0].distributed;

						this.table.data[beneficiaryItemIndex].booklet = booklets[0].code;
						this.table.data[beneficiaryItemIndex].status = booklets[0].distributed
							? this.$t("Distributed") : this.$t("Not Distributed");
						this.table.data[beneficiaryItemIndex].quantity = booklets[0].quantityOfVouchers;
						this.table.data[beneficiaryItemIndex].value = `
						${booklets[0].totalValue} ${booklets[0].currency}`;
					}

					this.table.data = [...this.table.data];

					this.table.settings = {
						assignVoucherAction: true,
						checkableTable: false,
					};
				}));
			}
		},

		/** @summary Obtaining information about the beneficiary QR VOUCHER CODE */
		getBookletsForBeneficiary(beneficiaryId) {
			return AssistancesService
				.getBookletsForBeneficiaryInAssistance(
					this.$route.params.assistanceId, beneficiaryId,
				).then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Booklets")} ${e}`, "is-danger");
				});
		},

		/** @summary Setting the BNF that the QR VOUCHER CODE is now distributed to him */
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

		/** @summary Setting the BNF if the GENERAL RELIEF ITEMS was already distributed to him */
		async setAssignedGeneralRelief(beneficiaryIds) {
			if (beneficiaryIds.length) {
				await Promise.all(beneficiaryIds.map(async (beneficiaryId) => {
					const generalReliefItems = await this.getGeneralReliefItemsForBeneficiary(beneficiaryId);

					const beneficiaryItemIndex = this.table.data.findIndex(
						({ id }) => id === beneficiaryId,
					);

					if (generalReliefItems?.length) {
						if (generalReliefItems[0].distributed) {
							this.table.checkedRows.push(this.table.data[beneficiaryItemIndex]);
						}

						this.table.data[beneficiaryItemIndex].generalReliefItem = { ...generalReliefItems[0] };

						this.table.data[beneficiaryItemIndex].distributed =	generalReliefItems[0]
							.dateOfDistribution
							? this.$moment(generalReliefItems[0].dateOfDistribution).format("DD-MM-YYYY h:mm")
							: this.$t("Not Distributed");

						this.table.data[beneficiaryItemIndex].value = `${this.commodities[0].value} ${this.commodities[0].unit}`;
					}

					this.table.data = [...this.table.data];

					this.table.settings = {
						assignVoucherAction: false,
						checkableTable: true,
					};
				}));
			}
		},

		/** @summary Obtaining information about the beneficiary GENERAL RELIEF */
		getGeneralReliefItemsForBeneficiary(beneficiaryId) {
			return AssistancesService
				.getGeneralReliefItemsForBeneficiaryInAssistance(
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

		prepareGender(gender) {
			return gender === "F" ? this.$t("Female") : this.$t("Male");
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

		async addBeneficiaryToAssistance(form) {
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

		async getAssistanceCommodities() {
			await AssistancesService.getAssistanceCommodities(this.$route.params.assistanceId)
				.then(({ data }) => { this.commodities = data; })
				.catch((e) => {
					Notification(`${this.$t("Commodities")} ${e}`, "is-danger");
				});
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

		openAddBeneficiaryModal(id) {
			this.addBeneficiaryModel.removingId = id;
			this.addBeneficiaryModal.isOpened = true;
		},

		closeAddBeneficiaryModal() {
			this.addBeneficiaryModal.isOpened = false;
		},

		showDetail(beneficiary) {
			this.beneficiaryModel = beneficiary;
			this.beneficiaryModal = {
				isOpened: true,
				isEditing: false,
			};
		},

		showEdit({ id }) {
			this.beneficiaryModel = this.table.data.find((item) => item.id === id);
			this.beneficiaryModal = {
				isOpened: true,
				isEditing: true,
			};
		},

		closeBeneficiaryModal() {
			this.beneficiaryModal = {
				isOpened: false,
				isEditing: false,
			};
		},

		onRowsCheck(rows) {
			this.$emit("rowsChecked", rows);
		},

		exportAssistance(format) {
			console.log(format);
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

		submitEditBeneficiaryForm() {
			// TODO Update Beneficiary in this assistance
			this.beneficiaryModal = {
				isOpened: false,
				isEditing: false,
			};
			this.$emit("onBeneficiaryListChange");
		},

		...mapActions(["changePerPage"]),

		async onPageChange(currentPage) {
			this.table.currentPage = currentPage;
			await this.fetchData();
			await this.prepareTableColumns();
		},

		async onSort(column) {
			const currentColumn = this.table.visibleColumns.find(({ key }) => key === column);
			const sortKey = currentColumn.sortKey || column;

			if (this.table.sortColumn === sortKey) {
				this.table.sortDirection = this.table.sortDirection === "asc" ? "desc" : "asc";
			} else {
				this.table.sortColumn = sortKey;
				this.table.sortDirection = "desc";
			}
			await this.fetchData();
			await this.prepareTableColumns();
		},

		async onSearch(value) {
			this.table.searchPhrase = value;
			await this.fetchData();
			await this.prepareTableColumns();
		},

		async onChangePerPage() {
			await this.fetchData();
			await this.prepareTableColumns();
		},

		async resetSort() {
			if (this.table.sortColumn !== "" || this.table.sortDirection !== "") {
				this.table.sortColumn = "";
				this.table.sortDirection = "";
				await this.fetchData();
				await this.prepareTableColumns();
			}
		},
	},
};
