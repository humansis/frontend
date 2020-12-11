<template>
	<div>
		<form>
			<div class="columns is-multiline">
				<div class="column is-one-quarter">
					<h4 class="title is-4">Name (Local)</h4>
					<b-field label="Family Name">
						<b-input v-model="formModel.nameLocal.familyName" />
					</b-field>
					<b-field label="First Name">
						<b-input v-model="formModel.nameLocal.firstName" />
					</b-field>
				</div>

				<div class="column is-one-quarter">
					<h4 class="title is-4">Name (English)</h4>
					<b-field label="Family Name">
						<b-input v-model="formModel.nameEnglish.familyName" />
					</b-field>
					<b-field label="First Name">
						<b-input v-model="formModel.nameEnglish.firstName" />
					</b-field>
				</div>

				<div class="column is-one-quarter">
					<h4 class="title is-4">Personal Information</h4>
					<b-field label="Gender">
						<MultiSelect
							v-model="formModel.personalInformation.gender"
							searchable
							label="value"
							track-by="code"
							:options="options.gender"
						/>
					</b-field>
					<b-field label="Date Of Birth">
						<b-datepicker
							v-model="formModel.personalInformation.dateOfBirth"
							show-week-number
							locale="en-US"
							placeholder="Click to select..."
							icon="calendar-day"
							trap-focus
						/>
					</b-field>
				</div>

				<div class="column is-one-quarter">
					<h4 class="title is-4">ID</h4>
					<b-field label="ID Type">
						<MultiSelect
							v-model="formModel.id.idType"
							label="value"
							track-by="code"
							searchable
							:options="options.idType"
						/>
					</b-field>
					<b-field label="ID Number">
						<b-input v-model="formModel.id.idNumber" />
					</b-field>
				</div>

				<div class="column is-one-quarter">
					<h4 class="title is-4">Residency</h4>
					<b-field label="Residency Status">
						<MultiSelect
							v-model="formModel.residency.residencyStatus"
							searchable
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
							:options="options.phoneType"
						/>
						<b-checkbox v-model="formModel.phone1.proxy">
							Proxy
						</b-checkbox>
					</b-field>
					<b-field label="Ext" grouped>
						<MultiSelect
							v-model="formModel.phone1.ext"
							searchable
							label="name"
							track-by="id"
							:options="options.phonePrefixes"
						/>
						<b-input
							v-model="formModel.phone1.phoneNo"
							placeholder="Phone No. 1"
						/>
					</b-field>
				</div>

				<div class="column is-one-quarter">
					<h4 class="title is-4">Phone 2</h4>
					<b-field label="Type" grouped>
						<MultiSelect
							v-model="formModel.phone2.type"
							searchable
							:options="options.phoneType"
						/>
						<b-checkbox v-model="formModel.phone2.proxy">
							Proxy
						</b-checkbox>
					</b-field>
					<b-field label="Ext" grouped>
						<MultiSelect
							v-model="formModel.phone2.ext"
							searchable
							label="name"
							track-by="id"
							:options="options.phonePrefixes"
						/>
						<b-input
							v-model="formModel.phone2.phoneNo"
							placeholder="Phone No. 1"
						/>
					</b-field>
				</div>
			</div>
			<div v-if="showTypeOfBeneficiary" class="field">
				<b-checkbox
					v-for="vulnerability of options.vulnerabilities"
					v-model="formModel.vulnerabilities[vulnerability.id]"
					:key="vulnerability.id"
				>
					{{ vulnerability.name }}
				</b-checkbox>
			</div>
		</form>
	</div>
</template>

<script>
import { Toast } from "@/utils/UI";
import Validation from "@/mixins/validation";
import BeneficiariesService from "@/services/BeneficiariesService";

export default {
	name: "HouseholdForm",

	mixins: [Validation],

	props: {
		showTypeOfBeneficiary: Boolean,
		detailOfHousehold: Object,
	},

	watch: {
		detailOfHousehold() {
			// TODO Map detailOfHousehold to formModel
		},
	},

	validations: {
		formModel: {},
	},

	data() {
		return {
			formModel: {
				nameLocal: {
					familyName: "",
					firstName: "",
				},
				nameEnglish: {
					familyName: "",
					firstName: "",
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
				// TODO get from API
				residencyStatus: ["Refugee", "IDP", "Resident"],
				// TODO get from API
				referralType: ["Health", "Protection", "Shelter", "Nutrition", "Other"],
				// TODO get from API
				phoneType: ["Landline", "Mobile"],
				// TODO get from API
				phonePrefixes: [
					{ code: "+420", value: "CZ - +420" },
					{ code: "+421", value: "SK - +421" },
				],
				// TODO get from API
				vulnerabilities: [
					{ code: "disabled", value: "Disabled" },
					{ code: "soloParent", value: "Solo Parent" },
					{ code: "lactating", value: "Lactating" },
					{ code: "pregnant", value: "Pregnant" },
					{ code: "chronically", value: "Chronically" },
				],
			},
		};
	},

	mounted() {
		this.fetchNationalCardTypes();
	},

	methods: {
		submit() {
			this.$v.$touch();
			return !this.$v.$invalid;
		},

		async fetchNationalCardTypes() {
			await BeneficiariesService.getListOfTypesOfNationalIds()
				.then((response) => { this.idType = response.data; })
				.catch((e) => {
					Toast(`(National IDs) ${e}`, "is-danger");
				});
		},
	},
};
</script>
