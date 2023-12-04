<template>
	<div class="d-inline-flex ml-4 mr-3" :class="{ 'flex-column': isMobile }">
		<DataSelect
			v-model="selectedExportType"
			:items="availableExportTypes"
			:disabled="disabled"
			name="select-export-type"
			variant="outlined"
			density="compact"
			label="Select type"
			class="export-type"
			hide-details
			@input="inputChanged"
		/>

		<DataSelect
			v-model="selectedExportFormat"
			:items="availableExportFormats"
			:disabled="disabled"
			name="select-export-format"
			variant="outlined"
			density="compact"
			label="Select format"
			class="export-format"
			append-icon="download"
			:icon-loading="isExportLoading"
			hide-details
			@input="inputChanged"
			@append-icon-clicked="startExport"
		/>
	</div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import DataSelect from "@/components/Inputs/DataSelect";
import vuetifyHelper from "@/mixins/vuetifyHelper";
import { EXPORT } from "@/consts";

export default {
	name: "ExportControl",

	components: {
		DataSelect,
	},

	mixins: [vuetifyHelper],

	props: {
		availableExportTypes: {
			type: Array,
			required: true,
		},

		availableExportFormats: {
			type: Array,
			required: true,
		},

		isExportLoading: {
			type: Boolean,
			default: false,
		},

		location: {
			type: String,
			required: true,
		},

		fieldClass: {
			type: String,
			default: "",
		},

		disabled: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			selectedExportType: null,
			selectedExportFormat: null,
		};
	},

	computed: {
		...mapState(["country", "selectedExportsOptions"]),

		isExportButtonEnabled() {
			return this.selectedExportType
				&& this.selectedExportFormat
				&& !this.disabled;
		},
	},

	watch: {
		availableExportTypes() {
			this.setDefaultSelectedValue();
		},
	},

	mounted() {
		this.setDefaultSelectedValue();
		this.setExportInputs(this.location);
	},

	methods: {
		...mapActions(["storeSelectedExportOptions"]),

		setDefaultSelectedValue() {
			if (this.availableExportTypes.length === 1) {
				const [option] = this.availableExportTypes;
				this.selectedExportType = option;
			}

			if (this.availableExportFormats.length === 1) {
				const [option] = this.availableExportFormats;
				this.selectedExportFormat = option;
			}
		},

		inputChanged() {
			this.setExportInputs(this.location, {
				exportType: this.selectedExportType,
				formatType: this.selectedExportFormat,
			});

			this.$emit("inputUpdated", this.selectedExportType, this.selectedExportFormat);

			if (this.selectedExportType === EXPORT.BANK_DISTRIBUTION_LIST
				|| this.selectedExportType === EXPORT.BNF_FILE_3.OPTION_NAME) {
				this.selectedExportFormat = EXPORT.FORMAT_XLSX;
			}
		},

		setExportInputs(entity, selectedOptions = null) {
			if (selectedOptions) {
				const exportOptionsEntityIndex = this.selectedExportsOptions?.[entity]?.findIndex(
					({ country }) => country === this.country.iso3,
				);

				const updatedSelectedOptions = { ...this.selectedExportsOptions };

				if (exportOptionsEntityIndex !== -1 && exportOptionsEntityIndex !== undefined) {
					updatedSelectedOptions[entity][exportOptionsEntityIndex].selected = selectedOptions;
				} else {
					updatedSelectedOptions[entity].push({
						country: this.country.iso3,
						selected: selectedOptions,
					});
				}

				this.storeSelectedExportOptions({
					...updatedSelectedOptions,
				});
			} else {
				const storedSelectedOptions = this.selectedExportsOptions[entity]?.find(
					({ country }) => country === this.country.iso3,
				);

				if (storedSelectedOptions) {
					const { selected } = storedSelectedOptions;

					const {
						exportType,
						formatType,
					} = selected;

					this.selectedExportType = exportType;
					this.selectedExportFormat = formatType;
				}
			}
		},

		startExport() {
			this.$emit("onExport", this.selectedExportType, this.selectedExportFormat);
		},
	},
};
</script>

<style lang="scss">
.export-type, .export-format {
	min-width: 180px;
	max-width: fit-content;
}
</style>
