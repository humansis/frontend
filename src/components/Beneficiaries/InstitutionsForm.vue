<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Name"
				:type="validateType('name')"
				:message="validateMsg('name', 'Required')"
			>
				<b-input
					v-model="formModel.name"
					:disabled="formDisabled"
					@blur="validate('name')"
				/>
			</b-field>

			<b-field
				label="Contact Name"
				:type="validateType('contactGivenName')"
				:message="validateMsg('contactGivenName', 'Required')"
			>
				<b-input
					v-model="formModel.contactGivenName"
					:disabled="formDisabled"
					@blur="validate('contactGivenName')"
				/>
			</b-field>

			<b-field
				label="Contact Family Name"
				:type="validateType('contactFamilyName')"
				:message="validateMsg('contactFamilyName', 'Required')"
			>
				<b-input
					v-model="formModel.contactFamilyName"
					:disabled="formDisabled"
					@blur="validate('contactFamilyName')"
				/>
			</b-field>

			<b-field
				label="Type"
				:type="validateType('type')"
				:message="validateMsg('type', 'Required')"
			>
				<MultiSelect
					v-model="formModel.type"
					searchable
					label="value"
					track-by="code"
					:disabled="formDisabled"
					:options="types"
					@select="validate('type')"
				/>
			</b-field>

			<b-field
				label="Phone"
			>
				<b-field grouped>
					<b-field
						:type="validateType('phonePrefix')"
						:message="validateMsg('phonePrefix', 'Required')"
					>
						<MultiSelect
							v-model="formModel.phonePrefix"
							searchable
							placeholder="Phone Ext"
							label="name"
							track-by="id"
							:disabled="formDisabled"
							:options="phonePrefixes"
							@select="validate('phonePrefix')"
						/>
					</b-field>

					<b-field
						expanded
						:type="validateType('phoneNumber')"
						:message="validateMsg('phoneNumber', 'Required number')"
					>
						<b-input
							v-model="formModel.phoneNumber"
							placeholder="Phone No."
							:disabled="formDisabled"
							@blur="validate('phoneNumber')"
						/>
					</b-field>
				</b-field>
			</b-field>

			<b-field
				label="Contact ID Type"
				:type="validateType('nationalCardType')"
				:message="validateMsg('nationalCardType', 'Required')"
			>
				<MultiSelect
					v-model="formModel.nationalCardType"
					searchable
					placeholder="Contact ID Type"
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="nationalCardTypes"
					@select="validate('nationalCardType')"
				/>
			</b-field>
			<b-field
				label="Contact ID Number"
				:type="validateType('nationalCardNumber')"
				:message="validateMsg('nationalCardNumber', 'Required number')"
			>
				<b-input
					v-model="formModel.nationalCardNumber"
					expanded
					placeholder="Contact ID Number"
					:disabled="formDisabled"
					@blur="validate('nationalCardNumber')"
				/>
			</b-field>

			<locationForm
				ref="locationForm"
				:form-model="formModel"
				:form-disabled="formDisabled"
			/>

			<b-field
				label="Address Number"
				:type="validateType('addressNumber')"
				:message="validateMsg('addressNumber', 'Required')"
			>
				<b-input
					v-model="formModel.addressNumber"
					placeholder="Address Number"
					:disabled="formDisabled"
					@blur="validate('addressNumber')"
				/>
			</b-field>

			<b-field
				label="Address Street"
				:type="validateType('addressStreet')"
				:message="validateMsg('addressStreet', 'Required')"
			>
				<b-input
					v-model="formModel.addressStreet"
					placeholder="Address Street"
					:disabled="formDisabled"
					@blur="validate('addressStreet')"
				/>
			</b-field>

			<b-field
				label="Address Postcode"
				:type="validateType('addressPostCode')"
				:message="validateMsg('addressPostCode', 'Required')"
			>
				<b-input
					v-model="formModel.addressPostCode"
					placeholder="Address Postcode"
					:disabled="formDisabled"
					@blur="validate('addressPostCode')"
				/>
			</b-field>

			<b-field grouped>
				<b-field
					label="Latitude"
					:type="validateType('latitude')"
					:message="validateMsg('latitude', 'Required')"
				>
					<b-input
						v-model="formModel.latitude"
						placeholder="Latitude"
						:disabled="formDisabled"
						@blur="validate('latitude')"
					/>
				</b-field>
				<b-field
					label="Longitude"
					:type="validateType('longitude')"
					:message="validateMsg('longitude', 'Required')"
				>
					<b-input
						v-model="formModel.longitude"
						placeholder="Longitude"
						:disabled="formDisabled"
						@blur="validate('longitude')"
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
import Validation from "@/mixins/validation";
import InstitutionsService from "@/services/InstitutionsService";
import locationForm from "@/components/LocationForm";
import { Toast } from "@/utils/UI";

export default {
	name: "InstitutionForm",

	mixins: [Validation],

	components: { locationForm },

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			name: { required },
			longitude: { required },
			latitude: { required },
			contactGivenName: { required },
			contactFamilyName: { required },
			phonePrefix: { required },
			phoneNumber: { required, numeric },
			type: { required },
			addressStreet: { required },
			addressNumber: { required },
			addressPostCode: { required },
			nationalCardNumber: { required, numeric },
			nationalCardType: { required },
			adm1Id: { required },
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

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},

		fetchTypes() {
			InstitutionsService.getListOfInstitutionTypes()
				.then((result) => { this.types = result.data; })
				.catch((e) => {
					Toast(`(Institution Types) ${e}`, "is-danger");
				});
		},
	},
};
</script>
