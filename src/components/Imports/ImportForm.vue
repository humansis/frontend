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

		<DataTextarea
			v-model.trim="formModel.description"
			:disabled="formDisabled"
			label="Description"
			name="description"
			class="mb-4"
			is-optional
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
import { required } from "@vuelidate/validators";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DataTextarea from "@/components/Inputs/DataTextarea";
import validation from "@/mixins/validation";

export default {
	name: "importForm",

	components: {
		DataInput,
		DataSelect,
		DataTextarea,
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
		closeButton: Boolean,
		formDisabled: Boolean,
		isEditing: Boolean,

		formModel: {
			type: Object,
			required: true,
		},

		submitButtonLabel: {
			type: String,
			required: true,
		},

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
