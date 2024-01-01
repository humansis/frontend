<template>
	<v-card-text>
		<DataInput
			v-model="formModel.title"
			:disabled="formDisabled"
			:error-messages="validationMsg('title')"
			label="Title"
			name="title"
			class="mb-4"
			@blur="onValidate('title')"
		/>

		<DataSelect
			v-model="formModel.projects"
			:items="options.projects"
			:loading="projectsLoading"
			:disabled="formDisabled"
			:error-messages="validationMsg('projects')"
			label="Projects"
			name="projects"
			item-title="name"
			item-value="id"
			class="mb-4"
			multiple
			chips
			closable-chips
			@update:modelValue="onValidate('projects')"
		/>

		<TextAreaInput
			v-model.trim="formModel.description"
			:disabled="formDisabled"
			label="Description"
			name="description"
			class="mb-4"
			optional
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
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import TextAreaInput from "@/components/Inputs/TextAreaInput";
import validation from "@/mixins/validation";
import { required } from "@vuelidate/validators";

export default {
	name: "importForm",

	components: {
		DataInput,
		DataSelect,
		TextAreaInput,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				title: { required },
				projects: { required },
			},
		};
	},

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
		isEditing: Boolean,

		options: {
			type: Object,
			default: () => {},
		},
	},

	emits: [
		"formSubmitted",
		"formClosed",
	],

	data() {
		return {
			projectsLoading: false,
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
