<template>
	<v-card-text>
		<DataSelect
			v-if="!isEditing"
			v-model="formModel.targetType"
			:items="options.targetTypes"
			:disabled="formDisabled"
			:error-messages="validationMsg('targetType')"
			label="Target"
			name="target"
			class="mb-4"
			@update:modelValue="onValidate('targetType')"
		/>

		<DataInput
			v-model="formModel.field"
			:disabled="formDisabled"
			:error-messages="validationMsg('field')"
			label="Custom Field name"
			name="custom-field-name"
			class="mb-4"
			@update:modelValue="onValidate('field')"
		/>

		<DataSelect
			v-model="formModel.type"
			:items="options.types"
			:disabled="formDisabled"
			:error-messages="validationMsg('type')"
			label="Type"
			name="type"
			class="mb-4"
			@update:modelValue="onValidate('type')"
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
			:loading="loading"
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
import { required } from "@vuelidate/validators";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import validation from "@/mixins/validation";
import { COUNTRY_SETTINGS } from "@/consts";

export default {
	name: "CustomFieldForm",

	emits: ["formSubmitted", "formClosed"],

	components: {
		DataInput,
		DataSelect,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				field: { required },
				type: { required },
				targetType: { required },
			},
		};
	},

	props: {
		closeButton: Boolean,
		formDisabled: Boolean,

		formModel: {
			type: Object,
			required: true,
		},

		submitButtonLabel: {
			type: String,
			required: true,
		},

		loading: {
			type: Boolean,
			default: false,
		},

		isEditing: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			options: {
				types: COUNTRY_SETTINGS.CUSTOM_FIELDS.TYPES,
				targetTypes: COUNTRY_SETTINGS.CUSTOM_FIELDS.TARGET_TYPES,
			},
		};
	},

	mounted() {
		this.mapSelects();
	},

	methods: {
		mapSelects() {
			this.formModel.type = this.options.types.find(
				(item) => item.code === this.formModel.type,
			);
			this.formModel.targetType = this.options.targetTypes.find(
				(item) => item.code === this.formModel.targetType,
			);
		},

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
