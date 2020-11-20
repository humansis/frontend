<template>
	<div>
		<form>
			<div class="columns is-multiline">
				<div class="column is-one-quarter">
					<h4 class="title is-4">Name (Local)</h4>
					<b-field
						label="Family Name"
					>
						<b-input
							v-model="formModel.nameLocal.familyName"
							placeholder="Family Name"
						/>
					</b-field>
					<b-field
						label="First Name"
					>
						<b-input
							v-model="formModel.nameLocal.firstName"
							placeholder="First Name"
						/>
					</b-field>
				</div>
				<div class="column is-one-quarter">
					<h4 class="title is-4">Name (English)</h4>
					<b-field
						label="Family Name"
					>
						<b-input
							v-model="formModel.nameEnglish.familyName"
							placeholder="Family Name"
						/>
					</b-field>
					<b-field
						label="First Name"
					>
						<b-input
							v-model="formModel.nameEnglish.firstName"
							placeholder="First Name"
						/>
					</b-field>
				</div>
				<div class="column is-one-quarter">
					<h4 class="title is-4">Personal Information</h4>
					<b-field
						label="Gender"
					>
						<MultiSelect
							v-model="formModel.personalInformation.gender"
							searchable
							placeholder="Gender"
							:options="options.gender"
						/>
					</b-field>
					<b-field
						label="Date Of Birth"
					>
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
					<b-field
						label="ID Type"
					>
						<MultiSelect
							v-model="formModel.id.idType"
							searchable
							placeholder="ID Type"
							:options="options.idType"
						/>
					</b-field>
					<b-field
						label="ID Number"
					>
						<b-input
							v-model="formModel.id.idNumber"
							placeholder="ID Number"
						/>
					</b-field>
				</div>
				<div class="column is-one-quarter">
					<h4 class="title is-4">Residency</h4>
					<b-field
						label="Residency Status"
					>
						<MultiSelect
							v-model="formModel.residency.residencyStatus"
							searchable
							placeholder="Residency Status"
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
					<b-field
						v-if="formModel.addAReferral"
						label="Referral Type"
					>
						<MultiSelect
							v-model="formModel.referral.referralType"
							searchable
							placeholder="Referral Type"
							:options="options.referralType"
						/>
					</b-field>
					<b-field
						v-if="formModel.addAReferral"
						label="Comment"
					>
						<b-input
							v-model="formModel.referral.comment"
							placeholder="Comment"
						/>
					</b-field>
				</div>
				<div class="column is-one-quarter">
					<h4 class="title is-4">Phone 1</h4>
					<b-field
						label="Type"
						grouped
					>
						<MultiSelect
							v-model="formModel.phone1.type"
							searchable
							placeholder="Type"
							:options="options.phoneType"
						/>
						<b-checkbox v-model="formModel.phone1.proxy">
							Proxy
						</b-checkbox>
					</b-field>
					<b-field
						label="Ext"
						grouped
					>
						<MultiSelect
							v-model="formModel.phone1.ext"
							searchable
							placeholder="Ext"
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
					<b-field
						label="Type"
						grouped
					>
						<MultiSelect
							v-model="formModel.phone2.type"
							searchable
							placeholder="Type"
							:options="options.phoneType"
						/>
						<b-checkbox v-model="formModel.phone2.proxy">
							Proxy
						</b-checkbox>
					</b-field>
					<b-field
						label="Ext"
						grouped
					>
						<MultiSelect
							v-model="formModel.phone2.ext"
							searchable
							placeholder="Ext"
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
			<div class="field">
				<b-checkbox
					v-for="typeOfBeneficiary of options.typeOfBeneficiary"
					:key="typeOfBeneficiary"
					v-model="formModel.typeOfBeneficiary"
				>
					{{ typeOfBeneficiary }}
				</b-checkbox>
			</div>
		</form>
	</div>
</template>

<script>

export default {
	name: "HouseholdHead",

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
				typeOfBeneficiary: "",
			},
			options: {
				gender: ["Male", "Female"],
				idType: [
					"Passport", "National ID", "Driver's License", "Family Registration",
					"Birth Certificate", "Other",
				],
				residencyStatus: ["Refugee", "IDP", "Resident"],
				referralType: ["Health", "Protection", "Shelter", "Nutrition", "Other"],
				phoneType: ["Landline", "Mobile"],
				phonePrefixes: [
					{
						id: "+420",
						name: "CZ - +420",
					},
					{
						id: "+421",
						name: "SK - +421",
					},
				],
				typeOfBeneficiary: [
					"Disabled", "Solo Parent", "Lactating", "Pregnant", "Nutrition Issues",
				],
			},
		};
	},
};
</script>
