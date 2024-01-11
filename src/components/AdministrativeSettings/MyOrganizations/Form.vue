<template>
	<v-card-text>
		<DataInput
			v-model="formModel.name"
			:disabled="formDisabled"
			:error-messages="validationMsg('name')"
			label="Organization Name"
			name="organization-name"
			class="mb-4"
			@blur="onValidate('name')"
		/>

		<template v-if="!formDisabled">
			<span>{{ $t('Organization Logo') }}
				<i class="optional-text">- {{ $t('Optional') }}</i>
			</span>

			<FileUpload
				v-model="formModel.uploadedImage"
				prepend-icon=""
				hide-details="auto"
				variant="outlined"
				density="compact"
				accept="image/*"
				class="mb-4"
			/>
		</template>

		<v-img
			v-if="formDisabled && formModel.logo"
			:src="formModel.logo"
			alt="my-organization-logo"
			height="125"
			class="mb-4"
		/>

		<DataSelect
			v-model="formModel.font"
			:items="fonts"
			:disabled="formDisabled"
			label="Font To Apply To The Pdf"
			name="font-in-pdf"
			class="mb-4"
			optional
		/>

		<div class="mb-6">
			<span>{{ $t('Organization Primary Color') }}
				<i class="optional-text">- {{ $t('Optional') }}</i>
			</span>

			<ColorPicker
				v-model="formModel.primaryColor"
				:disabled="formDisabled"
			/>
		</div>

		<div class="mb-6">
			<span>{{ $t('Organization Secondary Color') }}
				<i class="optional-text">- {{ $t('Optional') }}</i>
			</span>

			<ColorPicker
				v-model="formModel.secondaryColor"
				:disabled="formDisabled"
			/>
		</div>

		<DataInput
			v-model="formModel.footerContent"
			:disabled="formDisabled"
			:error-messages="validationMsg('footerContent')"
			label="PDF Footer Content"
			name="pdf-footer-content"
			class="mb-4"
			@blur="onValidate('footerContent')"
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			v-if="closeButton"
			class="text-none"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			v-if="!formDisabled"
			class="text-none ml-3"
			color="primary"
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
import DataSelect from "@/components/Inputs/DataSelect";
import FileUpload from "@/components/Inputs/FileUpload";
import validation from "@/mixins/validation";
import { required } from "@vuelidate/validators";

export default {
	name: "MyOrganizationForm",

	components: {
		ColorPicker,
		DataSelect,
		DataInput,
		FileUpload,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				name: { required },
				footerContent: { required },
			},
		};
	},

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	data() {
		return {
			fonts: [
				{ code: "Arial", value: "Arial" },
				{ code: "Helvetica", value: "Helvetica" },
				{ code: "Courier", value: "Courier" },
			],
		};
	},

	mounted() {
		this.mapSelects();
	},

	methods: {
		mapSelects() {
			if (typeof this.formModel.font !== "object") {
				this.formModel.font = this.fonts.find((item) => item.code === this.formModel.font);
			}
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
