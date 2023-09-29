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

		<MultiSelect
			v-bind="$attrs"
			v-on="$listeners"
			:id="$attrs.name"
			:label="variableToShow"
			:track-by="trackBy"
			:placeholder="$t('Click to select')"
			:select-label="$t('Press enter to select')"
			:selected-label="$t('Selected')"
			:deselect-label="$t('Press enter to remove')"
			:searchable="isSearchable"
			:multiple="isMultipleSelectAvailable"
			:class="validateRequiredMultiselect()"
			@select="validateRequired()"
		>
			<span slot="noOptions">{{ $t("List is empty")}}</span>
		</MultiSelect>

		<slot name="checkBox" />
	</b-field>
</template>

<script>
import validation from "@/mixins/validation";

export default {
	name: "MultiSelectWithLabel",

	mixins: [validation],

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

		fieldClass: {
			type: String,
			default: "",
		},

		variableToShow: {
			type: String,
			default: "value",
		},

		trackBy: {
			type: String,
			default: "code",
		},

		isSearchable: {
			type: Boolean,
			default: true,
		},

		isErrorOrNothing: {
			type: Boolean,
			default: false,
		},

		optional: {
			type: Boolean,
			default: false,
		},

		isMultipleSelectAvailable: {
			type: Boolean,
			default: false,
		},
	},

	created() {
		this.prepareValidationRules();
	},
};
</script>
