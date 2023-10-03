<template>
	<b-field
		class="relative-select"
		:label-for="$attrs.name"
		:type="type"
		:message="message"
	>
		<template #label>
			{{ $t(label) }}
			<span v-if="isOptional" class="optional-text has-text-weight-normal is-italic">
				- {{ $t('Optional') }}
			</span>
		</template>

		<MultiSelect
			v-bind="$attrs"
			v-on="$listeners"
			label="value"
			track-by="code"
			searchable
			:id="$attrs.name"
			:class="inputClass"
			:placeholder="$t('Click to select')"
			:select-label="$t('Press enter to select')"
			:selected-label="$t('Selected')"
			:deselect-label="$t('Press enter to remove')"
		>
			<span slot="noOptions">{{ $t("List is empty")}}</span>
		</MultiSelect>
	</b-field>
</template>

<script>
export default {
	name: "MultiSelectWithLabel",

	inheritAttrs: false,

	props: {
		type: {
			type: String,
			default: "",
		},

		message: {
			type: String,
			default: "",
		},

		label: {
			type: String,
			required: true,
		},

		inputClass: {
			type: String,
			default: "",
		},

		isOptional: {
			type: Boolean,
			default: false,
		},
	},
};
</script>
