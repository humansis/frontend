<template>
	<v-menu
		v-model="isDatePickerOpened"
		:close-on-content-click="false"
		:nudge-right="40"
		:disabled="disabled"
		transition="scale-transition"
	>
		<template v-slot:activator="{ props }">
			<DataInput
				v-model="formattedDate"
				v-bind="{ ...props, ...$attrs }"
				:label="label"
				:name="name"
				:error-messages="$attrs['error-messages']"
				:disabled="disabled"
				:optional="optional"
				:placeholder="placeholder"
				:clearable="clearable"
				prepend-inner-icon="calendar"
				autocomplete="off"
				readonly
			/>
		</template>

		<v-date-picker
			v-model="selectedDate"
			:min="minDate"
			:max="maxDate"
			locale="en-in"
			hide-header
			no-title
			@update:modelValue="onDatePickerValueChanged"
		/>
	</v-menu>
</template>

<script>
import DataInput from "@/components/Inputs/DataInput";

export default {
	name: "DatePicker",

	components: {
		DataInput,
	},

	inheritAttrs: false,

	props: {
		modelValue: {
			type: Date,
			default: "",
		},

		minDate: {
			type: Date,
			default: null,
		},

		maxDate: {
			type: Date,
			default: null,
		},

		label: {
			type: String,
			required: true,
		},

		name: {
			type: String,
			default: "",
		},

		clearable: {
			type: Boolean,
			default: true,
		},

		disabled: {
			type: Boolean,
			default: false,
		},

		optional: {
			type: Boolean,
			default: false,
		},

		placeholder: {
			type: String,
			default: "",
		},
	},

	data() {
		return {
			isDatePickerOpened: false,
			selectedDate: this.modelValue || null,
		};
	},

	computed: {
		formattedDate: {
			get() {
				return this.selectedDate
					? this.$moment(new Date(this.selectedDate)).format("YYYY-MM-DD")
					: null;
			},
		},
	},

	watch: {
		modelValue(value) {
			this.selectedDate = value;
		},
	},

	methods: {
		onDatePickerValueChanged() {
			this.isDatePickerOpened = false;
			this.$emit("update:modelValue", this.selectedDate);
		},
	},
};
</script>

<style lang="scss">
.v-date-picker-month__weekday {
	font-weight: bold;
}
</style>
