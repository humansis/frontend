<template>
	<form ref="householdHeadForm">
		<div class="columns is-multiline">
			<div class="column is-one-quarter">
				<h4 class="title is-5">{{ $t('Name') }}</h4>
				<b-field
					:label="$t('Family Name')"
					:type="validateType('nameLocal.familyName')"
					:message="validateMsg('nameLocal.familyName')"
				>
					<b-input
						v-model="formModel.nameLocal.familyName"
						@blur="validate('nameLocal.familyName')"
					/>
				</b-field>
				<b-field
					:label="$t('First Name')"
					:type="validateType('nameLocal.firstName')"
					:message="validateMsg('nameLocal.firstName')"
				>
					<b-input
						v-model="formModel.nameLocal.firstName"
						@blur="validate('nameLocal.firstName')"
					/>
				</b-field>
				<b-field>
					<template #label>
						<span>{{ $t('Parents Name') }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<b-input v-model="formModel.nameLocal.parentsName" />
				</b-field>
			</div>

			<div class="column is-one-quarter">
				<h4 class="title is-5">{{ $t('Name (English)') }}</h4>
				<b-field>
					<template #label>
						<span>{{ $t('Family Name') }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<b-input v-model="formModel.nameEnglish.familyName" />
				</b-field>
				<b-field>
					<template #label>
						<span>{{ $t('First Name') }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<b-input v-model="formModel.nameEnglish.firstName" />
				</b-field>
				<b-field>
					<template #label>
						<span>{{ $t('Parents Name') }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<b-input v-model="formModel.nameEnglish.parentsName" />
				</b-field>
			</div>

			<div class="column is-one-quarter">
				<h4 class="title is-5">{{ $t('Personal Information') }}</h4>
				<b-field
					:label="$t('Gender')"
					:type="validateType('personalInformation.gender')"
					:message="validateMsg('personalInformation.gender')"
				>
					<MultiSelect
						v-model="formModel.personalInformation.gender"
						searchable
						label="value"
						track-by="code"
						:placeholder="$t('Click to select')"
						:options="options.gender"
						:class="validateMultiselect('personalInformation.gender')"
						@select="validate('personalInformation.gender')"
					/>
				</b-field>
				<b-field
					:label="$t('Date of Birth')"
					:type="validateType('personalInformation.dateOfBirth')"
					:message="validateMsg('personalInformation.dateOfBirth')"
				>
					<b-datepicker
						v-model="formModel.personalInformation.dateOfBirth"
						show-week-number
						locale="en-CA"
						icon="calendar-day"
						trap-focus
						:placeholder="$t('Click to select')"
						@blur="validate('personalInformation.dateOfBirth')"
					/>
				</b-field>
			</div>

			<div class="column is-one-quarter">
				<h4 class="title is-5">
					{{ $t('ID') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</h4>
				<b-field
					:label="$t('ID Type')"
					:type="validateType('id.idType', true)"
					:message="validateMsg('id.idType')"
				>
					<MultiSelect
						v-model="formModel.id.idType"
						label="value"
						track-by="code"
						searchable
						:placeholder="$t('Click to select')"
						:loading="idTypeLoading"
						:options="options.idType"
						:class="validateMultiselect('id.idType', true)"
						@select="validate('id.idType')"
					/>
				</b-field>
				<b-field
					:label="$t('ID Number')"
					:type="validateType('id.idNumber', true)"
					:message="validateMsg('id.idNumber')"
				>
					<b-input
						v-model="formModel.id.idNumber"
						@blur="validate('id.idNumber', true)"
					/>
				</b-field>
			</div>

			<div class="column is-one-quarter">
				<h4 class="title is-5">{{ $t('Residency') }}</h4>
				<b-field
					:label="$t('Residency Status')"
					:type="validateType('residencyStatus')"
					:message="validateMsg('residencyStatus')"
				>
					<MultiSelect
						v-model="formModel.residencyStatus"
						searchable
						label="value"
						track-by="code"
						:placeholder="$t('Click to select')"
						:loading="residenceStatusesLoading"
						:options="options.residencyStatus"
						:class="validateMultiselect('residencyStatus')"
						@select="validate('residencyStatus')"
					>
						<template slot="singleLabel" slot-scope="props">
							<div class="option__desc">
								<span class="option__title">{{ normalizeText(props.option.value) }}</span>
							</div>
						</template>
						<template slot="option" slot-scope="props">
							<div class="option__desc">
								<span class="option__title">{{ normalizeText(props.option.value) }}</span>
							</div>
						</template>
					</MultiSelect>
				</b-field>
			</div>

			<div class="column is-one-quarter">
				<h4 class="title is-5">
					{{ $t('Referral') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</h4>
				<div class="field">
					<b-checkbox v-model="formModel.addAReferral">
						{{ $t('Add a Referral') }}
					</b-checkbox>
				</div>
				<b-field v-if="formModel.addAReferral" :label="$t('Referral Type')">
					<MultiSelect
						v-model="formModel.referral.referralType"
						searchable
						label="value"
						track-by="code"
						:placeholder="$t('Click to select')"
						:loading="referralTypeLoading"
						:options="options.referralType"
					/>
				</b-field>
				<b-field v-if="formModel.addAReferral" :label="$t('Comment')">
					<b-input v-model="formModel.referral.comment" />
				</b-field>
			</div>

			<div class="column is-one-quarter">
				<div class="mb-5">
					<span class="title is-5">{{ $t('Phone') }} 1</span>
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</div>
				<b-field :label="$t('Type')" grouped>
					<MultiSelect
						v-model="formModel.phone1.type"
						searchable
						selectLabel=""
						deselectLabel=""
						label="value"
						track-by="code"
						:placeholder="$t('Click to select')"
						:loading="phoneTypesLoading"
						:options="options.phoneType"
					/>
					<b-checkbox class="ml-2" v-model="formModel.phone1.proxy">
						{{ $t('Proxy') }}
					</b-checkbox>
				</b-field>
				<b-field :label="$t('Ext')" grouped>
					<MultiSelect
						v-model="formModel.phone1.ext"
						searchable
						label="value"
						track-by="code"
						:placeholder="$t('Click to select')"
						:options="options.phonePrefixes"
					/>
				</b-field>
				<b-field :label="$t('Phone No.') + ' 1'">
					<b-input v-model="formModel.phone1.phoneNo" />
				</b-field>
			</div>

			<div class="column is-one-quarter">
				<div class="mb-5">
					<span class="title is-5">
						{{ $t('Phone') }} 2
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</span>
				</div>
				<b-field :label="$t('Type')" grouped>
					<MultiSelect
						v-model="formModel.phone2.type"
						searchable
						selectLabel=""
						deselectLabel=""
						label="value"
						track-by="code"
						:placeholder="$t('Click to select')"
						:loading="phoneTypesLoading"
						:options="options.phoneType"
					/>
					<b-checkbox v-model="formModel.phone2.proxy" class="ml-2">
						{{ $t('Proxy') }}
					</b-checkbox>
				</b-field>
				<b-field :label="$t('Ext')" grouped>
					<MultiSelect
						v-model="formModel.phone2.ext"
						searchable
						label="value"
						track-by="code"
						:placeholder="$t('Click to select')"
						:options="options.phonePrefixes"
					/>
				</b-field>
				<b-field :label="$t('Phone No.') + ' 2'">
					<b-input v-model="formModel.phone2.phoneNo" />
				</b-field>
			</div>
		</div>
		<div v-if="showTypeOfBeneficiary" class="field">
			<b-checkbox
				v-for="vulnerability of options.vulnerabilities"
				v-model="formModel.vulnerabilities[vulnerability.code]"
				:native-value="vulnerability.code"
				:key="vulnerability.code"
			>
				{{ normalizeText(vulnerability.value) }}
			</b-checkbox>
		</div>
	</form>
</template>

<script>
import { required, requiredIf } from "vuelidate/lib/validators";
import BeneficiariesService from "@/services/BeneficiariesService";
import { getArrayOfCodeListByKey, getObjectForCheckboxes } from "@/utils/codeList";
import { normalizeText } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import PhoneCodes from "@/utils/phoneCodes";
import Validation from "@/mixins/validation";

export default {
	name: "HouseholdHeadForm",

	mixins: [Validation],

	props: {
		showTypeOfBeneficiary: Boolean,
		detailOfHousehold: Object,
		isEditing: {
			type: Boolean,
			default: false,
		},
		beneficiary: Object,
		isHouseholdHead: {
			type: Boolean,
			default: false,
		},
	},

	validations: {
		formModel: {
			nameLocal: {
				familyName: { required },
				firstName: { required },
				parentsName: {},
			},
			nameEnglish: {
				familyName: {},
				firstName: {},
				parentsName: {},
			},
			personalInformation: {
				gender: { required },
				dateOfBirth: { required },
			},
			id: {
				idType: { required: requiredIf((form) => form.idNumber) },
				idNumber: { required: requiredIf((form) => form.idType) },
			},
			residencyStatus: { required },
		},
	},

	data() {
		return {
			loadingComponent: null,
			formModel: {
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
					gender: "",
					dateOfBirth: null,
				},
				id: {
					idType: "",
					idNumber: "",
				},
				residencyStatus: "",
				addAReferral: false,
				referral: {
					referralType: "",
					comment: "",
				},
				phone1: {
					type: "",
					proxy: false,
					ext: "",
					phoneNo: "",
				},
				phone2: {
					type: "",
					proxy: false,
					ext: "",
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
				phonePrefixes: PhoneCodes,
				vulnerabilities: [],
			},
			idTypeLoading: true,
			residenceStatusesLoading: true,
			phoneTypesLoading: true,
			referralTypeLoading: true,
		};
	},

	watch: {
		detailOfHousehold: "map",
		beneficiary: "map",
	},

	async mounted() {
		if (this.isEditing) {
			this.loadingComponent = this.$buefy.loading.open({
				container: this.$refs.householdHeadForm,
			});
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
					await this.mapDetailOfHouseholdToFormModel(data);
				}
				this.loadingComponent.close();
			}
			this.$emit("loaded");
		},

		async mapDetailOfHouseholdToFormModel(beneficiary) {
			const {
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
			const id = await this.getNationalIdCard(nationalIds[0]);
			this.formModel = {
				...this.formModel,
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
					dateOfBirth: new Date(dateOfBirth),
				},
				id,
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
						if (e.message) Notification(`${this.$t("Phone")} ${key + 1} ${e}`, "is-danger");
					});
				promises.push(promise);
			});
			await Promise.all(promises);
			return phones;
		},

		async getNationalIdCard(id) {
			const nationalIdCard = {
				idType: this.formModel.id.idNumber,
				idNumber: this.formModel.id.idType,
			};
			if (id) {
				await BeneficiariesService.getNationalId(id).then(({ number, type }) => {
					nationalIdCard.idType = getArrayOfCodeListByKey([type], this.options.idType, "code");
					nationalIdCard.idNumber = number;
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("National ID")} ${e}`, "is-danger");
				});
			}

			return nationalIdCard;
		},

		async fetchNationalCardTypes() {
			await BeneficiariesService.getListOfTypesOfNationalIds()
				.then(({ data }) => { this.options.idType = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("National IDs")} ${e}`, "is-danger");
				});

			this.idTypeLoading = false;
		},

		async fetchPhoneTypes() {
			await BeneficiariesService.getListOfTypesOfPhones()
				.then(({ data }) => { this.options.phoneType = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Phone Types")} ${e}`, "is-danger");
				});

			this.phoneTypesLoading = false;
		},

		async fetchVulnerabilities() {
			await BeneficiariesService.getListOfVulnerabilities()
				.then(({ data }) => { this.options.vulnerabilities = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Vulnerabilities")} ${e}`, "is-danger");
				});
		},

		async fetchResidenceStatus() {
			await BeneficiariesService.getListOfResidenceStatuses()
				.then(({ data }) => { this.options.residencyStatus = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Residency Statuses")} ${e}`, "is-danger");
				});

			this.residenceStatusesLoading = false;
		},

		async fetchReferralTypes() {
			await BeneficiariesService.getListOfReferralTypes()
				.then(({ data }) => { this.options.referralType = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Referral Types")} ${e}`, "is-danger");
				});

			this.referralTypeLoading = false;
		},

		submit() {
			this.$v.$touch();
			return !this.$v.$invalid;
		},
	},
};
</script>
