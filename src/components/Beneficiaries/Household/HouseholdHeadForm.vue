<template>
	<form>
		<div v-if="isHouseholdHead && isEditing" class="household-type">
			<v-chip color="primary" variant="flat" label>H</v-chip>

			<span v-if="isHouseholdHeadNameLoaded" class="detail">{{ householdHeadTitle }}</span>
		</div>

		<v-row>
			<v-col cols="3">
				<h4 class="mb-4">{{ $t('Name') }}</h4>

				<DataInput
					v-model="formModel.nameLocal.familyName"
					:error-messages="validationMsg('nameLocal.familyName')"
					label="Local family name"
					name="local-family-name"
					class="mb-4"
					@update:modelValue="onValidate('nameLocal.familyName')"
				/>

				<DataInput
					v-model="formModel.nameLocal.firstName"
					:error-messages="validationMsg('nameLocal.firstName')"
					label="Local given name"
					name="local-given-name"
					class="mb-4"
					@update:modelValue="onValidate('nameLocal.firstName')"
				/>

				<DataInput
					v-model="formModel.nameLocal.parentsName"
					label="Local parent's name"
					name="local-parents-name"
					class="mb-4"
					optional
				/>
			</v-col>

			<v-col cols="3">
				<h4 class="mb-4">{{ $t('Name (English)') }}</h4>

				<DataInput
					v-model="formModel.nameEnglish.familyName"
					label="English family name"
					name="english-family-name"
					class="mb-4"
					optional
				/>

				<DataInput
					v-model="formModel.nameEnglish.firstName"
					label="English given name"
					name="english-given-name"
					class="mb-4"
					optional
				/>

				<DataInput
					v-model="formModel.nameEnglish.parentsName"
					label="English parent's name"
					name="english-parents-name"
					class="mb-4"
					optional
				/>
			</v-col>

			<v-col cols="3">
				<h4 class="mb-4">{{ $t('Personal Information') }}</h4>

				<DataSelect
					v-model="formModel.personalInformation.gender"
					:items="options.gender"
					:error-messages="validationMsg('personalInformation.gender')"
					label="Gender"
					name="gender"
					class="mb-4"
					is-search-enabled
					@update:modelValue="onValidate('personalInformation.gender')"
				/>

				<DatePicker
					v-model="formModel.personalInformation.dateOfBirth"
					:error-messages="validationMsg('personalInformation.dateOfBirth')"
					label="Date of birth"
					name="date-of-birth"
					class="mb-4"
					@update:modelValue="onValidate('personalInformation.dateOfBirth')"
				/>
			</v-col>

			<v-col cols="3">
				<h4 class="mb-4">
					{{ $t('ID') }}
					<i class="optional-text font-weight-regular">
						- {{ $t('Optional') }}
					</i>
				</h4>

				<v-tabs v-model="idTabs" density="compact">
					<v-tab value="primary">{{ $t('Primary') }}</v-tab>

					<v-tab value="secondary" :disabled="isSecondaryIdTabDisabled">{{ $t('Secondary') }}</v-tab>

					<v-tab value="tertiary" :disabled="isTertiaryIdTabDisabled">{{ $t('Tertiary') }}</v-tab>
				</v-tabs>

				<v-window v-model="idTabs" class="pt-4">
					<v-window-item value="primary">
						<DataSelect
							v-model="formModel.primaryId.idType"
							:items="options.idType"
							:loading="idTypeLoading"
							:error-messages="validationMsg('primaryId.idType')"
							label="ID Type"
							name="it-type"
							class="mb-4"
							is-search-enabled
							@update:modelValue="onValidate('primaryId.idType'); onIdChange($event)"
						/>

						<DataInput
							v-model.trim="formModel.primaryId.idNumber"
							:error-messages="validationMsg('primaryId.idNumber')"
							label="ID Number"
							name="id-number"
							class="mb-4"
							@update:modelValue="onValidate('primaryId.idNumber')"
						/>
					</v-window-item>

					<v-window-item value="secondary">
						<DataSelect
							v-model="formModel.secondaryId.idType"
							:items="options.idType"
							:loading="idTypeLoading"
							:error-messages="validationMsg('secondaryId.idType')"
							label="ID Type"
							name="it-type"
							class="mb-4"
							is-search-enabled
							@update:modelValue="onValidate('secondaryId.idType'); onIdChange($event)"
						/>

						<DataInput
							v-model.trim="formModel.secondaryId.idNumber"
							:error-messages="validationMsg('secondaryId.idNumber')"
							label="ID Number"
							name="id-number"
							class="mb-4"
							@update:modelValue="onValidate('secondaryId.idNumber')"
						/>
					</v-window-item>

					<v-window-item value="tertiary">
						<DataSelect
							v-model="formModel.tertiaryId.idType"
							:items="options.idType"
							:loading="idTypeLoading"
							:error-messages="validationMsg('tertiaryId.idType')"
							label="ID Type"
							name="it-type"
							class="mb-4"
							is-search-enabled
							@update:modelValue="onValidate('tertiaryId.idType'); onIdChange($event)"
						/>

						<DataInput
							v-model.trim="formModel.tertiaryId.idNumber"
							:error-messages="validationMsg('tertiaryId.idNumber')"
							label="ID Number"
							name="id-number"
							class="mb-4"
							@update:modelValue="onValidate('tertiaryId.idNumber')"
						/>
					</v-window-item>
				</v-window>
			</v-col>

			<v-col cols="3">
				<h4 class="mb-4">{{ $t('Residency') }}</h4>

				<DataSelect
					v-model="formModel.residencyStatus"
					:items="options.residencyStatus"
					:loading="residenceStatusesLoading"
					:error-messages="validationMsg('residencyStatus')"
					label="Residency status"
					name="residency-status"
					class="mb-4"
					is-search-enabled
					@update:modelValue="onValidate('residencyStatus')"
				/>

				<v-card
					v-if="isEditing && smartCardNumbersList.length"
					class="mb-4 pa-3"
					variant="outlined"
				>
					<h5>{{ $t('Smartcard number') }}</h5>

					<ul>
						<li
							v-for="smartCardNumber in smartCardNumbersList"
							:key="smartCardNumber.serialNumber"
						>
							{{ smartCardNumber.serialNumber }} ({{ smartCardNumber.state }})
						</li>
					</ul>
				</v-card>
			</v-col>

			<v-col cols="3">
				<h4 class="mb-4">
					{{ $t('Referral') }}
					<i class="optional-text font-weight-regular">
						- {{ $t('Optional') }}
					</i>
				</h4>

				<v-checkbox
					v-model="formModel.addAReferral"
					:label="$t('Add a Referral')"
					name="add-a-referral"
					density="compact"
					hide-details
				/>

				<DataSelect
					v-if="formModel.addAReferral"
					v-model="formModel.referral.referralType"
					:items="options.referralType"
					:loading="referralTypeLoading"
					label="Referral Type"
					name="referral-type"
					class="mb-4"
					is-search-enabled
				/>

				<DataInput
					v-if="formModel.addAReferral"
					v-model="formModel.referral.comment"
					label="Comment"
					name="Comment"
					class="mb-4"
				/>
			</v-col>

			<v-col cols="3">
				<h4 class="mb-4">
					{{ $t('Phone') }}
					<i class="optional-text font-weight-regular">
						- {{ $t('Optional') }}
					</i>
				</h4>

				<div class="d-flex align-end">
					<DataSelect
						v-model="formModel.phone1.type"
						:items="options.phoneType"
						:loading="phoneTypesLoading"
						label="Type phone 1"
						name="phone1-type"
						class="mb-4"
						is-search-enabled
					/>

					<v-checkbox
						v-model="formModel.phone1.proxy"
						:label="$t('Proxy')"
						name="phone1-proxy"
						density="compact"
						class="ml-2 mb-4"
						hide-details
					/>
				</div>

				<DataSelect
					v-model="formModel.phone1.ext"
					:items="options.phonePrefixes"
					:error-messages="validationMsg('phone1.ext')"
					label="Prefix phone 1"
					name="phone1-prefix"
					class="mb-4"
					is-search-enabled
					@update:modelValue="onValidate('phone1.ext')"
				/>

				<DataInput
					v-model="formModel.phone1.phoneNo"
					label="Phone No. 1"
					name="phone1-no"
					class="mb-4"
				/>
			</v-col>

			<v-col cols="3">
				<h4 class="mb-4">
					{{ $t('Phone 2') }}
					<i class="optional-text font-weight-regular">
						- {{ $t('Optional') }}
					</i>
				</h4>

				<div class="d-flex align-end">
					<DataSelect
						v-model="formModel.phone2.type"
						:items="options.phoneType"
						:loading="phoneTypesLoading"
						label="Type phone 2"
						name="phone2-type"
						class="mb-4"
						is-search-enabled
					/>

					<v-checkbox
						v-model="formModel.phone2.proxy"
						:label="$t('Proxy')"
						name="phone2-proxy"
						density="compact"
						class="ml-2 mb-4"
						hide-details
					/>
				</div>

				<DataSelect
					v-model="formModel.phone2.ext"
					:items="options.phonePrefixes"
					:error-messages="validationMsg('phone2.ext')"
					label="Prefix phone 2"
					name="phone2-prefix"
					class="mb-4"
					is-search-enabled
					@update:modelValue="onValidate('phone2.ext')"
				/>

				<DataInput
					v-model="formModel.phone2.phoneNo"
					label="Phone No. 2"
					name="phone2-no"
					class="mb-4"
				/>
			</v-col>

			<v-col cols="12">
				<h4 class="mb-4">
					{{ $t('Vulnerability criteria') }}
					<i class="optional-text font-weight-regular">
						- {{ $t('Optional') }}
					</i>
				</h4>

				<div class="d-flex flex-wrap">
					<v-checkbox
						v-for="vulnerability of options.vulnerabilities"
						v-model="formModel.vulnerabilities[vulnerability.code]"
						:key="vulnerability.code"
						:label="$t(normalizeText(vulnerability.value))"
						name="phone2-proxy"
						density="compact"
						class="flex-0-0 ml-2"
						hide-details
					/>
				</div>
			</v-col>
		</v-row>
	</form>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DatePicker from "@/components/Inputs/DatePicker";
import idHelper from "@/mixins/idHelper";
import validation from "@/mixins/validation";
import { getArrayOfCodeListByKey, getObjectForCheckboxes } from "@/utils/codeList";
import { normalizeText } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import { PHONE } from "@/consts";
import { helpers, maxLength, required, requiredIf } from "@vuelidate/validators";

export default {
	name: "HouseholdHeadForm",

	components: {
		DatePicker,
		DataSelect,
		DataInput,
	},

	mixins: [validation, idHelper],

	validations() {
		return {
			formModel: {
				nameLocal: {
					familyName: { required },
					firstName: { required },
				},
				personalInformation: {
					gender: { required },
					dateOfBirth: { required },
				},
				primaryId: {
					idType: {
						required: requiredIf(this.formModel.primaryId.idNumber),
						isPrimaryIdValid: helpers.withMessage(
							this.primaryIdValidationMessage,
							function () { return this.isPrimaryIdValid; },
						),
					},
					idNumber: {
						maxLength: maxLength(255),
						required: requiredIf(
							this.formModel.primaryId.idType
								|| (this.formModel.primaryId.idType && !this.formModel.primaryId.idNumber.trim()),
						),
					},
				},
				secondaryId: {
					idType: {
						required: requiredIf(this.formModel.secondaryId.idNumber),
						isSecondaryIdValid: helpers.withMessage(
							this.secondaryIdValidationMessage,
							function () { return this.isSecondaryIdValid; },
						),
					},
					idNumber: {
						maxLength: maxLength(255),
						required: requiredIf(
							this.formModel.secondaryId.idType
								|| (this.formModel.secondaryId.idType
										&& !this.formModel.secondaryId.idNumber.trim()),
						),
					},
				},
				tertiaryId: {
					idType: {
						required: requiredIf(this.formModel.tertiaryId.idNumber),
						isTertiaryIdValid: helpers.withMessage(
							this.tertiaryIdValidationMessage,
							function () { return this.isTertiaryIdValid; },
						),
					},
					idNumber: {
						maxLength: maxLength(255),
						required: requiredIf(
							this.formModel.tertiaryId.idType
								|| (this.formModel.tertiaryId.idType && !this.formModel.tertiaryId.idNumber.trim()),
						),
					},
				},
				residencyStatus: { required },
				phone1: {
					ext: {
						required: requiredIf(this.formModel.phone1.phoneNo),
					},
				},
				phone2: {
					ext: {
						required: requiredIf(this.formModel.phone2.phoneNo),
					},
				},
			},
		};
	},

	props: {
		showTypeOfBeneficiary: Boolean,

		detailOfHousehold: {
			type: Object,
			default: null,
		},

		beneficiary: {
			type: Object,
			default: null,
		},

		isEditing: {
			type: Boolean,
			default: false,
		},

		isHouseholdHead: {
			type: Boolean,
			default: false,
		},

		membersSmartCardNumbers: {
			type: Array,
			default: () => [],
		},
	},

	emits: ["loaded"],

	data() {
		return {
			idTabs: "primary",
			isPrimaryIdValid: true,
			isSecondaryIdValid: true,
			isTertiaryIdValid: true,
			primaryIdValidationMessage: "",
			secondaryIdValidationMessage: "",
			tertiaryIdValidationMessage: "",
			detailOfHouseholdHead: {},
			householdHeadSmartCardNumbers: [],
			formModel: {
				beneficiaryId: null,
				nameLocal: {
					familyName: "",
					firstName: "",
					parentsName: "",
				},
				nameEnglish: {
					familyName: "",
					firstName: "",
					parentsName: "",
				},
				personalInformation: {
					gender: null,
					dateOfBirth: null,
				},
				primaryId: {
					idType: null,
					idNumber: "",
					priority: 1,
				},
				secondaryId: {
					idType: null,
					idNumber: "",
					priority: 2,
				},
				tertiaryId: {
					idType: null,
					idNumber: "",
					priority: 3,
				},
				residencyStatus: null,
				addAReferral: false,
				referral: {
					referralType: null,
					comment: "",
				},
				phone1: {
					type: null,
					proxy: false,
					ext: null,
					phoneNo: "",
				},
				phone2: {
					type: null,
					proxy: false,
					ext: null,
					phoneNo: "",
				},
				vulnerabilities: [],
				isHead: this.isHouseholdHead,
			},
			options: {
				gender: [
					{ code: "M", value: this.$t("Male") },
					{ code: "F", value: this.$t("Female") },
				],
				idType: [],
				residencyStatus: [],
				referralType: [],
				phoneType: [],
				phonePrefixes: PHONE.CODES,
				vulnerabilities: [],
			},
			idTypeLoading: true,
			residenceStatusesLoading: true,
			phoneTypesLoading: true,
			referralTypeLoading: true,
		};
	},

	computed: {
		isSecondaryIdTabDisabled() {
			return !this.formModel.primaryId.idNumber || !this.formModel.primaryId.idType;
		},

		isTertiaryIdTabDisabled() {
			return this.isSecondaryIdTabDisabled
				|| (!this.formModel.secondaryId.idNumber || !this.formModel.secondaryId.idType);
		},

		isHouseholdHeadNameLoaded() {
			return this.detailOfHouseholdHead.localFamilyName
				&& this.detailOfHouseholdHead.localGivenName;
		},

		householdHeadTitle() {
			return `${this.$t("ID")} ${this.detailOfHousehold.householdHeadId}:
				${this.detailOfHouseholdHead.localFamilyName} ${this.detailOfHouseholdHead.localGivenName}`;
		},

		smartCardNumbersList() {
			return this.isHouseholdHead
				? this.householdHeadSmartCardNumbers
				: this.membersSmartCardNumbers;
		},
	},

	watch: {
		detailOfHousehold: "map",
		beneficiary: "map",
	},

	async mounted() {
		if (this.isEditing) {
			if (this.isHouseholdHead) {
				await this.fetchSmartCard(this.detailOfHousehold.householdHeadId);
			}
		}
		await Promise.all([
			this.fetchNationalCardTypes(),
			this.fetchPhoneTypes(),
			this.fetchVulnerabilities(),
			this.fetchResidenceStatus(),
			this.fetchReferralTypes(),
		]);
		await this.map();
	},

	methods: {
		async map() {
			if (this.isEditing) {
				if (this.beneficiary) {
					await this.mapDetailOfHouseholdToFormModel(this.beneficiary);
				} else {
					const data = await BeneficiariesService
						.getBeneficiary(this.detailOfHousehold.householdHeadId);

					this.detailOfHouseholdHead = data;
					await this.mapDetailOfHouseholdToFormModel(data);
				}
			}
			this.$emit("loaded");
		},

		async mapDetailOfHouseholdToFormModel(beneficiary) {
			const {
				id,
				dateOfBirth,
				enFamilyName,
				enGivenName,
				enParentsName,
				gender,
				localFamilyName,
				localGivenName,
				localParentsName,
				nationalIds,
				phoneIds,
				referralComment,
				referralType,
				vulnerabilityCriteria,
				isHead,
				residencyStatus,
			} = beneficiary;

			if (referralComment || referralType) {
				this.formModel.addAReferral = true;
			}

			const { phone1, phone2 } = await this.getPhones(phoneIds);

			const validNationalIdNames = ["isPrimaryIdValid", "isSecondaryIdValid", "isTertiaryIdValid"];

			const nationalIdsData = await this.getNationalIds(nationalIds);
			nationalIdsData.sort((a, b) => a.idPriority - b.idPriority);

			nationalIdsData.forEach(({ idType, idNumber }, index) => {
				this[validNationalIdNames[index]] = !!((idType && idNumber)
            || (!idType && !idNumber));
			});

			this.formModel = {
				...this.formModel,
				beneficiaryId: id,
				nameLocal: {
					familyName: localFamilyName,
					firstName: localGivenName,
					parentsName: localParentsName,
				},
				nameEnglish: {
					familyName: enFamilyName,
					firstName: enGivenName,
					parentsName: enParentsName,
				},
				personalInformation: {
					gender: getArrayOfCodeListByKey([gender], this.options.gender, "code"),
					dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
				},
				primaryId: nationalIdsData[0] || { idNumber: "", idType: null, idPriority: 1 },
				secondaryId: nationalIdsData[1] || { idNumber: "", idType: null, idPriority: 2 },
				tertiaryId: nationalIdsData[2] || { idNumber: "", idType: null, idPriority: 3 },
				residencyStatus: getArrayOfCodeListByKey([residencyStatus], this.options.residencyStatus, "code"),
				referral: {
					referralType: getArrayOfCodeListByKey([referralType], this.options.referralType, "code"),
					comment: referralComment,
				},
				phone1,
				phone2,
				isHead,
				vulnerabilities: getObjectForCheckboxes(vulnerabilityCriteria, this.options.vulnerabilities, "code"),
			};
		},

		normalizeText(text) {
			return normalizeText(text);
		},

		async getPhones(ids) {
			const phones = {
				phone1: this.formModel.phone1,
				phone2: this.formModel.phone2,
			};
			const promises = [];
			await ids.forEach((id, key) => {
				const promise = BeneficiariesService.getPhone(id)
					.then(({ type, proxy, prefix, number }) => {
						phones[`phone${key + 1}`] = {
							type: getArrayOfCodeListByKey([type], this.options.phoneType, "code"),
							proxy,
							ext: getArrayOfCodeListByKey([prefix], this.options.phonePrefixes, "code"),
							phoneNo: number,
						};
					}).catch((e) => {
						Notification(`${this.$t("Phone")} ${key + 1} ${e.message || e}`, "error");
					});
				promises.push(promise);
			});
			await Promise.all(promises);
			return phones;
		},

		async fetchSmartCard(beneficiaryId) {
			try {
				const { data } = await BeneficiariesService.getSmartCard(beneficiaryId);

				this.householdHeadSmartCardNumbers = data;
			} catch (e) {
				Notification(`${this.$t("Smartcard")} ${e.message || e}`, "error");
			}
		},

		async getNationalIds(ids) {
			try {
				const { data } = await BeneficiariesService.getNationalIds(ids);

				return data.map((nationalId) => ({
					idType: getArrayOfCodeListByKey([nationalId.type], this.options.idType, "code"),
					idNumber: nationalId.number,
					idPriority: nationalId.priority,
				}));
			} catch (e) {
				Notification(`${this.$t("National ID")} ${e.message || e}`, "error");
				return null;
			}
		},

		async fetchNationalCardTypes() {
			await BeneficiariesService.getListOfTypesOfNationalIds()
				.then(({ data }) => { this.options.idType = data; })
				.catch((e) => {
					Notification(`${this.$t("National IDs")} ${e.message || e}`, "error");
				});

			this.idTypeLoading = false;
		},

		async fetchPhoneTypes() {
			await BeneficiariesService.getListOfTypesOfPhones()
				.then(({ data }) => { this.options.phoneType = data; })
				.catch((e) => {
					Notification(`${this.$t("Phone Types")} ${e.message || e}`, "error");
				});

			this.phoneTypesLoading = false;
		},

		async fetchVulnerabilities() {
			await BeneficiariesService.getListOfVulnerabilities()
				.then(({ data }) => { this.options.vulnerabilities = data; })
				.catch((e) => {
					Notification(`${this.$t("Vulnerabilities")} ${e.message || e}`, "error");
				});
		},

		async fetchResidenceStatus() {
			await BeneficiariesService.getListOfResidenceStatuses()
				.then(({ data }) => { this.options.residencyStatus = data; })
				.catch((e) => {
					Notification(`${this.$t("Residency Statuses")} ${e.message || e}`, "error");
				});

			this.residenceStatusesLoading = false;
		},

		async fetchReferralTypes() {
			await BeneficiariesService.getListOfReferralTypes()
				.then(({ data }) => { this.options.referralType = data; })
				.catch((e) => {
					Notification(`${this.$t("Referral Types")} ${e.message || e}`, "error");
				});

			this.referralTypeLoading = false;
		},

		submit() {
			this.v$.$touch();

			if (this.v$.$error) {
				Notification(this.$t("Please fill all required fields in Household Head or Members step"), "error");
			}

			return !this.v$.$invalid;
		},
	},
};
</script>

<style lang="scss" scoped>
.household-type {
	display: flex;
	margin-bottom: 1rem;
	font-weight: bold;

	.detail {
		display: flex;
		align-items: center;
		padding-left: .5rem;
	}
 }
</style>
