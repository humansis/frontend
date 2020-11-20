<template>
	<form>
		<div class="columns is-multiline">
			<div class="column is-half">
				<h4 class="title is-4">Current Location</h4>
				<LocationFormComponent
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
				<LocationFormComponent
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
				<b-field
					label="Livelihood"
				>
					<MultiSelect
						v-model="formModel.livelihood.livelihood"
						searchable
						placeholder="Livelihood"
						:options="options.livelihood"
					/>
				</b-field>
				<b-field
					label="Income Level"
				>
					<MultiSelect
						v-model="formModel.livelihood.incomeLevel"
						searchable
						placeholder="Income Level"
						:options="options.incomeLevel"
					/>
				</b-field>
				<b-field
					label="Debt Level"
				>
					<b-numberinput
						v-model="formModel.livelihood.debtLevel"
					/>
				</b-field>
				<b-field
					label="Assets"
				>
					<MultiSelect
						v-model="formModel.livelihood.assets"
						searchable
						multiple
						placeholder="Assets"
						:options="options.assets"
					/>
				</b-field>
				<b-field
					label="Food Consumption Score"
				>
					<b-numberinput
						v-model="formModel.livelihood.foodConsumptionScore"
					/>
				</b-field>
				<b-field
					label="Coping Strategies Index"
				>
					<b-numberinput
						v-model="formModel.livelihood.copingStrategiesIndex"
					/>
				</b-field>
			</div>
			<div class="column is-one-third">
				<h4 class="title is-4">External Support</h4>
				<b-field
					label="External Support Received Type"
				>
					<MultiSelect
						v-model="formModel.externalSupport.externalSupportReceivedType"
						searchable
						multiple
						placeholder="External Support Received Type"
						:options="options.externalSupportReceivedType"
					/>
				</b-field>
				<b-field
					label="Support Date Received"
				>
					<b-datepicker
						v-model="formModel.externalSupport.supportDateReceived"
						show-week-number
						locale="en-US"
						placeholder="Click to select..."
						icon="calendar-day"
						trap-focus
					/>
				</b-field>
				<b-field
					label="Support Organisation"
				>
					<b-input
						v-model="formModel.externalSupport.supportOrganisation"
					/>
				</b-field>
			</div>
			<div class="column is-one-third">
				<h4 class="title is-4">Country Specific Options</h4>
				<b-field
					label="ID Poor No"
				>
					<b-input
						v-model="formModel.countrySpecificOptions.idPoorNo"
					/>
				</b-field>
				<b-field
					label="Equity Card No"
				>
					<b-input
						v-model="formModel.countrySpecificOptions.equityCardNo"
					/>
				</b-field>
				<b-field
					label="Fieldes"
				>
					<b-input
						v-model="formModel.countrySpecificOptions.fieldes"
					/>
				</b-field>
			</div>
		</div>
		<h4 class="title is-4">Household Status</h4>
		<b-field
			label="Shelter Type"
		>
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
import LocationFormComponent from "@/components/LocationFormComponent";
import TypeOfLocationForm from "@/components/Beneficiaries/Household/TypeOfLocationForm";

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

	components: {
		LocationFormComponent,
		TypeOfLocationForm,
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
					supportOrganisation: "",
				},
				countrySpecificOptions: {
					idPoorNo: "",
					equityCardNo: "",
					fieldes: "",
				},
				shelterType: "",
				notes: "",
			},
			options: {
				livelihood: [
					"Daily Labour", "Farming - Argiculture", "Farming - Livestock",
					"Government", "Home Duties", "Trading", "Own Business", "Textiles",
				],
				incomeLevel: [
					"Very Low (Income < 100 USD)", "Low (100 USD < Income < 100 USD)",
					"Average (150 USD < Income < 250 USD)",
					"High (250 USD < Income < 300 USD)",
					"Very High (300 USD < Income)",
				],
				assets: [
					"AC", "Agricultural Land", "Car", "Flatscreen TV", "Livestock",
					"Motorbike", "Washing Machine",
				],
				externalSupportReceivedType: [
					"MPCA", "Cash For Work", "Food Kit", "Food Voucher", "Hygiene Kit",
					"Shelter Kit", "Shelter Reconstruction Support", "Non Food Items",
					"Livelihoods Support", "Vocational Training", "None", "Other",
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
};
</script>
