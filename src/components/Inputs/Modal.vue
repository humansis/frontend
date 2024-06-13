<template>
	<v-dialog
		v-model="$attrs.modelValue"
		width="960"
		scrollable
		data-cy="modal-card"
	>
		<v-card>
			<template v-if="!customHeader">
				<v-card-title
					:data-cy="identifierBuilder(`${header}-text`)"
					class="text-h6 font-weight-bold"
				>
					{{ $t(header) }}
				</v-card-title>

				<v-divider />
			</template>

			<slot />
		</v-card>
	</v-dialog>
</template>

<script>
import identifierBuilder from "@/mixins/identifierBuilder";

export default {
	name: "Modal",

	mixins: [identifierBuilder],

	props: {
		header: {
			type: String,
			default: "",
		},

		customHeader: {
			type: Boolean,
			default: false,
		},

		dataCy: {
			type: String,
			default: "",
		},
	},
};
</script>
