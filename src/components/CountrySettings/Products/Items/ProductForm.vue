<template>
	<v-card-text>
		<DataInput
			v-model="formModel.name"
			:disabled="formDisabled || editing"
			:error-messages="validationMsg('name')"
			label="Name"
			name="name"
			class="mb-4"
			@update:modelValue="onValidate('name')"
		/>

		<DataInput
			v-model="formModel.unit"
			:disabled="formDisabled"
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
			class="text-none"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			v-if="!formDisabled"
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

	mixins: [validation],

	validations() {
		return {
			formModel: {
				name: { required },
				productCategoryId: { required },
				currency: { required: requiredIf(this.formModel.productCategoryId?.type === "Cashback") },
				unitPrice: {
					required: requiredIf(this.formModel.productCategoryId?.type === "Cashback"),
					minValue: minValue(0.01),
				},
				uploadedImage: { required: requiredIf(!this.formModel?.image) },
			},
		};
	},

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
		editing: Boolean,

		categories: {
			type: Array,
			default: () => [],
		},
	},

	data() {
		return {
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
