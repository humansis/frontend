<template>
	<b-field
		:label="$t(label)"
		:label-for="$attrs.name"
		:type="validateRequiredType()"
		:message="validateRequiredMsg()"
		:class="fieldClass"
	>
		<template v-if="optional" #label>
			{{ $t(label) }}
			<span class="optional-text has-text-weight-normal is-italic">
				- {{ $t('Optional') }}
			</span>
		</template>

		<b-datepicker
			v-bind="$attrs"
			v-on="$listeners"
			:id="$attrs.name"
			:placeholder="$t('Click to select')"
			:month-names="months()"
			@blur="validateRequired()"
		/>
	</b-field>
</template>

<script>
import validation from "@/mixins/validation";
import calendarHelper from "@/mixins/calendarHelper";

export default {
	name: "InputWithLabel",

	mixins: [validation, calendarHelper],

	inheritAttrs: false,

	props: {
		validation: {
			type: Object,
			required: false,
		},

		validatedFieldName: {
			type: String,
			required: false,
		},

		validatedObjectName: {
			type: String,
			default: "formModel",
		},

		label: {
			type: String,
			required: true,
		},

		optional: {
			type: Boolean,
			default: false,
		},

		fieldClass: {
			type: String,
			default: "",
		},

		isErrorOrNothing: {
			type: Boolean,
			default: false,
		},
	},

	created() {
		this.prepareValidationRules();
	},
};
</script>
