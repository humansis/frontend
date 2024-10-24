import { mapState } from "vuex";
import { helpers, required } from "@vuelidate/validators";
import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import LocationsService from "@/services/LocationsService";
import ProductService from "@/services/ProductService";
import ProjectService from "@/services/ProjectService";
import VendorService from "@/services/VendorService";
import baseHelper from "@/mixins/baseHelper";
import institutionHelper from "@/mixins/institutionHelper";
import { checkResponseStatus } from "@/utils/fetcher";
import { isDateBeforeOrEqual, isRangeBetweenTwoDatesHigher } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { ROUTER, TRANSACTIONS } from "@/consts";

export default {
	mixins: [baseHelper, institutionHelper],

	computed: {
		...mapState(["admNames"]),

		validationRules() {
			return {
				selectedFiltersOptions: {
					dateTo: {
						required,
						...(this.selectedFiltersOptions.dateTo
							&& this.selectedFiltersOptions.dateFrom
							&& { isDateBeforeOrEqual: helpers.withMessage(
								"Date To is before Date From",
								(value) => isDateBeforeOrEqual(this.selectedFiltersOptions.dateFrom, value),
							) }),
						...(this.selectedFiltersOptions.dateTo && { isRangerToHigher: helpers.withMessage(
							"The period between chosen dates is bigger than 1 year",
							(value) => !isRangeBetweenTwoDatesHigher(
								this.selectedFiltersOptions.dateFrom,
								value,
								365,
							),
						) }),
					},
					dateFrom: {
						required,
					},
				},
			};
		},
	},

	methods: {
		renameAdms() {
			const adms = [...Object.keys(this.admNames)];

			this.table.columns = this.table.columns.map((item) => {
				const column = { ...item };

				if (adms.includes(column.key)) {
					column.label = this.admNames[column.key];
				}

				return column;
			});
		},

		prepareProjectForTable(project, hasLink = false) {
			if (hasLink) {
				return {
					routeName: ROUTER.ROUTE_NAME.ASSISTANCES.ROOT,
					name: project?.name,
					routeParams: { projectId: project?.id || 1 },
				};
			}

			return project.name;
		},

		prepareBeneficiaryIdForTable(beneficiary, hasLink = false) {
			if (!beneficiary) return "";

			if (hasLink) {
				const isTypeInstitution = beneficiary.type === TRANSACTIONS.BENEFICIARY_TYPE.INSTITUTION;
				const routeName = isTypeInstitution
					? ROUTER.ROUTE_NAME.INSTITUTIONS.DETAIL
					: ROUTER.ROUTE_NAME.HOUSEHOLD_INFORMATION_SUMMARY;
				const routeParams = isTypeInstitution
					? { institutionId: beneficiary.id }
					: { householdId: beneficiary.householdId };
				const tooltip = isTypeInstitution
					? "Deleted institution"
					: "Deleted member";

				return {
					routeName,
					name: beneficiary.id,
					routeParams,
					isArchived: beneficiary.isArchived,
					tooltip,
				};
			}

			return beneficiary.id;
		},

		prepareAssistanceForTable(assistance, project, hasLink = false) {
			if (hasLink) {
				return {
					routeName: ROUTER.ROUTE_NAME.ASSISTANCES.DETAIL,
					name: assistance.name,
					routeParams: { projectId: project.id, assistanceId: assistance.id },
				};
			}

			return assistance.name;
		},

		async prepareProductForTable(productIds) {
			const products = await this.getProducts(productIds);

			this.table.data.forEach((item, key) => {
				const product = this.prepareEntityForTable(item.productId, products);
				this.table.data[key].product = product.name;
			});

			this.table.progress += 10;
			this.reload();
		},

		async getProducts(ids) {
			if (!ids.length) return [];

			try {
				const {
					data: { data },
					status,
					message,
				} = await ProductService.getProducts(ids);

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Products")}: ${e.message || e}`, "error");
				return [];
			}
		},

		async getCommodities(ids) {
			if (!ids.length) return [];

			try {
				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getCommodities(ids);

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Commodities")}: ${e.message || e}`, "error");
				return [];
			}
		},

		async getVendors(ids) {
			if (!ids.length) return [];

			try {
				const {
					data: { data },
					status,
					message,
				} = await VendorService.getListOfVendors({ ids });

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Vendors")}: ${e.message || e}`, "error");
				return [];
			}
		},

		async getAdm1s(ids) {
			if (!ids.length) return [];

			try {
				const {
					data: { data },
					status,
					message,
				} = await LocationsService.getAdm1s(ids);

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Adm1")}: ${e.message || e}`, "error");
				return [];
			}
		},

		async getAdm2s(ids) {
			if (!ids.length) return [];

			try {
				const {
					data: { data },
					status,
					message,
				} = await LocationsService.getAdm2s(ids);

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Adm2")}: ${e.message || e}`, "error");
				return [];
			}
		},

		async getAdm3s(ids) {
			if (!ids.length) return [];

			try {
				const {
					data: { data },
					status,
					message,
				} = await LocationsService.getAdm3s(ids);

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Adm3")}: ${e.message || e}`, "error");
				return [];
			}
		},

		async getAdm4s(ids) {
			if (!ids.length) return [];

			try {
				const {
					data: { data },
					status,
					message,
				} = await LocationsService.getAdm4s(ids);

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Adm4")}: ${e.message || e}`, "error");
				return [];
			}
		},

		async getAssistances(ids) {
			if (!ids.length) return [];

			try {
				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getAssistances(ids);

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Assistances")}: ${e.message || e}`, "error");
				return [];
			}
		},

		async getBeneficiaries(ids, filters) {
			try {
				const {
					data: { data },
					status,
					message,
				} = await BeneficiariesService.getBeneficiaries({
					ids,
					filters,
				});

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Beneficiaries")}: ${e.message || e}`, "error");
				return [];
			}
		},

		async getProjects(ids) {
			try {
				const {
					data: { data },
					status,
					message,
				} = await ProjectService.getListOfProjects({ ids });

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Projects")}: ${e.message || e}`, "error");
				return [];
			}
		},

		async fetchProjects() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await ProjectService.getShortListOfProjects();

				checkResponseStatus(status, message);

				this.filtersOptions.project.data = data;
			} catch (e) {
				Notification(`${this.$t("Projects")}: ${e.message || e}`, "error");
			} finally {
				this.filtersOptions.project.loading = false;
			}
		},

		async fetchModalityTypes() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getListOfAllModalityTypes();

				checkResponseStatus(status, message);

				this.filtersOptions.commodity.data = data;
			} catch (e) {
				Notification(`${this.$t("Modality")}: ${e.message || e}`, "error");
			} finally {
				this.filtersOptions.commodity.loading = false;
			}
		},

		async fetchVendors() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await VendorService.getShortListOfVendors();

				checkResponseStatus(status, message);

				this.filtersOptions.vendor.data = data.map((item) => {
					const vendor = { ...item };
					vendor.vendorName = `${item.name} ${item.shop ? `(${item.shop})` : ""}`;
					return vendor;
				});
			} catch (e) {
				Notification(`${this.$t("Vendor")}: ${e.message || e}`, "error");
			} finally {
				this.filtersOptions.vendor.loading = false;
			}
		},

		async fetchBeneficiaryTypes() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await BeneficiariesService.getBeneficiaryTypes();

				checkResponseStatus(status, message);

				this.filtersOptions.beneficiaryType.data = data;
			} catch (e) {
				Notification(`${this.$t("Beneficiary Types")}: ${e.message || e}`, "error");
			} finally {
				this.filtersOptions.beneficiaryType.loading = false;
			}
		},

		async fetchAssistanceForAdvancedSearch() {
			try {
				this.filtersOptions.distribution.loading = true;

				const projectId = this.selectedFiltersOptions.project?.id;
				const filters = { ...(projectId && {
					projects: [projectId],
					type: "distribution",
				}) };

				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getShortListOfAssistance({ filters });

				checkResponseStatus(status, message);

				this.filtersOptions.distribution.data = data;
			} catch (e) {
				Notification(`Project Assistances ${e.message || e}:`, "error");
			} finally {
				this.filtersOptions.distribution.loading = false;
			}
		},

		setDefaultFilters() {
			if (this.filters.dateFrom && this.filters.dateTo) return;

			const todayDay = new Date();
			const dateFrom = new Date();
			dateFrom.setDate(todayDay.getDate() - 30);

			this.filters = {
				...this.filters,
				...(!this.filters.dateFrom && {
					dateFrom: this.$moment(dateFrom).format("YYYY-MM-DD"),
				}),
				...(!this.filters.dateTo && {
					dateTo: this.$moment(todayDay).format("YYYY-MM-DD"),
				}),
			};
		},
	},
};
