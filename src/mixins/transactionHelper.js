import { mapState } from "vuex";
import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import LocationsService from "@/services/LocationsService";
import ProductService from "@/services/ProductService";
import ProjectService from "@/services/ProjectService";
import VendorService from "@/services/VendorService";
import baseHelper from "@/mixins/baseHelper";
import institutionHelper from "@/mixins/institutionHelper";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	mixins: [baseHelper, institutionHelper],

	computed: {
		...mapState(["admNames"]),
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

		async prepareProjectForTable(projectIds, hasLink = false) {
			const projects = await this.getProjects(projectIds);

			this.table.data.forEach((item, key) => {
				if (hasLink) {
					const project = projects.find(({ id }) => id === item.projectId);

					this.table.data[key].project = {
						routeName: "Project",
						name: project?.name,
						routeParams: { projectId: project?.id || 1 },
					};
				} else {
					this.table.data[key].project = this.prepareEntityForTable(item.projectId, projects, "name", "None");
				}
			});

			this.table.progress += 10;
			this.reload();
		},

		async prepareCommodityForTable(assistanceIds) {
			const commodities = await this.getCommodities(assistanceIds);

			this.table.data.forEach((item, key) => {
				const commodity = this.prepareEntityForTable(item.commodityId, commodities);
				this.table.data[key].commodity = commodity.modalityType;
				this.table.data[key].unit = commodity.unit;
			});

			this.table.progress += 10;
			this.reload();
		},

		async prepareBeneficiaryForTable(beneficiaryIds, hasLink = false, isInstitution = false) {
			let beneficiaries = {};

			if (beneficiaryIds.length) {
				beneficiaries = isInstitution
					? await this.fetchInstitutions(beneficiaryIds, { isArchived: true })
					: await this.getBeneficiaries(beneficiaryIds, { isArchived: true });
			}

			this.table.data.forEach((item, key) => {
				const { beneficiaryId } = item;
				const beneficiary = this.prepareEntityForTable(beneficiaryId, beneficiaries);

				if (beneficiary) {
					if (hasLink) {
						const routeName = isInstitution
							? "InstitutionDetail"
							: "HouseholdInformationSummary";
						const routeParams = isInstitution
							? { institutionId: beneficiaryId }
							: { householdId: beneficiary.householdId };
						const tooltip = isInstitution
							? "Deleted institution"
							: "Deleted member";

						this.table.data[key].beneficiaryId = {
							routeName,
							name: beneficiaryId,
							routeParams,
							isArchived: beneficiary.isArchived,
							tooltip,
						};
					} else {
						this.table.data[key].beneficiaryId = beneficiaryId;
					}

					this.table.data[key].localGivenName = isInstitution
						? beneficiary.name
						: beneficiary.localGivenName;
					this.table.data[key].localFamilyName = isInstitution
						? ""
						: beneficiary.localFamilyName;
				}
			});

			this.table.progress += 10;
			this.reload();
		},

		async prepareAssistanceForTable(assistanceIds, hasLink = false) {
			const assistances = await this.getAssistances(assistanceIds);

			this.table.data.forEach((item, key) => {
				const assistance = this.prepareEntityForTable(item.assistanceId, assistances);

				if (hasLink) {
					this.table.data[key].assistance = {
						routeName: "AssistanceDetail",
						name: assistance.name,
						routeParams: { projectId: assistance.projectId, assistanceId: assistance.id },
					};
				} else {
					this.table.data[key].assistance = assistance.name;
				}
			});

			this.table.progress += 10;
			this.reload();
		},

		async prepareVendorForTable(vendorIds) {
			const vendors = await this.getVendors(vendorIds);

			this.table.data.forEach((item, key) => {
				const vendor = this.prepareEntityForTable(item.vendorId, vendors);
				this.table.data[key].vendor = vendor.name;
				this.table.data[key].vendorNo = vendor.vendorNo;
			});

			this.table.progress += 10;
			this.reload();
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
				} = await ProjectService.getListOfProjects({});

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
				} = await VendorService.getListOfVendors({});

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
	},
};
