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

		<b-input
			v-if="isInputTypeText"
			v-bind="$attrs"
			v-on="$listeners"
			:id="$attrs.name"
			@blur="validateRequired()"
		/>

		<b-numberinput
			v-else
			v-bind="$attrs"
			v-on="$listeners"
			:id="$attrs.name"
			@blur="validateRequired()"
		/>
	</b-field>
</template>

<script>
import validation from "@/mixins/validation";
import { GENERAL } from "@/consts";

export default {
	name: "InputWithLabel",

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

		optional: {
			type: Boolean,
			default: false,
		},

		inputType: {
			type: String,
			default: "Text",
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

	computed: {
		isInputTypeText() {
			return this.inputType === GENERAL.INPUT_TYPE.TEXT;
		},
	},
};
</script>
