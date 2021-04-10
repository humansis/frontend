// import consts from "@/utils/assistanceConst";
import AssistancesService from "@/services/AssistancesService";
import { Notification, Toast } from "@/utils/UI";
import { normalizeText } from "@/utils/datagrid";
import BeneficiariesService from "@/services/BeneficiariesService";
import { getArrayOfIdsByParam } from "@/utils/codeList";

export default {
	methods: {
		async randomSample() {
			const size = Math.round(this.table.total * (this.randomSampleSize / 100));
			const randomPage = this.rnd(1, this.table.total / size);
			this.table.customPerPage = size;
			await this.fetchData(randomPage, size);
		},

		rnd(a, b) {
			return Math.floor((b - a + 1) * Math.random()) + a;
		},

		prepareGender(gender) {
			return gender === "F" ? this.$t("Female") : this.$t("Male");
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

		submitEditBeneficiaryForm() {
			// TODO Update Beneficiary in this assistance
			this.beneficiaryModal = {
				isOpened: false,
				isEditing: false,
			};
			this.$emit("onBeneficiaryListChange");
		},

		async setAssignedTransactions(beneficiaryIds) {
			if (beneficiaryIds.length) {
				await Promise.all(beneficiaryIds.map(async (beneficiaryId) => {
					const transactions = await this.getSmartCardDeposits(beneficiaryId);

					// TODO Finish this after BE update
					console.log(transactions);
					/*

					const beneficiaryItemIndex = this.table.data.findIndex(
						({ id }) => id === beneficiaryId,
					);

					this.table.data[beneficiaryItemIndex].distributed =
					this.table.data[beneficiaryItemIndex].value =
					`${this.commodities[0].value} ${this.commodities[0].unit}`
					 */

					this.table.data = [...this.table.data];

					this.table.settings = {
						assignVoucherAction: false,
						checkableTable: false,
					};
				}));
			}
		},

		async setAssignedSmartCards(beneficiaryIds) {
			if (beneficiaryIds.length) {
				await Promise.all(beneficiaryIds.map(async (beneficiaryId) => {
					const smartCard = await this.getSmartCardDeposits(beneficiaryId);

					// TODO Finish this after BE update
					console.log(smartCard);

					/*
					? smartCard can have array of smartcard deposits, each of them has own value
					? and now there's no property "distributed"

					const beneficiaryItemIndex = this.table.data.findIndex(
						({ id }) => id === beneficiaryId,
					);

					this.table.data[beneficiaryItemIndex].distributed =
					this.table.data[beneficiaryItemIndex].value =
					`${this.commodities[0].value} ${this.commodities[0].unit}`
					 */

					this.table.data = [...this.table.data];

					this.table.settings = {
						assignVoucherAction: false,
						checkableTable: false,
					};
				}));
			}
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

					// this.table.data[beneficiaryItemIndex].booklet =
					this.table.data[beneficiaryItemIndex].value = `${this.commodities[0].value} ${this.commodities[0].unit}`;

					this.table.data = [...this.table.data];

					this.table.settings = {
						assignVoucherAction: true,
						checkableTable: false,
					};
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

		async setAssignedGeneralRelief(beneficiaryIds) {
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

					this.table.data[beneficiaryItemIndex].value = `${this.commodities[0].value} ${this.commodities[0].unit}`;

					this.table.data = [...this.table.data];

					this.table.settings = {
						assignVoucherAction: false,
						checkableTable: true,
					};
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

		exportAssistance(format) {
			console.log(format);
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

		async getAssistanceCommodities() {
			await AssistancesService.getAssistanceCommodities(this.$route.params.assistanceId)
				.then(({ data }) => { this.commodities = data; })
				.catch((e) => {
					Notification(`${this.$t("Commodities")} ${e}`, "is-danger");
				});
		},
	},
};
