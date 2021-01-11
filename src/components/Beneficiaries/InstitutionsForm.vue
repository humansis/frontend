<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Name"
				:type="validateType('name')"
				:message="validateMsg('name')"
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
				:message="validateMsg('contactGivenName')"
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
				:message="validateMsg('contactFamilyName')"
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
				:message="validateMsg('type')"
			>
				<MultiSelect
					v-model="formModel.type"
					searchable
					label="value"
					track-by="code"
					:disabled="formDisabled"
					:options="types"
					placeholder="Click to select..."
					:class="validateMultiselect('type')"
					@select="validate('type')"
				/>
			</b-field>

			<b-field label="Phone">
				<b-field grouped>
					<b-field
						:type="validateType('phonePrefix')"
						:message="validateMsg('phonePrefix')"
					>
						<MultiSelect
							v-model="formModel.phonePrefix"
							searchable
							placeholder="Phone Ext"
							label="value"
							track-by="code"
							:disabled="formDisabled"
							:options="phonePrefixes"
							:class="validateMultiselect('phonePrefix')"
							@select="validate('phonePrefix')"
						/>
					</b-field>
					<b-field
						expanded
						:type="validateType('phoneNumber')"
						:message="validateMsg('phoneNumber')"
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
				:message="validateMsg('nationalCardType')"
			>
				<MultiSelect
					v-model="formModel.nationalCardType"
					searchable
					placeholder="Click to select..."
					label="value"
					track-by="code"
					:disabled="formDisabled"
					:options="nationalCardTypes"
					:class="validateMultiselect('nationalCardType')"
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
				:message="validateMsg('addressNumber')"
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
				:message="validateMsg('addressStreet')"
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
				:message="validateMsg('addressPostCode')"
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
					:message="validateMsg('latitude')"
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
					:message="validateMsg('longitude')"
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
import { Notification } from "@/utils/UI";
import BeneficiariesService from "@/services/BeneficiariesService";

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
		this.fetchTypes();
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

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},

		fetchTypes() {
			InstitutionsService.getListOfInstitutionTypes()
				.then((result) => { this.types = result.data; })
				.catch((e) => {
					Notification(`Institution Types ${e}`, "is-danger");
				});
		},

		async fetchNationalCardTypes() {
			await BeneficiariesService.getListOfTypesOfNationalIds()
				.then((response) => { this.nationalCardTypes = response.data; })
				.catch((e) => {
					Notification(`National IDs ${e}`, "is-danger");
				});
		},
	},
};
</script>
