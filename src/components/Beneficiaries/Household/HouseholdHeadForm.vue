<template>
	<div>
		<form>
			<div class="columns is-multiline">
				<div class="column is-one-quarter">
					<h4 class="title is-4">Name (Local)</h4>
					<b-field
						label="Family Name"
						:type="validateType('nameLocal.familyName')"
						:message="validateMsg('nameLocal.familyName')"
					>
						<b-input
							v-model="formModel.nameLocal.familyName"
							@blur="validate('nameLocal.familyName')"
						/>
					</b-field>
					<b-field
						label="Parents Name"
						:type="validateType('nameLocal.parentsName')"
						:message="validateMsg('nameLocal.parentsName')"
					>
						<b-input
							v-model="formModel.nameLocal.parentsName"
							@blur="validate('nameLocal.parentsName')"
						/>
					</b-field>
					<b-field
						label="First Name"
						:type="validateType('nameLocal.firstName')"
						:message="validateMsg('nameLocal.firstName')"
					>
						<b-input
							v-model="formModel.nameLocal.firstName"
							@blur="validate('nameLocal.firstName')"
						/>
					</b-field>
				</div>

				<div class="column is-one-quarter">
					<h4 class="title is-4">Name (English)</h4>
					<b-field
						label="Family Name"
						:type="validateType('nameEnglish.familyName')"
						:message="validateMsg('nameEnglish.familyName')"
					>
						<b-input
							v-model="formModel.nameEnglish.familyName"
							@blur="validate('nameEnglish.familyName')"
						/>
					</b-field>
					<b-field
						label="Parents Name"
						:type="validateType('nameEnglish.parentsName')"
						:message="validateMsg('nameEnglish.parentsName')"
					>
						<b-input
							v-model="formModel.nameEnglish.parentsName"
							@blur="validate('nameEnglish.parentsName')"
						/>
					</b-field>
					<b-field
						label="First Name"
						:type="validateType('nameEnglish.firstName')"
						:message="validateMsg('nameEnglish.firstName')"
					>
						<b-input
							v-model="formModel.nameEnglish.firstName"
							@blur="validate('nameEnglish.firstName')"
						/>
					</b-field>
				</div>

				<div class="column is-one-quarter">
					<h4 class="title is-4">Personal Information</h4>
					<b-field
						label="Gender"
						:type="validateType('personalInformation.gender')"
						:message="validateMsg('personalInformation.gender')"
					>
						<MultiSelect
							v-model="formModel.personalInformation.gender"
							searchable
							label="value"
							track-by="code"
							:options="options.gender"
							:class="validateMultiselect('personalInformation.gender')"
							@select="validate('personalInformation.gender')"
						/>
					</b-field>
					<b-field
						label="Date Of Birth"
						:type="validateType('personalInformation.dateOfBirth')"
						:message="validateMsg('personalInformation.dateOfBirth')"
					>
						<b-datepicker
							v-model="formModel.personalInformation.dateOfBirth"
							show-week-number
							placeholder="Click to select..."
							icon="calendar-day"
							trap-focus
							@blur="validate('personalInformation.dateOfBirth')"
						/>
					</b-field>
				</div>

				<div class="column is-one-quarter">
					<h4 class="title is-4">ID</h4>
					<b-field
						label="ID Type"
						:type="validateType('id.idType')"
						:message="validateMsg('id.idType')"
					>
						<MultiSelect
							v-model="formModel.id.idType"
							label="value"
							track-by="code"
							searchable
							:options="options.idType"
							:class="validateMultiselect('id.idType')"
							@select="validate('id.idType')"
						/>
					</b-field>
					<b-field
						label="ID Number"
						:type="validateType('id.idNumber')"
						:message="validateMsg('id.idNumber')"
					>
						<b-input
							v-model="formModel.id.idNumber"
							@blur="validate('id.idNumber')"
						/>
					</b-field>
				</div>

				<div class="column is-one-quarter">
					<h4 class="title is-4">Residency</h4>
					<b-field label="Residency Status">
						<MultiSelect
							v-model="formModel.residency.residencyStatus"
							searchable
							label="value"
							track-by="code"
							:options="options.residencyStatus"
						/>
					</b-field>
				</div>

				<div class="column is-one-quarter">
					<h4 class="title is-4">Referral</h4>
					<div class="field">
						<b-checkbox v-model="formModel.addAReferral">
							Add a Referral
						</b-checkbox>
					</div>
					<b-field v-if="formModel.addAReferral" label="Referral Type">
						<MultiSelect
							v-model="formModel.referral.referralType"
							searchable
							:options="options.referralType"
						/>
					</b-field>
					<b-field v-if="formModel.addAReferral" label="Comment">
						<b-input v-model="formModel.referral.comment" />
					</b-field>
				</div>

				<div class="column is-one-quarter">
					<h4 class="title is-4">Phone 1</h4>
					<b-field label="Type" grouped>
						<MultiSelect
							v-model="formModel.phone1.type"
							searchable
							selectLabel=""
							deselectLabel=""
							label="value"
							track-by="code"
							:options="options.phoneType"
						/>
						<b-checkbox class="ml-2" v-model="formModel.phone1.proxy">
							Proxy
						</b-checkbox>
					</b-field>
					<b-field label="Ext" grouped>
						<MultiSelect
							v-model="formModel.phone1.ext"
							searchable
							label="value"
							track-by="code"
							:options="options.phonePrefixes"
						/>
					</b-field>
					<b-field label="Phone No. 1">
						<b-input
							v-model="formModel.phone1.phoneNo"
						/>
					</b-field>
				</div>

				<div class="column is-one-quarter">
					<h4 class="title is-4">Phone 2</h4>
					<b-field label="Type" grouped>
						<MultiSelect
							v-model="formModel.phone2.type"
							searchable
							selectLabel=""
							deselectLabel=""
							label="value"
							track-by="code"
							:options="options.phoneType"
						/>
						<b-checkbox v-model="formModel.phone2.proxy" class="ml-2">
							Proxy
						</b-checkbox>
					</b-field>
					<b-field label="Ext" grouped>
						<MultiSelect
							v-model="formModel.phone2.ext"
							searchable
							label="value"
							track-by="code"
							:options="options.phonePrefixes"
						/>
					</b-field>
					<b-field label="Phone No. 2">
						<b-input
							v-model="formModel.phone2.phoneNo"
						/>
					</b-field>
				</div>
			</div>
			<div v-if="showTypeOfBeneficiary" class="field">
				<b-checkbox
					v-for="vulnerability of options.vulnerabilities"
					v-model="formModel.vulnerabilities"
					:native-value="vulnerability.code"
					:key="vulnerability.code"
				>
					{{ prepareVulnerability(vulnerability.value) }}
				</b-checkbox>
			</div>
		</form>
	</div>
</template>

<script>
import { Notification } from "@/utils/UI";
import { required } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";
import BeneficiariesService from "@/services/BeneficiariesService";
import { normalizeText } from "@/utils/datagrid";

export default {
	name: "HouseholdHeadForm",

	mixins: [Validation],

	props: {
		showTypeOfBeneficiary: Boolean,
		detailOfHousehold: Object,
	},

	watch: {
		detailOfHousehold(household) {
			this.mapDetailOfHouseholdToFormModel(household);
		},
	},

	validations: {
		formModel: {
			nameLocal: {
				familyName: { required },
				firstName: { required },
				parentsName: { required },
			},
			nameEnglish: {
				familyName: { required },
				firstName: { required },
				parentsName: { required },
			},
			personalInformation: {
				gender: { required },
				dateOfBirth: { required },
			},
			id: {
				idType: { required },
				idNumber: { required },
			},
		},
	},

	data() {
		return {
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
					dateOfBirth: new Date(),
				},
				id: {
					idType: "",
					idNumber: "",
				},
				residency: {
					residencyStatus: "",
				},
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
			},
			options: {
				gender: [
					{ code: "M", value: "Male" },
					{ code: "F", value: "Female" },
				],
				idType: [],
				residencyStatus: [],
				// TODO get from API
				referralType: ["Health", "Protection", "Shelter", "Nutrition", "Other"],
				phoneType: [],
				// TODO get from API
				phonePrefixes: [
					{ code: "+420", value: "CZ - +420" },
					{ code: "+421", value: "SK - +421" },
				],
				vulnerabilities: [],
			},
		};
	},

	mounted() {
		this.fetchNationalCardTypes();
		this.fetchVulnerabilities();
		this.fetchPhoneTypes();
		this.fetchResidenceStatus();
	},

	methods: {
		mapDetailOfHouseholdToFormModel() {
			// TODO map household param to formModel
		},

		prepareVulnerability(name) {
			return normalizeText(name);
		},

		async fetchNationalCardTypes() {
			await BeneficiariesService.getListOfTypesOfNationalIds()
				.then((response) => { this.options.idType = response.data; })
				.catch((e) => {
					Notification(`National IDs ${e}`, "is-danger");
				});
		},

		async fetchPhoneTypes() {
			await BeneficiariesService.getListOfTypesOfPhones()
				.then((response) => { this.options.phoneType = response.data; })
				.catch((e) => {
					Notification(`Phone types ${e}`, "is-danger");
				});
		},

		async fetchVulnerabilities() {
			await BeneficiariesService.getListOfVulnerabilities()
				.then((response) => { this.options.vulnerabilities = response.data; })
				.catch((e) => {
					Notification(`Vulnerabilities ${e}`, "is-danger");
				});
		},

		async fetchResidenceStatus() {
			await BeneficiariesService.getListOfResidenceStatuses()
				.then((response) => { this.options.residencyStatus = response.data; })
				.catch((e) => {
					Notification(`Residence Status ${e}`, "is-danger");
				});
		},

		submit() {
			this.$v.$touch();
			return !this.$v.$invalid;
		},
	},
};
</script>
