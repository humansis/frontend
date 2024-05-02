<template>
	<v-card-text>
		<DataInput
			v-model="formModel.name"
			:disabled="formDisabled || editing"
			:error-messages="validationMsg('name')"
			:data-cy="prepareComponentIdentifier()"
			label="Name"
			name="name"
			class="mb-4"
			@update:modelValue="onValidate('name')"
		/>

		<DataInput
			v-model="formModel.unit"
			:disabled="formDisabled"
			:data-cy="prepareComponentIdentifier()"
			label="Unit"
			name="unit"
			class="mb-4"
			optional
		/>

		<DataSelect
			v-model="formModel.productCategoryId"
			:items="categories"
			:disabled="formDisabled"
			:error-messages="validationMsg('productCategoryId')"
			:data-cy="prepareComponentIdentifier()"
			persistent-hint
			label="Category"
			name="category"
			item-title="name"
			item-value="id"
			class="mb-4"
			@update:modelValue="onValidate('productCategoryId')"
		/>

		<template v-if="isCategoryTypeCashback">
			<DataInput
				v-model.number="formModel.unitPrice"
				:disabled="formDisabled"
				:error-messages="validationMsg('unitPrice')"
				:data-cy="prepareComponentIdentifier()"
				label="Price"
				name="price"
				type="number"
				class="mb-4"
				hide-spin-buttons
				@blur="onValidate('unitPrice')"
			/>

			<DataSelect
				v-model="formModel.currency"
				:items="options.currencies"
				:disabled="formDisabled"
				:error-messages="validationMsg('currency')"
				:data-cy="prepareComponentIdentifier()"
				persistent-hint
				label="Currency"
				name="currency"
				class="mb-4"
				@update:modelValue="onValidate('currency')"
			/>
		</template>

		<h4>{{ $t("Image") }}</h4>

		<FileUpload
			v-if="!formDisabled"
			v-model="formModel.uploadedImage"
			:error-messages="validationMsg('uploadedImage')"
			:data-cy="prepareComponentIdentifier()"
			name="image"
			prepend-icon=""
			hide-details="auto"
			variant="outlined"
			density="compact"
			accept="image/*"
			@update:modelValue="onValidate('uploadedImage')"
		/>

		<v-img
			v-if="formDisabled && formModel.image"
			:src="formModel.image"
			alt="item-image"
			height="125"
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			:data-cy="identifierBuilder('close-input')"
			class="text-none"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			v-if="!formDisabled"
			:data-cy="identifierBuilder('submit-input')"
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
import { minValue, required, requiredIf } from "@vuelidate/validators";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import FileUpload from "@/components/Inputs/FileUpload";
import identifierBuilder from "@/mixins/identifierBuilder";
import validation from "@/mixins/validation";
import { CURRENCIES } from "@/consts";

export default {
	name: "ProductForm",

	emits: [
		"formSubmitted",
		"formClosed",
	],

	components: {
		DataInput,
		DataSelect,
		FileUpload,
	},

	mixins: [validation, identifierBuilder],

	validations() {
		return {
			formModel: {
				name: { required },
				productCategoryId: { required },
				currency: { required: requiredIf(this.isCategoryTypeCashback) },
				unitPrice: {
					required: requiredIf(this.isCategoryTypeCashback),
					...(this.isCategoryTypeCashback && { minValue: minValue(0.01) }),
				},
				uploadedImage: { required: requiredIf(!this.formModel?.image) },
			},
		};
	},

	props: {
		closeButton: Boolean,
		formDisabled: Boolean,
		editing: Boolean,

		formModel: {
			type: Object,
			required: true,
		},

		submitButtonLabel: {
			type: String,
			required: true,
		},

		categories: {
			type: Array,
			default: () => [],
		},
	},

	data() {
		return {
			dataCy: "products-form",
			options: {
				currencies: CURRENCIES,
			},
		};
	},

	computed: {
		isCategoryTypeCashback() {
			return this.formModel.productCategoryId?.type === "Cashback";
		},
	},

	methods: {
		onSubmitForm() {
			this.v$.$touch();
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
