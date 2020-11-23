<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Name"
				:type="getValidationType('name')"
				:message="getValidationMessage('name', 'Required')"
			>
				<b-input
					v-model="formModel.name"
					placeholder="Name"
					:disabled="formDisabled"
					@blur="validateInput('name')"
				/>
			</b-field>

			<b-field
				label="Contact Name"
				:type="getValidationType('contactGivenName')"
				:message="getValidationMessage('contactGivenName', 'Required')"
			>
				<b-input
					v-model="formModel.contactGivenName"
					placeholder="Contact Name"
					:disabled="formDisabled"
					@blur="validateInput('contactGivenName')"
				/>
			</b-field>

			<b-field
				label="Contact Family Name"
				:type="getValidationType('contactFamilyName')"
				:message="getValidationMessage('contactFamilyName', 'Required')"
			>
				<b-input
					v-model="formModel.contactFamilyName"
					placeholder="Contact Family Name"
					:disabled="formDisabled"
					@blur="validateInput('contactFamilyName')"
				/>
			</b-field>

			<b-field
				label="Type"
				:type="getValidationType('type')"
				:message="getValidationMessage('type', 'Required')"
			>
				<MultiSelect
					v-model="formModel.type"
					searchable
					placeholder="Type"
					label="value"
					track-by="code"
					:disabled="formDisabled"
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
							v-model="formModel.phonePrefix"
							searchable
							placeholder="Phone Ext"
							label="name"
							track-by="id"
							:disabled="formDisabled"
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
							v-model="formModel.phoneNumber"
							placeholder="Phone No."
							:disabled="formDisabled"
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
					v-model="formModel.nationalCardType"
					searchable
					placeholder="Contact ID Type"
					label="name"
					track-by="id"
					:disabled="formDisabled"
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
					v-model="formModel.nationalCardNumber"
					expanded
					placeholder="Contact ID Number"
					:disabled="formDisabled"
					@blur="validateInput('nationalCardNumber')"
				/>
			</b-field>

			<locationForm
				ref="locationForm"
				:form-model="formModel"
				:form-disabled="formDisabled"
			/>

			<b-field
				label="Address Number"
				:type="getValidationType('addressNumber')"
				:message="getValidationMessage('addressNumber', 'Required')"
			>
				<b-input
					v-model="formModel.addressNumber"
					placeholder="Address Number"
					:disabled="formDisabled"
					@blur="validateInput('addressNumber')"
				/>
			</b-field>

			<b-field
				label="Address Street"
				:type="getValidationType('addressStreet')"
				:message="getValidationMessage('addressStreet', 'Required')"
			>
				<b-input
					v-model="formModel.addressStreet"
					placeholder="Address Street"
					:disabled="formDisabled"
					@blur="validateInput('addressStreet')"
				/>
			</b-field>

			<b-field
				label="Address Postcode"
				:type="getValidationType('addressPostCode')"
				:message="getValidationMessage('addressPostCode', 'Required')"
			>
				<b-input
					v-model="formModel.addressPostCode"
					placeholder="Address Postcode"
					:disabled="formDisabled"
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
						v-model="formModel.latitude"
						placeholder="Latitude"
						:disabled="formDisabled"
						@blur="validateInput('latitude')"
					/>
				</b-field>
				<b-field
					label="Longitude"
					:type="getValidationType('longitude')"
					:message="getValidationMessage('longitude', 'Required')"
				>
					<b-input
						v-model="formModel.longitude"
						placeholder="Longitude"
						:disabled="formDisabled"
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
import locationForm from "@/components/LocationForm";

export default {
	name: "InstitutionForm",

	components: { locationForm },

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
			adm1Id: {
				required,
			},
			adm2Id: {},
			adm3Id: {},
			adm4Id: {},
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
		};
	},

	mounted() {
		this.fetchTypes();
	},

	methods: {
		submitForm() {
			this.$v.$touch();
			this.$refs.locationForm.submitLocationForm();
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
			this.$v.$reset();
		},

		fetchTypes() {
			InstitutionsService.getListOfInstitutionTypes()
				.then((result) => { this.types = result.data; });
		},
	},
};
</script>
