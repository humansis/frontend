<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Institution Name"
				:type="getValidationType('name')"
				:message="getValidationMessage('name', 'Required')"
			>
				<b-input
					:disabled="formDisabled"
					@blur="validateInput('name')"
					v-model="formModel.name"
				/>
			</b-field>

			<b-field
				label="Longitude"
				:type="getValidationType('longitude')"
				:message="getValidationMessage('longitude', 'Required')"
			>
				<b-input
					:disabled="formDisabled"
					v-model="formModel.longitude"
					@blur="validateInput('longitude')"
				/>
			</b-field>

			<b-field
				label="Latitude"
				:type="getValidationType('latitude')"
				:message="getValidationMessage('latitude', 'Required')"
			>
				<b-input
					:disabled="formDisabled"
					v-model="formModel.latitude"
					@blur="validateInput('latitude')"
				/>
			</b-field>

			<b-field
				label="Contact First Name"
				:type="getValidationType('contactGivenName')"
				:message="getValidationMessage('contactGivenName', 'Required')"
			>
				<b-input
					:disabled="formDisabled"
					v-model="formModel.contactGivenName"
					@blur="validateInput('contactGivenName')"
				/>
			</b-field>

			<b-field
				label="Contact Last Name"
				:type="getValidationType('contactFamilyName')"
				:message="getValidationMessage('contactFamilyName', 'Required')"
			>
				<b-input
					:disabled="formDisabled"
					v-model="formModel.contactFamilyName"
					@blur="validateInput('contactFamilyName')"
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
							placeholder="Select prefix"
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
							placeholder="PhoneNumber"
							v-model="formModel.phoneNumber"
							@blur="validateInput('phoneNumber')"
						/>
					</b-field>
				</b-field>
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
					placeholder="Select type"
					label="name"
					track-by="id"
					:options="types"
					@select="validateInput('type')"
				/>
			</b-field>

			<b-field
				label="Address Street"
				:type="getValidationType('addressStreet')"
				:message="getValidationMessage('addressStreet', 'Required')"
			>
				<b-input
					:disabled="formDisabled"
					v-model="formModel.addressStreet"
					@blur="validateInput('addressStreet')"
				/>
			</b-field>

			<b-field
				label="Address Number"
				:type="getValidationType('addressNumber')"
				:message="getValidationMessage('addressNumber', 'Required')"
			>
				<b-input
					:disabled="formDisabled"
					v-model="formModel.addressNumber"
					@blur="validateInput('addressNumber')"
				/>
			</b-field>

			<b-field
				label="Address Post Code"
				:type="getValidationType('addressPostCode')"
				:message="getValidationMessage('addressPostCode', 'Required')"
			>
				<b-input
					:disabled="formDisabled"
					v-model="formModel.addressPostCode"
					@blur="validateInput('addressPostCode')"
				/>
			</b-field>

			<b-field
				label="Address Adm ID 1"
				:type="getValidationType('addressAdm1Id')"
				:message="getValidationMessage('addressAdm1Id', 'Required')"
			>
				<b-input
					:disabled="formDisabled"
					v-model="formModel.addressAdm1Id"
					@blur="validateInput('addressAdm1Id')"
				/>
			</b-field>

			<b-field
				label="Address Adm ID 2"
				:type="getValidationType('addressAdm2Id')"
			>
				<b-input
					:disabled="formDisabled"
					v-model="formModel.addressAdm2Id"
					@blur="validateInput('addressAdm2Id')"
				/>
			</b-field>

			<b-field
				label="Address Adm ID 3"
				:type="getValidationType('addressAdm3Id')"
			>
				<b-input
					:disabled="formDisabled"
					v-model="formModel.addressAdm3Id"
					@blur="validateInput('addressAdm3Id')"
				/>
			</b-field>

			<b-field
				label="Address Adm ID 4"
				:type="getValidationType('addressAdm4Id')"
			>
				<b-input
					:disabled="formDisabled"
					v-model="formModel.addressAdm4Id"
					@blur="validateInput('addressAdm4Id')"
				/>
			</b-field>

			<b-field grouped
				label="National Card"
			>
				<b-field
					:type="getValidationType('nationalCardType')"
					:message="getValidationMessage('nationalCardType', 'Required')"
				>
					<MultiSelect
						:disabled="formDisabled"
						v-model="formModel.nationalCardType"
						searchable
						placeholder="Select type"
						label="name"
						track-by="id"
						:options="nationalCardTypes"
						@select="validateInput('nationalCardType')"
					/>
				</b-field>
				<b-field
					:type="getValidationType('nationalCardNumber')"
					:message="getValidationMessage('nationalCardNumber', 'Required number')"
				>
					<b-input
						expanded
						:disabled="formDisabled"
						v-model="formModel.nationalCardNumber"
						@blur="validateInput('nationalCardNumber')"
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
			// TODO get from API
			types: [
				{
					id: "health",
					name: "Health",
				},
				{
					id: "school",
					name: "School",
				},
				{
					id: "community_center",
					name: "Community Center",
				},
				{
					id: "government",
					name: "Government",
				},
				{
					id: "production",
					name: "Production",
				},
				{
					id: "commerce",
					name: "Commerce",
				},
			],
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
	},

	mounted() {
		if (this.formDisabled) {
			this.$v.reset();
		}
	},
};
</script>
