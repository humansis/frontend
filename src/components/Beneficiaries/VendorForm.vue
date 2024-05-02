<template>
	<v-card-text>
		<DataInput
			v-model="formModel.username"
			:disabled="formDisabled || isEditing"
			:error-messages="validationMsg('username')"
			:data-cy="prepareComponentIdentifier()"
			label="Username"
			name="username"
			class="mb-4"
			@blur="onValidate('username')"
		/>

		<DataInput
			v-model="formModel.password"
			:disabled="formDisabled"
			:error-messages="validationMsg('password')"
			:append-inner-icon="passwordVisible ? 'eye-slash' : 'eye'"
			:type="passwordVisible ? 'text' : 'password'"
			:data-cy="prepareComponentIdentifier()"
			label="Password"
			name="password"
			class="mb-4"
			@click:append-inner="passwordVisible = !passwordVisible"
			@blur="onValidate('password')"
		/>

		<DataInput
			v-model="formModel.name"
			:disabled="formDisabled"
			:error-messages="validationMsg('name')"
			:data-cy="prepareComponentIdentifier()"
			label="Name"
			name="name"
			class="mb-4"
			@blur="onValidate('name')"
		/>

		<h4 :data-cy="identifierBuilder('allowed-category-types-text')">
			{{ $t('Allowed Category Types') }}
		</h4>

		<div
			v-for="({ code, value }, index) of options.categoryTypes"
			:key="`category-type-${code}`"
			:class="['category-types', { 'last-type': isLastCategoryType(index) }] "
		>
			<v-checkbox
				v-model="formModel.categoryType"
				:value="value"
				:disabled="formDisabled"
				:error-messages="errorMessageForCategory(index)"
				:name="`category-type-${index}`"
				:data-cy="identifierBuilder(`${code}-checkbox`)"
				hide-details="auto"
				@blur="onValidate('categoryType')"
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
			:data-cy="prepareComponentIdentifier()"
			label="Vendor No."
			name="vendor-no"
			class="my-4"
			optional
		/>

		<DataInput
			v-model="formModel.contractNo"
			:disabled="formDisabled"
			:data-cy="prepareComponentIdentifier()"
			label="Contract No."
			name="contract-no"
			class="mb-4"
			optional
		/>

		<h4
			:data-cy="identifierBuilder('remote-distribution-permission-input')"
			class="mb-n2"
		>
			{{ $t('Remote Distribution Permission') }}

			<i class="optional-text font-weight-medium">- {{ $t('Optional') }}</i>
		</h4>

		<v-checkbox
			v-model="formModel.canDoRemoteDistributions"
			:disabled="formDisabled"
			:data-cy="identifierBuilder('remote-distribution-permission-checkbox')"
			name="remote-distribution-permission"
			hide-details
			class="checkbox"
		>
			<template v-slot:label>
				<span>{{ $t('Allowed') }}</span>
			</template>
		</v-checkbox>

		<DataInput
			v-model="formModel.addressStreet"
			:disabled="formDisabled"
			:data-cy="prepareComponentIdentifier()"
			label="Address Street"
			name="address-street"
			class="mb-4"
			optional
		/>

		<DataInput
			v-model="formModel.addressNumber"
			:disabled="formDisabled"
			:data-cy="prepareComponentIdentifier()"
			label="Address Number"
			name="address-number"
			class="mb-4"
			optional
		/>

		<DataInput
			v-model="formModel.addressPostcode"
			:disabled="formDisabled"
			:data-cy="prepareComponentIdentifier()"
			label="Address Postcode"
			name="address-postcode"
			class="mb-4"
			optional
		/>

		<LocationForm
			ref="locationForm"
			:form-model="formModel"
			:form-disabled="formDisabled"
			:disabled-adm-clear="disabledAdmInput"
			:data-cy="dataCy"
			@mapped="mapping = false"
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			v-if="closeButton"
			:data-cy="identifierBuilder('close-button')"
			class="text-none"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			v-if="!formDisabled"
			:disabled="mapping || formLoading"
			:loading="formLoading"
			:data-cy="identifierBuilder(`${submitButtonLabel}-button`)"
			color="primary"
			class="text-none ml-3"
			variant="elevated"
			@click="onSubmitForm"
		>
			{{ $t(submitButtonLabel) }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import { required, requiredIf } from "@vuelidate/validators";
import DataInput from "@/components/Inputs/DataInput";
import LocationForm from "@/components/Inputs/LocationForm";
import SvgIcon from "@/components/SvgIcon";
import identifierBuilder from "@/mixins/identifierBuilder";
import validation from "@/mixins/validation";

export default {
	name: "VendorForm",

	emits: ["formSubmitted", "formClosed"],

	components: {
		LocationForm,
		DataInput,
		SvgIcon,
	},

	mixins: [validation, identifierBuilder],

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
		closeButton: Boolean,
		formDisabled: Boolean,
		formLoading: Boolean,
		isEditing: Boolean,

		formModel: {
			type: Object,
			required: true,
		},

		submitButtonLabel: {
			type: String,
			required: true,
		},
	},

	data() {
		return {
			mapping: true,
			passwordVisible: false,
			dataCy: "form",
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

	computed: {
		disabledAdmInput() {
			return {
				adm1: this.formDisabled,
				adm2: this.formDisabled,
				adm3: this.formDisabled,
				adm4: this.formDisabled,
			};
		},
	},

	methods: {
		isLastCategoryType(index) {
			return index === (this.options.categoryTypes.length - 1);
		},

		errorMessageForCategory(index) {
			return this.isLastCategoryType(index)
				? this.validationMsg("categoryType")
				: "";
		},

		onSubmitForm() {
			this.v$.$touch();
			this.$refs.locationForm.submitLocationForm();
			if (this.v$.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.v$.$reset();
		},

		onCloseForm() {
			this.$emit("formClosed");
			this.v$.$reset();
		},
	},
};
</script>
