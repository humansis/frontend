import { mapState } from "vuex";
import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import LocationsService from "@/services/LocationsService";
import ProductService from "@/services/ProductService";
import ProjectService from "@/services/ProjectService";
import VendorService from "@/services/VendorService";
import baseHelper from "@/mixins/baseHelper";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	mixins: [baseHelper],

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

		// Methods for Data Grid
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
					? await BeneficiariesService.getInstitutions(beneficiaryIds, { isArchived: true })
					: await this.getBeneficiaries(beneficiaryIds, { isArchived: true });
			}

			this.table.data.forEach((item, key) => {
				const { beneficiaryId } = item;
				const beneficiary = item.type === "Institution"
					? this.prepareEntityForTable(beneficiaryId, beneficiaries.data)
					: this.prepareEntityForTable(beneficiaryId, beneficiaries);

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
			return ProductService.getProducts(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Products")} ${e.message || e}`, "error");
				});
		},

		async getCommodities(ids) {
			if (!ids.length) return [];
			return AssistancesService.getCommodities(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Commodities")} ${e.message || e}`, "error");
				});
		},

		async getVendors(ids) {
			if (!ids.length) return [];

			/*
			*	TODO In future we probably need to refactor sending arguments
			*   in functions and make it like one object with properties, because these nulls are horrible
			*/

			return VendorService.getListOfVendors(null, null, null, null, null, ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Vendors")} ${e.message || e}`, "error");
				});
		},

		async getAdm1s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm1s(ids)
				.then(({ data }) => data);
		},

		async getAdm2s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm2s(ids)
				.then(({ data }) => data);
		},

		async getAdm3s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm3s(ids)
				.then(({ data }) => data);
		},

		async getAdm4s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm4s(ids)
				.then(({ data }) => data);
		},

		async getAssistances(ids) {
			if (!ids.length) return [];
			return AssistancesService.getAssistances(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Assistances")} ${e.message || e}`, "error");
				});
		},

		async getBeneficiaries(ids, filters) {
			return BeneficiariesService.getBeneficiaries(ids, filters)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Beneficiaries")} ${e.message || e}`, "error");
				});
		},

		async getProjects(ids) {
			return ProjectService.getListOfProjects(null, null, null, ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
				});
		},

		// Methods for Filters
		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.filtersOptions.project.data = data;
					this.filtersOptions.project.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
				});
		},

		async fetchModalityTypes() {
			await AssistancesService.getListOfAllModalityTypes()
				.then(({ data }) => {
					this.filtersOptions.commodity.data = data;
					this.filtersOptions.commodity.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Modality")}${e.message || e}`, "error");
				});
		},

		async fetchVendors() {
			await VendorService.getListOfVendors()
				.then(({ data }) => {
					this.filtersOptions.vendor.data = data.map((item) => {
						const vendor = { ...item };
						vendor.vendorName = `${item.name} ${item.shop ? `(${item.shop})` : ""}`;
						return vendor;
					});
					this.filtersOptions.vendor.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Vendor")}${e.message || e}`, "error");
				});
		},

		async fetchBeneficiaryTypes() {
			await BeneficiariesService.getBeneficiaryTypes()
				.then(({ data }) => {
					this.filtersOptions.beneficiaryType.data = data;
					this.filtersOptions.beneficiaryType.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Beneficiary Types")} ${e.message || e}`, "error");
				});
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
