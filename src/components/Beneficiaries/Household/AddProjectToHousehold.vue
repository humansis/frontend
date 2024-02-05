<template>
	<v-card-text>
		<DataSelect
			v-model="selectedProject"
			:items="options"
			:loading="loading"
			:error-messages="validationMsg('selectedProject')"
			item-title="name"
			label="Project"
			name="project"
			item-value="id"
			class="mb-4"
			@update:modelValue="onValidate('selectedProject')"
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
			:loading="confirmButtonLoading"
			color="primary"
			class="text-none ml-3"
			variant="elevated"
			@click="onAddHouseholdsToProject"
		>
			{{ $t('Confirm') }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import { required } from "@vuelidate/validators";
import DataSelect from "@/components/Inputs/DataSelect";
import validation from "@/mixins/validation";

export default {
	name: "AddProjectToHouseholdModal",

	components: { DataSelect },

	mixins: [validation],

	validations() {
		return {
			selectedProject: { required },
		};
	},

	props: {
		confirmButtonLoading: Boolean,
		loading: Boolean,

		options: {
			type: Array,
			default: () => [],
		},
	},

	emits: ["actionConfirmed", "formClosed"],

	data() {
		return {
			selectedProject: null,
		};
	},

	methods: {
		onAddHouseholdsToProject() {
			this.v$.$touch();

			if (this.v$.$invalid) {
				return;
			}

			this.$emit("actionConfirmed", this.selectedProject);
			this.v$.$reset();
			this.selectedProject = null;
		},

		onCloseForm() {
			this.$emit("formClosed");
			this.v$.$reset();
		},
	},
};
</script>
