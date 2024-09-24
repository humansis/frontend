<template>
	<v-card-text>
		<DataInput
			v-model="formModel.fullname"
			:disabled="formDisabled"
			:error-messages="validationMsg('fullname')"
			:data-cy="prepareComponentIdentifier()"
			label="Donor Name"
			name="donor-name"
			class="mb-4"
			@update:modelValue="onValidate('fullname')"
		/>

		<DataInput
			v-model="formModel.shortname"
			:disabled="formDisabled"
			:error-messages="validationMsg('shortname')"
			:data-cy="prepareComponentIdentifier()"
			label="Short Name"
			name="short-name"
			class="mb-4"
			@update:modelValue="onValidate('shortname')"
		/>

		<span
			v-if="!formDisabled"
			:data-cy="identifierBuilder('image-text')"
		>
			{{ $t('Image') }}

			<i
				:data-cy="identifierBuilder('image-optional-text')"
				class="optional-text"
			>
				- {{ $t('Optional') }}
			</i>
		</span>

		<FileUpload
			v-if="!formDisabled"
			v-model="formModel.uploadedImage"
			:data-cy="prepareComponentIdentifier()"
			name="image"
			prepend-icon=""
			hide-details="auto"
			variant="outlined"
			density="compact"
			accept="image/*"
			class="mb-4"
		/>

		<v-img
			v-if="formDisabled && formModel.logo"
			:src="formModel.logo"
			:data-cy="identifierBuilder('image')"
			alt="donor-image"
			height="125"
			class="mb-4"
		/>

		<DataInput
			v-model="formModel.notes"
			:disabled="formDisabled"
			:data-cy="prepareComponentIdentifier()"
			label="Notes"
			name="notes"
			class="mb-4"
			optional
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
import { required } from "@vuelidate/validators";
import DataInput from "@/components/Inputs/DataInput";
import FileUpload from "@/components/Inputs/FileUpload";
import identifierBuilder from "@/mixins/identifierBuilder";
import validation from "@/mixins/validation";

export default {
	name: "DonorForm",

	emits: ["formSubmitted", "formClosed"],

	components: {
		DataInput,
		FileUpload,
	},

	mixins: [validation, identifierBuilder],

	validations() {
		return {
			formModel: {
				fullname: { required },
				shortname: { required },
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
	},

	data() {
		return {
			dataCy: "donors-form",
		};
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
