<template>
	<div class="level-item" :class="fieldClass">
		<b-field>
			<b-select
				:placeholder="$t('Select export')"
				v-model="selectedExportType"
				:disabled="disabled"
				@input="inputChanged"
			>
				<option
					v-for="(value, key) of availableExportTypes"
					:value="value"
					:key="key"
				>
					{{ $t(value) }}
				</option>
			</b-select>
			<b-select
				:placeholder="$t('Select format')"
				v-model="selectedExportFormat"
				:disabled="disabled"
				@input="inputChanged"
			>
				<option
					v-for="(value, key) of availableExportFormats"
					:value="value"
					:key="key"
				>
					{{ $t(value) }}
				</option>
			</b-select>
			<div class="control">
				<b-tooltip :label="$t(`Export`)">
					<b-button
						type="is-primary"
						icon-left="download"
						:loading="isExportLoading"
						:disabled="!isExportButtonEnabled || isExportLoading"
						@click="startExport()"
					/>
				</b-tooltip>
			</div>
		</b-field>
	</div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { EXPORT } from "@/consts";

export default {

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
			this.setExportInputs(
				this.location, {
					exportType: this.selectedExportType,
					formatType: this.selectedExportFormat,
				},
			);

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
