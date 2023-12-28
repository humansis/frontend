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
				v-bind="props"
				:label="label"
				:name="name"
				:error-messages="$attrs['error-messages']"
				:disabled="disabled"
				:optional="optional"
				:placeholder="placeholder"
				prepend-inner-icon="calendar"
				autocomplete="off"
				class="mb-6"
			/>
		</template>

		<v-date-picker
			v-model="selectedDate"
			:min="minDate"
			:max="maxDate"
			locale="en-in"
			height="350"
			width="350"
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

	props: {
		minDate: {
			type: Date,
			required: false,
		},

		maxDate: {
			type: Date,
			required: false,
		},

		label: {
			type: String,
			required: true,
		},

		name: {
			type: String,
			default: "",
		},

		modelValue: {
			type: String,
			default: "",
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
.v-date-picker-month__day {
	height: 2.25rem;
	width: 2.5rem;
}

.v-date-picker-month__weekday {
	font-weight: bold;
}

.v-date-picker-months,
.v-date-picker-years {
	overflow-y: hidden;
}
</style>
