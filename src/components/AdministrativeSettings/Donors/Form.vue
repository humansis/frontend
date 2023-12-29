<template>
	<v-card-text>
		<DataInput
			v-model="formModel.fullname"
			:disabled="formDisabled"
			:error-messages="validationMsg('fullname')"
			label="Donor Name"
			name="donor-name"
			class="mb-6"
			@update:modelValue="onValidate('fullname')"
		/>

		<DataInput
			v-model="formModel.shortname"
			:disabled="formDisabled"
			:error-messages="validationMsg('shortname')"
			label="Short Name"
			name="short-name"
			class="mb-6"
			@update:modelValue="onValidate('shortname')"
		/>

		<span v-if="!formDisabled">{{ $t('Image') }}
			<i class="optional-text">- {{ $t('Optional') }}</i>
		</span>

		<FileUpload
			v-if="!formDisabled"
			v-model="formModel.uploadedImage"
			prepend-icon=""
			hide-details="auto"
			variant="outlined"
			density="compact"
			accept="image/*"
			class="mb-6"
		/>

		<v-img
			v-if="formDisabled && formModel.logo"
			:src="formModel.logo"
			alt="donor-image"
			height="125"
			class="mb-6"
		/>

		<DataInput
			v-model="formModel.notes"
			:disabled="formDisabled"
			label="Notes"
			name="notes"
			class="mb-6"
			optional
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
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			v-if="!formDisabled"
			color="primary"
			size="small"
			class="text-none ml-3"
			variant="elevated"
			@click="onSubmitForm"
		>
			{{ $t(submitButtonLabel) }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import ColorPicker from "@/components/Inputs/ColorPicker";
import DataInput from "@/components/Inputs/DataInput";
import FileUpload from "@/components/Inputs/FileUpload";
import validation from "@/mixins/validation";
import { required } from "@vuelidate/validators";

export default {
	name: "DonorForm",

	components: {
		DataInput,
		FileUpload,
		ColorPicker,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				fullname: { required },
				shortname: { required },
			},
		};
	},

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
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
