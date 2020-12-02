<template>
	<form>
		<div class="columns is-multiline">
			<div class="column is-half">
				<h4 class="title is-4">Current Location</h4>
				<LocationForm
					ref="currentLocationForm"
					:form-model="formModel.currentLocation"
					:form-disabled="false"
				/>
			</div>
			<div class="column is-half">
				<h4 class="title is-4">Type Of Location</h4>
				<TypeOfLocationForm
					ref="currentTypeOfLocationForm"
					:form-model="formModel.currentLocation"
				/>
			</div>
		</div>
		<div class="field">
			<b-checkbox v-model="formModel.isCurrentLocationOtherThanAddress">
				Is your current location different than your address?
			</b-checkbox>
		</div>
		<div
			v-if="formModel.isCurrentLocationOtherThanAddress"
			class="columns is-multiline"
		>
			<div class="column is-half">
				<h4 class="title is-4">Resident Location</h4>
				<LocationForm
					ref="residentLocationForm"
					:form-model="formModel"
					:form-disabled="false"
				/>
			</div>
			<div class="column is-half">
				<h4 class="title is-4">Type Of Location</h4>
				<TypeOfLocationForm
					ref="residentTypeOfLocationForm"
					:form-model="formModel.residentLocation"
				/>
			</div>
		</div>
		<div class="columns is-multiline">
			<div class="column is-one-third">
				<h4 class="title is-4">Livelihood</h4>
				<b-field label="Livelihood">
					<MultiSelect
						v-model="formModel.livelihood.livelihood"
						searchable
						label="name"
						track-by="id"
						placeholder="Livelihood"
						:options="options.livelihood"
					/>
				</b-field>
				<b-field label="Income Level">
					<MultiSelect
						v-model="formModel.livelihood.incomeLevel"
						searchable
						label="value"
						track-by="id"
						placeholder="Income Level"
						:options="options.incomeLevel"
					/>
				</b-field>
				<b-field label="Debt Level">
					<b-numberinput
						v-model="formModel.livelihood.debtLevel"
					/>
				</b-field>
				<b-field label="Assets">
					<MultiSelect
						v-model="formModel.livelihood.assets"
						searchable
						multiple
						placeholder="Assets"
						:options="options.assets"
					/>
				</b-field>
				<b-field label="Food Consumption Score">
					<b-numberinput
						v-model="formModel.livelihood.foodConsumptionScore"
					/>
				</b-field>
				<b-field label="Coping Strategies Index">
					<b-numberinput
						v-model="formModel.livelihood.copingStrategiesIndex"
					/>
				</b-field>
			</div>
			<div class="column is-one-third">
				<h4 class="title is-4">External Support</h4>
				<b-field label="External Support Received Type">
					<MultiSelect
						v-model="formModel.externalSupport.externalSupportReceivedType"
						searchable
						multiple
						label="value"
						track-by="id"
						placeholder="External Support Received Type"
						:options="options.externalSupportReceivedType"
					/>
				</b-field>
				<b-field label="Support Date Received">
					<b-datepicker
						v-model="formModel.externalSupport.supportDateReceived"
						show-week-number
						locale="en-US"
						placeholder="Click to select..."
						icon="calendar-day"
						trap-focus
					/>
				</b-field>
				<b-field label="Support Organization">
					<b-input
						v-model="formModel.externalSupport.supportOrganization"
					/>
				</b-field>
			</div>
			<div class="column is-one-third">
				<h4 class="title is-4">Country Specific Options</h4>
				<b-field label="ID Poor No">
					<b-input
						v-model="formModel.countrySpecificOptions.idPoorNo"
					/>
				</b-field>
				<b-field label="Equity Card No">
					<b-input
						v-model="formModel.countrySpecificOptions.equityCardNo"
					/>
				</b-field>
				<b-field label="Fields">
					<b-input
						v-model="formModel.countrySpecificOptions.fields"
					/>
				</b-field>
			</div>
		</div>
		<h4 class="title is-4">Household Status</h4>
		<b-field label="Shelter Type">
			<MultiSelect
				v-model="formModel.shelterType"
				searchable
				placeholder="Shelter Type"
				:options="options.shelterType"
			/>
		</b-field>
		<h4 class="title is-4">Notes</h4>
		<b-field>
			<b-input
				v-model="formModel.notes"
				type="textarea"
			/>
		</b-field>
	</form>
</template>

<script>
import LocationForm from "@/components/LocationForm";
import TypeOfLocationForm from "@/components/Beneficiaries/Household/TypeOfLocationForm";
import Validation from "@/mixins/validation";

const locationModel = {
	adm1Id: "",
	adm2Id: "",
	adm3Id: "",
	adm4Id: "",
	typeOfLocation: "",
	camp: "",
	campName: "",
	tentNumber: "",
	addressNumber: "",
	addressStreet: "",
	addressPostcode: "",
};

export default {
	name: "Household",

	mixins: [Validation],

	components: {
		LocationForm,
		TypeOfLocationForm,
	},

	validations: {
		formModel: {},
	},

	data() {
		return {
			formModel: {
				currentLocation: {
					...locationModel,
				},
				isCurrentLocationOtherThanAddress: false,
				residentLocation: {
					...locationModel,
				},
				livelihood: {
					livelihood: "",
					incomeLevel: "",
					debtLevel: 0,
					assets: "",
					foodConsumptionScore: 0,
					copingStrategiesIndex: 0,
				},
				externalSupport: {
					externalSupportReceivedType: "",
					supportDateReceived: new Date(),
					supportOrganization: "",
				},
				countrySpecificOptions: {
					idPoorNo: "",
					equityCardNo: "",
					fields: "",
				},
				shelterType: "",
				notes: "",
			},
			options: {
				livelihood: [
					{
						id: "agricultureLivestock",
						name: "Agriculture - Livestock",
					},
					{
						id: "agricultureCrops",
						name: "Agriculture - Crops",
					},
					{
						id: "agricultureFishing",
						name: "Agriculture - Fishing",
					},
					{
						id: "agricultureOther",
						name: "Agriculture - Other",
					},
					{
						id: "mining",
						name: "Mining",
					},
					{
						id: "construction",
						name: "Construction",
					},
					{
						id: "manufacturing",
						name: "Manufacturing",
					},
					{
						id: "retail",
						name: "Retail",
					},
					{
						id: "transportation",
						name: "Transportation",
					},
					{
						id: "education",
						name: "Education",
					},
					{
						id: "healthCare",
						name: "Health Care",
					},
					{
						id: "hospitalityAndTourism",
						name: "Hospitality And Tourism",
					},
					{
						id: "legalServices",
						name: "Legal Services",
					},
					{
						id: "homeDuties",
						name: "Home Duties",
					},
					{
						id: "religiousService",
						name: "Religious Service",
					},
					{
						id: "itAndTelecommunications",
						name: "IT And Telecommunications",
					},
					{
						id: "financeAndInsurance",
						name: "Finance And Insurance",
					},
					{
						id: "manualLabour",
						name: "Manual Labour",
					},
					{
						id: "ngoAndNonProfit",
						name: "NGO And Non Profit",
					},
					{
						id: "militaryOrPolice",
						name: "Military Or Police",
					},
					{
						id: "governmentAndPublicEnterprise",
						name: "Government And Public Enterprise",
					},
					{
						id: "garmentIndustry",
						name: "Garment Industry",
					},
					{
						id: "securityIndustry",
						name: "Security Industry",
					},
					{
						id: "serviceIndustryAndOtherProfessionals",
						name: "Service Industry And Other Professionals",
					},
					{
						id: "other",
						name: "Other",
					},
				],
				incomeLevel: [
					{
						code: 0,
						value: "Very Low (Income < 100 USD)",
					},
					{
						code: 1,
						value: "Low (100 USD < Income < 100 USD)",
					},
					{
						code: 2,
						value: "Average (150 USD < Income < 250 USD)",
					},
					{
						code: 3,
						value: "High (250 USD < Income < 300 USD)",
					},
					{
						code: 4,
						value: "Very High (300 USD < Income)",
					},
				],
				assets: [
					"AC", "Agricultural Land", "Car", "Flatscreen TV", "Livestock",
					"Motorbike", "Washing Machine",
				],
				externalSupportReceivedType: [
					{
						code: 0,
						value: "MPCA",
					},
					{
						code: 1,
						value: "Cash For Work",
					},
					{
						code: 2,
						value: "Food Kit",
					},
					{
						code: 3,
						value: "Food Voucher",
					},
					{
						code: 4,
						value: "Hygiene Kit",
					},
					{
						code: 5,
						value: "Shelter Kit",
					},
					{
						code: 6,
						value: "Shelter Reconstruction Support",
					},
					{
						code: 7,
						value: "Non Food Items",
					},
					{
						code: 8,
						value: "Livelihoods Support",
					},
					{
						code: 9,
						value: "Vocational Training",
					},
					{
						code: 10,
						value: "None",
					},
					{
						code: 11,
						value: "Other",
					},
				],
				shelterType: [
					"Tent", "Makeshift Shelter", "Transitional Shelter",
					"House/Apartment - Severely Damaged",
					"House/Apartment - Moderately Damaged",
					"House/Apartment - Good Condition",
					"Room Or Space In Public Building",
					"Room Or Space In Unfinished Building",
					"Other",
				],
			},
		};
	},

	methods: {
		submit() {
			this.$v.$touch();
			return !this.$v.$invalid;
		},
	},
};
</script>
