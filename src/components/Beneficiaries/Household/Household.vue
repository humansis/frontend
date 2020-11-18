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
			<b-checkbox>Is your current location different than your address?</b-checkbox>
		</div>
		<div class="columns is-multiline">
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
			</div>
			<div class="column is-one-third">
				<h4 class="title is-4">External Support</h4>
			</div>
			<div class="column is-one-third">
				<h4 class="title is-4">Country Specific Options</h4>
			</div>
		</div>
		<h4 class="title is-4">Household Status</h4>
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
	createCamp: false,
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

	mounted() {
		console.log(this.formModel);
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
			},
			options: {
				typeOfLocation: ["Camp", "Residence", "Temporary Settlement"],
			},
		};
	},
};
</script>
