<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
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
							:options="options.phonePrefixes"
							:class="validateMultiselect('phonePrefix')"
							@select="validate('phonePrefix')"
						/>
					</b-field>
					<b-field grouped>
						<MultiSelect
							v-model="formModel.phoneType"
							searchable
							selectLabel=""
							deselectLabel=""
							label="value"
							track-by="code"
							placeholder="Phone Type"
							:disabled="formDisabled"
							:loading="phoneTypesLoading"
							:options="options.phoneTypes"
							:class="validateMultiselect('phoneType')"
							@select="validate('phoneType')"
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
			<b-checkbox v-model="formModel.phoneProxy" class="mb-4" :disabled="formDisabled">
				Proxy
			</b-checkbox>

			<b-field
				label="Contact ID Type"
				:type="validateType('nationalCardType')"
				:message="validateMsg('nationalCardType')"
			>
				<MultiSelect
					v-model="formModel.nationalCardType"
					searchable
					label="value"
					track-by="code"
					placeholder="Click to select..."
					:loading="nationalCardTypesLoading"
					:disabled="formDisabled"
					:options="options.nationalCardTypes"
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
				:message="validateMsg('addressNumber')"
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
				:message="validateMsg('addressStreet')"
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
				:message="validateMsg('addressPostCode')"
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
					:message="validateMsg('latitude')"
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
					:message="validateMsg('longitude')"
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
import { required } from "vuelidate/lib/validators";
import LocationForm from "@/components/LocationForm";
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
import Validation from "@/mixins/validation";
import PhoneCodes from "@/utils/phoneCodes";

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
			phoneNumber: { required },
			phoneType: { required },
			phoneProxy: { required },
			addressStreet: { required },
			addressNumber: { required },
			addressPostCode: { required },
			nationalCardNumber: { required },
			nationalCardType: { required },
			adm1Id: { required },
			adm2Id: {},
			adm3Id: {},
			adm4Id: {},
		},
	},

	data() {
		return {
			phoneTypesLoading: true,
			nationalCardTypesLoading: true,
			options: {
				nationalCardTypes: [],
				phonePrefixes: PhoneCodes,
				phoneTypes: [],
			},
		};
	},

	watch: {
		formModel: "mapSelects",
	},

	async mounted() {
		await this.fetchNationalCardTypes();
		await this.fetchPhoneTypes();
	},

	methods: {
		async mapSelects() {
			const { phonePrefix, nationalCardType, phoneType } = this.formModel;
			if (phonePrefix && typeof phonePrefix !== "object") {
				this.formModel.phonePrefix = await PhoneCodes
					.find((item) => item.code === phonePrefix);
			}
			if (nationalCardType && typeof nationalCardType !== "object") {
				this.formModel.nationalCardType = await this.options.nationalCardTypes
					.find((item) => item.code === nationalCardType);
			}
			if (phoneType && typeof phoneType !== "object") {
				this.formModel.phoneType = await this.options.phoneTypes
					.find((item) => item.code === phoneType);
			}
		},

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
				.then(({ data }) => { this.options.nationalCardTypes = data; })
				.catch((e) => {
					Notification(`National IDs ${e}`, "is-danger");
				});

			this.nationalCardTypesLoading = false;
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},

		async fetchPhoneTypes() {
			await BeneficiariesService.getListOfTypesOfPhones()
				.then(({ data }) => {
					this.options.phoneTypes = data;
				})
				.catch((e) => {
					Notification(`Phone types ${e}`, "is-danger");
				});

			this.phoneTypesLoading = false;
		},
	},
};
</script>
