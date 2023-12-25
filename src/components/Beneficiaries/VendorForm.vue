<template>
	<v-card-text>
		<DataInput
			v-model="formModel.username"
			:disabled="formDisabled || isEditing"
			:error-messages="validationMsg('username')"
			label="Username"
			name="username"
			class="mb-6"
			@blur="validate('username')"
		/>

		<DataInput
			v-model="formModel.password"
			:disabled="formDisabled"
			:error-messages="validationMsg('password')"
			:append-inner-icon="passwordVisible ? 'eye-slash' : 'eye'"
			:type="passwordVisible ? 'text' : 'password'"
			label="Password"
			name="password"
			class="mb-6"
			@click:append-inner="passwordVisible = !passwordVisible"
			@blur="validate('password')"
		/>

		<DataInput
			v-model="formModel.name"
			:disabled="formDisabled"
			:error-messages="validationMsg('name')"
			label="Name"
			name="name"
			class="mb-3"
			@blur="validate('name')"
		/>

		<div
			v-for="({ code, value }, index) of options.categoryTypes"
			:key="`category-type-${code}`"
			:class="['category-types', { 'last-type': isLastCategoryType(index) }] "
		>
			<v-checkbox
				v-model="formModel.categoryType"
				:value="value"
				:disabled="formDisabled"
				:error-messages="isLastCategoryType(index) && validationMsg('categoryType')"
				hide-details="auto"
				@blur="validate('categoryType')"
			>
				<template v-slot:label>
					{{ $t(value) }}

					<SvgIcon
						:items="[{ code, value }]"
						class="ml-2"
					/>
				</template>
			</v-checkbox>
		</div>

		<DataInput
			v-model="formModel.vendorNo"
			:disabled="formDisabled"
			label="Vendor No."
			name="vendor-no"
			class="mt-6 mb-6"
			optional
		/>

		<DataInput
			v-model="formModel.contractNo"
			:disabled="formDisabled"
			label="Contract No."
			name="contract-no"
			class="mb-2"
			optional
		/>

		<v-checkbox
			v-model="formModel.canDoRemoteDistributions"
			:disabled="formDisabled"
			hide-details
			class="checkbox"
		>
			<template v-slot:label>
				<span>{{ $t('Remote Distribution Permission') }}
					<i class="optional-text">- {{ $t('Optional') }}</i>
				</span>
			</template>
		</v-checkbox>

		<DataInput
			v-model="formModel.addressStreet"
			:disabled="formDisabled"
			label="Address Street"
			name="address-street"
			class="mb-6"
			optional
		/>

		<DataInput
			v-model="formModel.addressNumber"
			:disabled="formDisabled"
			label="Address Number"
			name="address-number"
			class="mb-6"
			optional
		/>

		<DataInput
			v-model="formModel.addressPostcode"
			:disabled="formDisabled"
			label="Address Postcode"
			name="address-postcode"
			class="mb-6"
			optional
		/>

		<LocationForm
			ref="locationForm"
			:form-model="formModel"
			:form-disabled="formDisabled"
			@mapped="mapping = false"
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			v-if="closeButton"
			class="text-none"
			size="small"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="closeForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			v-if="!formDisabled"
			:disabled="mapping || formLoading"
			:loading="formLoading"
			color="primary"
			size="small"
			class="text-none ml-3"
			variant="elevated"
			@click="submitForm"
		>
			{{ $t(submitButtonLabel) }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import DataInput from "@/components/Inputs/DataInput";
import LocationForm from "@/components/Inputs/LocationForm";
import SvgIcon from "@/components/SvgIcon";
import validation from "@/mixins/validation";
import { required, requiredIf } from "@vuelidate/validators";

export default {
	name: "VendorForm",

	components: {
		LocationForm,
		DataInput,
		SvgIcon,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				username: { required },
				password: { required: requiredIf(!this.isEditing) },
				name: { required },
				categoryType: { required },
				shop: {},
				addressStreet: {},
				addressNumber: {},
				addressPostcode: {},
				adm1: { required },
				adm2: {},
				adm3: {},
				adm4: {},
				vendorNo: {},
				contractNo: {},
			},
		};
	},

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
		formLoading: Boolean,
		isEditing: Boolean,
	},

	data() {
		return {
			mapping: true,
			passwordVisible: false,
			options: {
				categoryTypes: [
					{
						code: "Food",
						value: "Food",
					},
					{
						code: "Non-Food",
						value: "Non-Food",
					},
					{
						code: "Cashback",
						value: "Cashback",
					},
				],
			},
		};
	},

	methods: {
		isLastCategoryType(index) {
			return index === (this.options.categoryTypes.length - 1);
		},

		submitForm() {
			this.v$.$touch();
			this.$refs.locationForm.submitLocationForm();
			if (this.v$.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.v$.$reset();
		},

		closeForm() {
			this.$emit("formClosed");
			this.v$.$reset();
		},
	},
};
</script>
