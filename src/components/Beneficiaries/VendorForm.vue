<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				:label="$t('Username')"
				:type="validateType('username')"
				:message="validateMsg('username')"
			>
				<b-input
					v-model="formModel.username"
					:disabled="formDisabled || !formModel.creating"
					@blur="validate('username')"
				/>
			</b-field>

			<b-field
				:label="$t('Email')"
				:type="validateType('email')"
				:message="validateMsg('email')"
			>
				<b-input
					v-model="formModel.email"
					:disabled="formDisabled || !formModel.creating"
					@blur="validate('email')"
				/>
			</b-field>

			<b-field
				v-if="formModel.creating"
				:label="$t('Password')"
				:type="validateType('password')"
				:message="validateMsg('password')"
			>
				<b-input
					v-model="formModel.password"
					type="password"
					password-reveal
					:disabled="formDisabled"
					@blur="validate('password')"
				/>
			</b-field>

			<b-field
				:label="$t('Name')"
				:type="validateType('name')"
				:message="validateMsg('name')"
			>
				<b-input
					v-model="formModel.name"
					:disabled="formDisabled"
					@blur="validate('name')"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Shop') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.shop"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Vendor No.') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.vendorNo"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Contract No.') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.contractNo"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Address Street') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.addressStreet"
					:disabled="formDisabled"
					@blur="validate('addressStreet')"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Address Number') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.addressNumber"
					:disabled="formDisabled"
					@blur="validate('addressNumber')"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Address Postcode') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.addressPostcode"
					:disabled="formDisabled"
					@blur="validate('addressPostcode')"
				/>
			</b-field>

			<locationForm
				ref="locationForm"
				:form-model="formModel"
				:form-disabled="formDisabled"
				@mapped="mapping = false"
			/>
		</section>
		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				v-if="!formDisabled"
				class="is-primary"
				native-type="submit"
				:label="submitButtonLabel"
				:loading="formLoading"
				:disabled="mapping || formLoading"
			/>
		</footer>
	</form>
</template>

<script>
import { required, requiredIf, email } from "vuelidate/lib/validators";
import locationForm from "@/components/LocationForm";
import Validation from "@/mixins/validation";

export default {
	name: "vendorForm",

	components: { locationForm },

	mixins: [Validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
		formLoading: Boolean,
	},

	validations: {
		formModel: {
			username: { required },
			email: { required, email },
			password: { required: requiredIf((form) => form.creating) },
			name: { required },
			shop: {},
			addressStreet: {},
			addressNumber: {},
			addressPostcode: {},
			adm1Id: { required },
			adm2Id: {},
			adm3Id: {},
			adm4Id: {},
			vendorNo: {},
			contractNo: {},
		},
	},

	data() {
		return {
			mapping: true,
		};
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
	},
};
</script>
