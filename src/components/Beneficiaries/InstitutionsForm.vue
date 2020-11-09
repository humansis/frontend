<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Name"
				:type="getValidationType('name')"
				:message="getValidationMessage('name', 'Required')"
			>
				<b-input
					placeholder="Name"
					:disabled="formDisabled"
					@blur="validateInput('name')"
					v-model="formModel.name"
				/>
			</b-field>

			<b-field
				label="Contact Name"
				:type="getValidationType('contactGivenName')"
				:message="getValidationMessage('contactGivenName', 'Required')"
			>
				<b-input
					placeholder="Contact Name"
					:disabled="formDisabled"
					v-model="formModel.contactGivenName"
					@blur="validateInput('contactGivenName')"
				/>
			</b-field>

			<b-field
				label="Contact Family Name"
				:type="getValidationType('contactFamilyName')"
				:message="getValidationMessage('contactFamilyName', 'Required')"
			>
				<b-input
					placeholder="Contact Family Name"
					:disabled="formDisabled"
					v-model="formModel.contactFamilyName"
					@blur="validateInput('contactFamilyName')"
				/>
			</b-field>

			<b-field
				label="Type"
				:type="getValidationType('type')"
				:message="getValidationMessage('type', 'Required')"
			>
				<MultiSelect
					:disabled="formDisabled"
					v-model="formModel.type"
					searchable
					placeholder="Type"
					label="value"
					track-by="code"
					:options="types"
					@select="validateInput('type')"
				/>
			</b-field>

			<b-field
				label="Phone"
			>
				<b-field grouped>
					<b-field
						:type="getValidationType('phonePrefix')"
						:message="getValidationMessage('phonePrefix', 'Required')"
					>
						<MultiSelect
							:disabled="formDisabled"
							v-model="formModel.phonePrefix"
							searchable
							placeholder="Phone Ext"
							label="name"
							track-by="id"
							:options="phonePrefixes"
							@select="validateInput('phonePrefix')"
						/>
					</b-field>
					<b-field
						expanded
						:type="getValidationType('phoneNumber')"
						:message="getValidationMessage('phoneNumber', 'Required number')"
					>
						<b-input
							:disabled="formDisabled"
							placeholder="Phone No."
							v-model="formModel.phoneNumber"
							@blur="validateInput('phoneNumber')"
						/>
					</b-field>
				</b-field>
			</b-field>

			<b-field
				label="Contact ID Type"
				:type="getValidationType('nationalCardType')"
				:message="getValidationMessage('nationalCardType', 'Required')"
			>
				<MultiSelect
					:disabled="formDisabled"
					v-model="formModel.nationalCardType"
					searchable
					placeholder="Contact ID Type"
					label="name"
					track-by="id"
					:options="nationalCardTypes"
					@select="validateInput('nationalCardType')"
				/>
			</b-field>
			<b-field
				label="Contact ID Number"
				:type="getValidationType('nationalCardNumber')"
				:message="getValidationMessage('nationalCardNumber', 'Required number')"
			>
				<b-input
					expanded
					placeholder="Contact ID Number"
					:disabled="formDisabled"
					v-model="formModel.nationalCardNumber"
					@blur="validateInput('nationalCardNumber')"
				/>
			</b-field>

			<b-field
				label="Province"
				:type="getValidationType('addressAdm1Id')"
				:message="getValidationMessage('addressAdm1Id', 'Required')"
			>
				<MultiSelect
					:disabled="formDisabled"
					v-model="formModel.addressAdm1Id"
					searchable
					placeholder="Province"
					label="name"
					track-by="id"
					:options="provinces"
					@select="onProvinceSelect"
				/>
			</b-field>

			<b-field
				label="District"
				:type="getValidationType('addressAdm2Id')"
			>
				<MultiSelect
					:disabled="formDisabled"
					v-model="formModel.addressAdm2Id"
					searchable
					placeholder="District"
					label="name"
					track-by="id"
					:options="districts"
					@select="onDistrictSelect"
				/>
			</b-field>

			<b-field
				label="Commune"
				:type="getValidationType('addressAdm3Id')"
			>
				<MultiSelect
					:disabled="formDisabled"
					v-model="formModel.addressAdm3Id"
					searchable
					placeholder="Commune"
					label="name"
					track-by="id"
					:options="communes"
					@select="onCommuneSelect"
				/>
			</b-field>

			<b-field
				label="Village"
				:type="getValidationType('addressAdm4Id')"
			>
				<MultiSelect
					:disabled="formDisabled"
					v-model="formModel.addressAdm3Id"
					searchable
					placeholder="Village"
					label="name"
					track-by="id"
					:options="villages"
					@select="validateInput('addressAdm4Id')"
				/>
			</b-field>

			<b-field
				label="Address Number"
				:type="getValidationType('addressNumber')"
				:message="getValidationMessage('addressNumber', 'Required')"
			>
				<b-input
					placeholder="Address Number"
					:disabled="formDisabled"
					v-model="formModel.addressNumber"
					@blur="validateInput('addressNumber')"
				/>
			</b-field>

			<b-field
				label="Address Street"
				:type="getValidationType('addressStreet')"
				:message="getValidationMessage('addressStreet', 'Required')"
			>
				<b-input
					placeholder="Address Street"
					:disabled="formDisabled"
					v-model="formModel.addressStreet"
					@blur="validateInput('addressStreet')"
				/>
			</b-field>

			<b-field
				label="Address Postcode"
				:type="getValidationType('addressPostCode')"
				:message="getValidationMessage('addressPostCode', 'Required')"
			>
				<b-input
					placeholder="Address Postcode"
					:disabled="formDisabled"
					v-model="formModel.addressPostCode"
					@blur="validateInput('addressPostCode')"
				/>
			</b-field>

			<b-field grouped>
				<b-field
					label="Latitude"
					:type="getValidationType('latitude')"
					:message="getValidationMessage('latitude', 'Required')"
				>
					<b-input
						placeholder="Latitude"
						:disabled="formDisabled"
						v-model="formModel.latitude"
						@blur="validateInput('latitude')"
					/>
				</b-field>
				<b-field
					label="Longitude"
					:type="getValidationType('longitude')"
					:message="getValidationMessage('longitude', 'Required')"
				>
					<b-input
						placeholder="Longitude"
						:disabled="formDisabled"
						v-model="formModel.longitude"
						@blur="validateInput('longitude')"
					/>
				</b-field>
			</b-field>
		</section>

		<footer class="modal-card-foot">
			<button v-if="closeButton" class="button" type="button" @click="closeForm">
				Close
			</button>
			<b-button
				v-if="!formDisabled"
				tag="input"
				class="is-success"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
import { required, numeric } from "vuelidate/lib/validators";
import InstitutionsService from "@/services/InstitutionsService";
import LocationsService from "@/services/LocationsService";

export default {
	name: "InstitutionForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			name: {
				required,
			},
			longitude: {
				required,
			},
			latitude: {
				required,
			},
			contactGivenName: {
				required,
			},
			contactFamilyName: {
				required,
			},
			phonePrefix: {
				required,
			},
			phoneNumber: {
				required,
				numeric,
			},
			type: {
				required,
			},
			addressStreet: {
				required,
			},
			addressNumber: {
				required,
			},
			addressPostCode: {
				required,
			},
			nationalCardNumber: {
				required,
				numeric,
			},
			nationalCardType: {
				required,
			},
			addressAdm1Id: {
				required,
			},
			addressAdm2Id: {
			},
			addressAdm3Id: {
			},
			addressAdm4Id: {
			},
		},
	},

	data() {
		return {
			types: [],
			// TODO get from API
			nationalCardTypes: [
				{
					id: "national_id",
					name: "National ID",
				},
				{
					id: "passport",
					name: "Passport",
				},
			],
			// TODO get from API
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
			provinces: [],
			districts: [],
			communes: [],
			villages: [],
		};
	},

	methods: {
		submitForm() {
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.$v.$reset();
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

		closeForm() {
			this.$emit("formClosed");
		},

		onProvinceSelect({ id }) {
			this.validateInput("addressAdm1Id");
			this.fetchDistricts(id);
		},

		onDistrictSelect({ id }) {
			this.validateInput("addressAdm2Id");
			this.fetchCommunes(id);
		},

		onCommuneSelect({ id }) {
			this.validateInput("addressAdm3Id");
			this.fetchVillages(id);
		},

		fetchTypes() {
			InstitutionsService.getListOfInstitutionTypes()
				.then((result) => { this.types = result.data; });
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

		resetForm() {
			if (this.formDisabled) {
				this.$v.$reset();
			}
		},
	},

	mounted() {
		this.fetchTypes();
		this.fetchProvinces();
		this.resetForm();
	},
};
</script>
