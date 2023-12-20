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
			is-search-enabled
			class="my-4"
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			class="text-none"
			size="small"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="closeForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			color="primary"
			size="small"
			class="text-none ml-3"
			variant="elevated"
			@click="submitForm"
		>
			{{ $t('Move') }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import DataSelect from "@/components/Inputs/DataSelect";
import validation from "@/mixins/validation";
import { required } from "@vuelidate/validators";

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
		submitForm() {
			this.v$.$touch();

			if (this.v$.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.newProject);
			this.closeForm();
		},

		closeForm() {
			this.$emit("formClosed");
			this.v$.$reset();
		},
	},
};
</script>
