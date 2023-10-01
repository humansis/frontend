import { mapState, mapActions } from "vuex";
import InstitutionService from "@/services/InstitutionService";
import BeneficiariesService from "@/services/BeneficiariesService";
import ProjectService from "@/services/ProjectService";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { Notification, Toast } from "@/utils/UI";
import PhoneCodes from "@/utils/phoneCodes";

export default {
	data() {
		return {
			options: {
				nationalCardTypes: [],
				institutionTypes: [],
				phonePrefixes: PhoneCodes,
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
				projects,
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
			const externalReceivedTypes = getArrayOfCodeListByKey(
				supportReceivedTypes,
				this.options.externalReceivedTypes,
				"code",
			);
			const modifiedSupportDateReceived = supportDateReceived
				? new Date(supportDateReceived)
				: null;

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
				const { status, message } = await InstitutionService.createInstitution(
					institutionBody,
				);

				if (status === 200) {
					Toast(this.$t("Institution Successfully Created"), "is-success");
					await this.$router.push({ name: "Institutions" });
				} else {
					Notification(message, "is-danger");
				}
			} catch (e) {
				Notification(`${this.$t("Create Institution")} ${e.message || e}`, "is-danger");
			}
		},

		async updateInstitution(id, institutionBody) {
			try {
				const { status, message } = await InstitutionService.updateInstitution(
					id,
					institutionBody,
				);

				if (status === 200) {
					Toast(this.$t("Institution Successfully Updated"), "is-success");
					await this.$router.push({ name: "Institutions" });
				} else {
					Notification(message, "is-danger");
				}
			} catch (e) {
				Notification(`${this.$t("Update Institution")} ${e.message || e}`, "is-danger");
			}
		},

		async fetchInstitution() {
			try {
				const institution = await BeneficiariesService.getInstitution(
					this.$route.params.institutionId,
				);

				this.formModel = this.mapToModel(institution);
			} catch (e) {
				Notification(`${this.$t("Institution")} ${e.message || e}`, "is-danger");
			}
		},

		async fetchPhoneTypes() {
			try {
				this.phoneTypesLoading = true;
				const { data } = await BeneficiariesService.getListOfTypesOfPhones();

				this.options.phoneTypes = data;
			} catch (e) {
				Notification(`${this.$t("Phone Types")} ${e.message || e}`, "is-danger");
			} finally {
				this.phoneTypesLoading = false;
			}
		},

		async fetchSupportReceivedTypes() {
			try {
				this.externalSupportReceivedLoading = true;
				const { data } = await BeneficiariesService.getSupportReceivedTypes();

				this.options.externalReceivedTypes = data;
			} catch (e) {
				Notification(`${this.$t("Support Received Types")} ${e.message || e}`, "is-danger");
			} finally {
				this.externalSupportReceivedLoading = false;
			}
		},

		async fetchNationalCardTypes() {
			try {
				this.nationalCardTypesLoading = true;
				const { data } = await BeneficiariesService.getListOfTypesOfNationalIds();

				this.options.nationalCardTypes = data;
			} catch (e) {
				Notification(`${this.$t("National IDs")} ${e.message || e}`, "is-danger");
			} finally {
				this.nationalCardTypesLoading = false;
			}
		},

		async fetchProjects() {
			try {
				this.projectsLoading = true;
				const { data } = await ProjectService.getListOfProjects();

				this.options.projects = data;
			} catch (e) {
				Notification(`${this.$t("Projects")} ${e.message || e}`, "is-danger");
			} finally {
				this.projectsLoading = false;
			}
		},

		async fetchInstitutionTypes() {
			try {
				this.institutionTypesLoading = true;
				const { data } = await InstitutionService.getListOfInstitutionTypes();

				this.options.institutionTypes = data;
			} catch (e) {
				Notification(`${this.$t("Institution Types")} ${e.message || e}`, "is-danger");
			} finally {
				this.institutionTypesLoading = false;
			}
		},

		async fetchInstitutionIdNames() {
			try {
				if (!this.institutionIdNames?.idNumber1) {
					const { data } = await InstitutionService.getInstitutionIdNames();

					this.storeInstitutionIdNames(data);
				}
			} catch (e) {
				Notification(`${this.$t("Institution Id Names")} ${e.message || e}`, "is-danger");
			}
		},
	},
};
