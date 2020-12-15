<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
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

			<b-field label="Phone">
				<b-field grouped>
					<b-field
						:type="validateType('phonePrefix')"
						:message="validateMsg('phonePrefix', 'Required')"
					>
						<MultiSelect
							v-model="formModel.phonePrefix"
							searchable
							placeholder="Phone Ext"
							label="value"
							track-by="code"
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
					label="value"
					track-by="code"
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
					:disabled="formDisabled"
					@blur="validate('nationalCardNumber')"
				/>
			</b-field>

			<LocationForm
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
import { Notification } from "@/utils/UI";
import { required, numeric } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";
import LocationForm from "@/components/LocationForm";
import BeneficiariesService from "@/services/BeneficiariesService";

export default {
	name: "CommunityForm",

	mixins: [Validation],

	components: { LocationForm },

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			longitude: { required },
			latitude: { required },
			contactGivenName: { required },
			contactFamilyName: { required },
			phonePrefix: { required },
			phoneNumber: { required, numeric },
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
			nationalCardTypes: [],
			// TODO get from API
			phonePrefixes: [
				{
					code: "+420",
					value: "CZ - +420",
				},
				{
					code: "+421",
					value: "SK - +421",
				},
			],
		};
	},

	mounted() {
		this.fetchNationalCardTypes();
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

		async fetchNationalCardTypes() {
			await BeneficiariesService.getListOfTypesOfNationalIds()
				.then((response) => { this.nationalCardTypes = response.data; })
				.catch((e) => {
					Notification(`National IDs ${e}`, "is-danger");
				});
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
