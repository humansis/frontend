<template>
	<v-card-text>
		<DataSelect
			v-model="selectedProject"
			:items="options"
			:loading="loading"
			item-title="name"
			label="Project"
			name="project"
			item-value="id"
			class="mb-6"
			is-search-enabled
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			class="text-none"
			size="small"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="$emit('formClosed')"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			:loading="confirmButtonLoading"
			color="primary"
			size="small"
			class="text-none ml-3"
			variant="elevated"
			@click="onAddHouseholdsToProject"
		>
			{{ $t('Confirm') }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import DataSelect from "@/components/Inputs/DataSelect";

export default {
	name: "AddProjectToHouseholdModal",

	components: { DataSelect },

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
			this.$emit("actionConfirmed", this.selectedProject);
			this.selectedProject = null;
		},
	},
};
</script>
