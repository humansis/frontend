import { mapActions, mapState } from "vuex";
import BeneficiariesService from "@/services/BeneficiariesService";
import InstitutionService from "@/services/InstitutionService";
import ProjectService from "@/services/ProjectService";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { PHONE, ROUTER } from "@/consts";

export default {
	data() {
		return {
			options: {
				nationalCardTypes: [],
				institutionTypes: [],
				phonePrefixes: PHONE.CODES,
				phoneTypes: [],
				projects: [],
				externalReceivedTypes: [],
			},
		};
	},

	computed: {
		...mapState(["institutionIdNames"]),

		firstInstitutionIdName() {
			return this.institutionIdNames.idNumber1 || `${this.$t("ID number")} 1`;
		},

		secondInstitutionIdName() {
			return this.institutionIdNames.idNumber2 || `${this.$t("ID number")} 2`;
		},

		thirdInstitutionIdName() {
			return this.institutionIdNames.idNumber3 || `${this.$t("ID number")} 3`;
		},
	},

	methods: {
		...mapActions(["storeInstitutionIdNames"]),

		mapToModel(
			{
				id,
				name,
				type,
				idNumber1,
				idNumber2,
				idNumber3,
				projectIds,
				address,
				adm1,
				adm2,
				adm3,
				adm4,
				latitude,
				longitude,
				note,
				eloNumber,
				contractNumber,
				contactGivenName,
				contactParentsName,
				contactFamilyName,
				nationalId,
				otherContactInformation,
				phone,
				secondPhone,
				supportReceivedTypes,
				supportDateReceived,
				supportOrganizationName,
			},
		) {
			const { street, number, postcode } = address;
			const institutionType = getArrayOfCodeListByKey(
				[type],
				this.options.institutionTypes,
				"code",
			);
			const nationalCardType = nationalId?.type
				?	getArrayOfCodeListByKey(
					[nationalId?.type],
					this.options.nationalCardTypes,
					"code",
				)
				: null;
			const phone1 = {
				...phone?.type && { type: { code: phone.type, value: phone.type } },
				proxy: phone?.proxy,
				...phone?.prefix && { ext: getArrayOfCodeListByKey(
					[phone.prefix],
					this.options.phonePrefixes,
					"code",
				) },
				phoneNo: phone?.number,
			};
			const phone2 = {
				...secondPhone?.type && { type: { code: secondPhone.type, value: secondPhone.type } },
				proxy: secondPhone?.proxy,
				...secondPhone?.prefix && { ext: getArrayOfCodeListByKey(
					[secondPhone.prefix],
					this.options.phonePrefixes,
					"code",
				) },
				phoneNo: secondPhone?.number,
			};
			const externalReceivedTypes = supportReceivedTypes
				?	getArrayOfCodeListByKey(
					supportReceivedTypes,
					this.options.externalReceivedTypes,
					"code",
				)
				: null;
			const modifiedSupportDateReceived = supportDateReceived
				? new Date(supportDateReceived)
				: null;

			const projects = getArrayOfCodeListByKey(
				projectIds,
				this.options.projects,
				"id",
			);

			return {
				...this.formModel || this.institutionModel,
				id,
				institutionName: name,
				institutionType,
				firstInstitutionId: idNumber1,
				secondInstitutionId: idNumber2,
				thirdInstitutionId: idNumber3,
				projectName: projects,
				addressStreet: street,
				addressNumber: number,
				addressPostCode: postcode,
				adm1,
				adm2,
				adm3,
				adm4,
				adm1Id: adm1?.id,
				adm2Id: adm2?.id,
				adm3Id: adm3?.id,
				adm4Id: adm4?.id,
				latitude,
				longitude,
				note,
				eloNumber,
				contractNumber,
				contactGivenName,
				contactParentsName,
				contactFamilyName,
				nationalCardType,
				nationalCardNumber: nationalId?.number,
				otherContactInformation,
				phone1,
				phone2,
				externalReceivedTypes,
				supportDateReceived: modifiedSupportDateReceived,
				supportOrganization: supportOrganizationName,
			};
		},

		async createInstitution(institutionBody) {
			try {
				const {
					status,
					message,
				} = await InstitutionService.createInstitution(
					institutionBody,
				);

				checkResponseStatus(status, message);

				Notification(this.$t("Institution Successfully Created"), "success");
				await this.$router.push({ name: ROUTER.ROUTE_NAME.INSTITUTIONS.ROOT });
			} catch (e) {
				Notification(`${this.$t("Create Institution")}: ${e.message || e}`, "error");
			}
		},

		async updateInstitution(id, institutionBody) {
			try {
				const {
					status,
					message,
				} = await InstitutionService.updateInstitution({
					body: institutionBody,
					id,
				});

				checkResponseStatus(status, message);

				Notification(this.$t("Institution Successfully Updated"), "success");
				await this.$router.push({ name: ROUTER.ROUTE_NAME.INSTITUTIONS.ROOT });
			} catch (e) {
				Notification(`${this.$t("Update Institution")}: ${e.message || e}`, "error");
			}
		},

		async fetchInstitution() {
			try {
				const {
					data,
					status,
					message,
				} = await BeneficiariesService.getInstitution({
					id: this.$route.params.institutionId,
				});

				checkResponseStatus(status, message);

				this.formModel = this.mapToModel(data);
			} catch (e) {
				Notification(`${this.$t("Institution")}: ${e.message || e}`, "error");
			}
		},

		async fetchInstitutions(ids, filters) {
			try {
				const {
					data: { data },
					status,
					message,
				} = await BeneficiariesService.getInstitutions({
					ids,
					filters,
				});

				checkResponseStatus(status, message);
				return data;
			} catch (e) {
				Notification(`${this.$t("Institutions")}: ${e.message || e}`, "error");
				return [];
			}
		},

		async fetchPhoneTypes() {
			try {
				this.phoneTypesLoading = true;

				const {
					data: { data },
					status,
					message,
				} = await BeneficiariesService.getListOfTypesOfPhones();

				checkResponseStatus(status, message);

				this.options.phoneTypes = data;
			} catch (e) {
				Notification(`${this.$t("Phone Types")}: ${e.message || e}`, "error");
			} finally {
				this.phoneTypesLoading = false;
			}
		},

		async fetchSupportReceivedTypes() {
			try {
				this.externalSupportReceivedLoading = true;

				const {
					data: { data },
					status,
					message,
				} = await BeneficiariesService.getSupportReceivedTypes();

				checkResponseStatus(status, message);

				this.options.externalReceivedTypes = data;
			} catch (e) {
				Notification(`${this.$t("Support Received Types")}: ${e.message || e}`, "error");
			} finally {
				this.externalSupportReceivedLoading = false;
			}
		},

		async fetchNationalCardTypes() {
			try {
				this.nationalCardTypesLoading = true;

				const {
					data: { data },
					status,
					message,
				} = await BeneficiariesService.getListOfTypesOfNationalIds();

				checkResponseStatus(status, message);

				this.options.nationalCardTypes = data;
			} catch (e) {
				Notification(`${this.$t("National IDs")}: ${e.message || e}`, "error");
			} finally {
				this.nationalCardTypesLoading = false;
			}
		},

		async fetchProjects() {
			try {
				this.projectsLoading = true;

				const {
					data: { data },
					status,
					message,
				} = await ProjectService.getShortListOfProjects();

				checkResponseStatus(status, message);

				this.options.projects = data;
			} catch (e) {
				Notification(`${this.$t("Projects")}: ${e.message || e}`, "error");
			} finally {
				this.projectsLoading = false;
			}
		},

		async fetchInstitutionTypes() {
			try {
				this.institutionTypesLoading = true;

				const {
					data: { data },
					status,
					message,
				} = await InstitutionService.getListOfInstitutionTypes();

				checkResponseStatus(status, message);

				this.options.institutionTypes = data;
			} catch (e) {
				Notification(`${this.$t("Institution Types")}: ${e.message || e}`, "error");
			} finally {
				this.institutionTypesLoading = false;
			}
		},

		async fetchInstitutionIdNames() {
			try {
				if (!this.institutionIdNames?.idNumber1) {
					const {
						data,
						status,
						message,
					} = await InstitutionService.getInstitutionIdNames();

					checkResponseStatus(status, message);

					this.storeInstitutionIdNames(data);
				}
			} catch (e) {
				Notification(`${this.$t("Institution Id Names")}: ${e.message || e}`, "error");
			}
		},
	},
};
