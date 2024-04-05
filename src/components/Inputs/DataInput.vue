<template>
	<v-text-field
		:variant="variant"
		:density="density"
		:hide-details="hideDetails"
		:placeholder="$t(placeholder)"
		:name="name"
		:data-cy="identifierBuilder(`${name}-input`)"
		autocomplete="off"
	>
		<template v-slot:label>
			<LabelWithTooltip
				:label="label"
				:label-append-icon-tooltip="labelAppendIconTooltip"
				:label-append-icon="labelAppendIcon"
				:is-optional="optional"
			/>
		</template>
	</v-text-field>
</template>

<script>
import LabelWithTooltip from "@/components/Inputs/Helpers/LabelWithTooltip";
import identifierBuilder from "@/mixins/identifierBuilder";

export default {
	name: "DataInput",

	components: {
		LabelWithTooltip,
	},

	mixins: [identifierBuilder],

	props: {
		label: {
			type: String,
			default: "",
		},

		optional: {
			type: Boolean,
			default: false,
		},

		variant: {
			type: String,
			default: "outlined",
		},

		density: {
			type: String,
			default: "compact",
		},

		hideDetails: {
			type: String,
			default: "auto",
		},

		placeholder: {
			type: String,
			default: "",
		},

		dataCy: {
			type: String,
			default: "",
		},

		name: {
			type: String,
			required: true,
		},

		labelAppendIcon: {
			type: String,
			default: "",
		},

		labelAppendIconTooltip: {
			type: String,
			default: "",
		},
	},
};
</script>
