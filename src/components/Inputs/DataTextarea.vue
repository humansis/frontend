<template>
	<v-textarea
		:placeholder="$t(placeholder)"
		:name="name"
		:data-cy="identifierBuilder(`${name}-input`)"
		variant="outlined"
		density="compact"
		hide-details="auto"
	>
		<template v-slot:label>
			<span>{{ $t(label) }}
				<i v-if="isOptional" class="optional-text">- {{ $t('Optional') }}</i>
			</span>
		</template>

		<template v-if="hasCopyButton" v-slot:append-inner>
			<v-tooltip
				:text="$t('Copy')"
				location="top"
				content-class="tooltip-top"
			>
				<template v-slot:activator="{ props }">
					<v-btn
						v-bind="props"
						icon="copy"
						@click="$emit('copy')"
					/>
				</template>
			</v-tooltip>
		</template>
	</v-textarea>
</template>

<script>
import identifierBuilder from "@/mixins/identifierBuilder";

export default {
	name: "DataTextarea",

	mixins: [identifierBuilder],

	props: {
		label: {
			type: String,
			default: "",
		},

		placeholder: {
			type: String,
			default: "",
		},

		hasCopyButton: {
			type: Boolean,
			default: false,
		},

		isOptional: {
			type: Boolean,
			default: false,
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
