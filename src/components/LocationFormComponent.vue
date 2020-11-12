<template>
	<section>

		<b-field
			label="Province"
			:type="getValidationType('adm1Id')"
			:message="getValidationMessage('adm1Id', 'Province is Required')"
		>
			<MultiSelect
				v-model="formModel.adm1Id"
				searchable
				placeholder="Province"
				label="name"
				track-by="id"
				:disabled="formDisabled"
				:options="provinces"
				@select="onProvinceSelect"
			/>
		</b-field>

		<b-field
			label="District"
			:type="getValidationType('adm2Id')"
		>
			<MultiSelect
				v-model="formModel.adm2Id"
				searchable
				placeholder="District"
				label="name"
				track-by="id"
				:disabled="formDisabled"
				:options="districts"
				@select="onDistrictSelect"
			/>
		</b-field>

		<b-field
			label="Commune"
			:type="getValidationType('adm3Id')"
		>
			<MultiSelect
				v-model="formModel.adm3Id"
				searchable
				placeholder="Commune"
				label="name"
				track-by="id"
				:disabled="formDisabled"
				:options="communes"
				@select="onCommuneSelect"
			/>
		</b-field>

		<b-field
			label="Village"
			:type="getValidationType('adm4Id')"
		>
			<MultiSelect
				v-model="formModel.adm4Id"
				searchable
				placeholder="Village"
				label="name"
				track-by="id"
				:disabled="formDisabled"
				:options="villages"
				@select="validateInput('adm4Id')"
			/>
		</b-field>
	</section>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import LocationsService from "@/services/LocationsService";

export default {
	name: "LocationFormComponent",

	props: {
		formModel: Object,
		formDisabled: Boolean,
	},

	data() {
		return {
			provinces: [],
			districts: [],
			communes: [],
			villages: [],
		};
	},

	validations: {
		formModel: {
			adm1Id: {
				required,
			},
			adm2Id: {},
			adm3Id: {},
			adm4Id: {},
		},
	},

	mounted() {
		this.fetchProvinces();
	},

	methods: {
		submitLocationForm() {
			this.$v.$touch();
		},

		onProvinceSelect({ id }) {
			this.validateInput("adm1Id");
			this.fetchDistricts(id);
		},

		onDistrictSelect({ id }) {
			this.validateInput("adm2Id");
			this.fetchCommunes(id);
		},

		onCommuneSelect({ id }) {
			this.validateInput("adm3Id");
			this.fetchVillages(id);
		},

		fetchProvinces() {
			LocationsService.getListOfAdm1()
				.then((result) => { this.provinces = result.data; });
		},

		fetchDistricts(adm1Id) {
			LocationsService.getListOfAdm2(adm1Id)
				.then((result) => { this.districts = result.data; });
		},

		fetchCommunes(adm2Id) {
			LocationsService.getListOfAdm3(adm2Id)
				.then((result) => { this.communes = result.data; });
		},

		fetchVillages(adm3Id) {
			LocationsService.getListOfAdm4(adm3Id)
				.then((result) => { this.villages = result.data; });
		},

		validateInput(fieldName) {
			this.$v.formModel[fieldName].$touch();
		},

		getValidationMessage(fieldName, message) {
			return this.$v.formModel[fieldName].$error ? message : "";
		},

		getValidationType(fieldName) {
			let result = "";
			if (this.$v.formModel[fieldName].$dirty) {
				result = this.$v.formModel[fieldName].$error ? "is-danger" : "is-success";
			}
			return result;
		},
	},
};
</script>
