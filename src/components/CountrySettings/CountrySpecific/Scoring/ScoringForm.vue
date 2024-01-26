<template>
	<v-card-text>
		<DataInput
			v-model="formModel.name"
			:error-messages="validationMsg('name')"
			label="Name"
			name="name"
			class="mb-4"
			@update:modelValue="onValidate('name')"
		/>

		<p class="text-caption text-red mb-4">
			{{ $t("Name cannot be changed afterwards.") }}
		</p>

		<DataTextarea
			v-model.trim="formModel.note"
			label="Note"
			name="note"
			class="mb-4"
			auto-grow
		/>

		<FileUpload
			v-model="formModel.dropFiles"
			:error-messages="validationMsg('dropFiles')"
			:accept="allowedFileExtensions"
			prepend-icon=""
			hide-details="auto"
			variant="outlined"
			density="compact"
			@update:modelValue="onValidate('uploadedImage')"
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
			:disabled="formModel.dropFiles.length > 1"
			color="primary"
			class="text-none ml-3"
			variant="elevated"
			@click="onSubmitForm"
		>
			{{ $t("Create") }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import { required } from "@vuelidate/validators";
import DataInput from "@/components/Inputs/DataInput";
import DataTextarea from "@/components/Inputs/DataTextarea";
import FileUpload from "@/components/Inputs/FileUpload";
import validation from "@/mixins/validation";
import { IMPORT } from "@/consts";

export default {
	name: "ScoringForm",

	emits: ["formSubmitted", "formClosed"],

	components: {
		FileUpload,
		DataInput,
		DataTextarea,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				name: { required },
				dropFiles: { required },
			},
		};
	},

	props: {
		closeButton: Boolean,

		formModel: {
			type: Object,
			default: () => {},
		},
	},

	data() {
		return {
			allowedFileExtensions: IMPORT.SUPPORT_CSV_XLSX_XLS_FILES,
		};
	},

	computed: {
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
