<template>
	<v-card-text>
		<DataSelect
			v-model="newProject"
			:items="projects"
			:error-messages="validationMsg('newProject')"
			:clearable="true"
			label="Target project"
			name="target-project"
			item-title="name"
			item-value="id"
			class="my-4"
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
			color="primary"
			class="text-none ml-3"
			variant="elevated"
			@click="onSubmitForm"
		>
			{{ $t('Move') }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import { required } from "@vuelidate/validators";
import DataSelect from "@/components/Inputs/DataSelect";
import validation from "@/mixins/validation";

export default {
	name: "AssistanceForm",

	emits: ["formSubmitted", "formClosed"],

	components: {
		DataSelect,
	},

	mixins: [validation],

	validations() {
		return {
			newProject: { required },
		};
	},

	props: {
		projects: {
			type: Array,
			default: () => [],
		},
	},

	data() {
		return {
			newProject: null,
		};
	},

	methods: {
		onSubmitForm() {
			this.v$.$touch();

			if (this.v$.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.newProject);
			this.onCloseForm();
		},

		onCloseForm() {
			this.$emit("formClosed");
			this.v$.$reset();
		},
	},
};
</script>
