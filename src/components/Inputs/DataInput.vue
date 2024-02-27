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
			<span>{{ $t(label) }}
				<i v-if="optional" class="optional-text">- {{ $t('Optional') }}</i>
			</span>
		</template>
	</v-text-field>
</template>

<script>
import identifierBuilder from "@/mixins/identifierBuilder";

export default {
	name: "DataInput",

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
	},
};
</script>
