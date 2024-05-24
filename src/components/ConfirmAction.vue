<template>
	<v-dialog
		v-model="isOpened"
		width="400"
	>
		<v-card>
			<v-card-title>
				<span class="text-h7">{{ $t(confirmTitle) }}</span>
			</v-card-title>

			<v-divider />

			<v-card-text>
				<v-row>
					<v-col
						v-if="prependIcon"
						cols="2"
						class="d-flex align-self-center"
					>
						<v-icon
							:icon="prependIcon"
							:color="prependIconColor"
							size="x-large"
						/>
					</v-col>

					<v-col cols="10">
						<span class="text-body-2">{{ $t(confirmMessage) }}</span>
					</v-col>
				</v-row>
			</v-card-text>

			<v-card-actions>
				<v-spacer />

				<v-btn
					v-if="isCloseButtonVisible"
					:color="closeButtonColor"
					:data-cy="identifierBuilder(`${closeButtonName}-confirm-button`, false)"
					variant="elevated"
					class="text-none"
					@click="isOpened = false"
				>
					{{ $t(closeButtonName) }}
				</v-btn>

				<v-btn
					v-if="isConfirmButtonVisible"
					:color="confirmButtonColor"
					:data-cy="identifierBuilder(`${confirmButtonName}-confirm-button`, false)"
					variant="elevated"
					class="text-none"
					@click="onActionConfirmed"
				>
					{{ $t(confirmButtonName) }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import identifierBuilder from "@/mixins/identifierBuilder";

export default {
	name: "ConfirmAction",

	emits: ["modalClosed", "actionConfirmed"],

	mixins: [identifierBuilder],

	props: {
		isDialogOpened: {
			type: Boolean,
			default: false,
		},

		confirmTitle: {
			type: String,
			required: true,
		},

		confirmMessage: {
			type: String,
			default: "",
		},

		isCloseButtonVisible: {
			type: Boolean,
			default: true,
		},

		isConfirmButtonVisible: {
			type: Boolean,
			default: true,
		},

		closeButtonName: {
			type: String,
			default: "Close",
		},

		closeButtonColor: {
			type: String,
			default: "white",
		},

		confirmButtonName: {
			type: String,
			default: "Remove",
		},

		confirmButtonColor: {
			type: String,
			default: "red-lighten-1",
		},

		prependIcon: {
			type: String,
			default: "",
		},

		prependIconColor: {
			type: String,
			default: "",
		},

		dataCy: {
			type: String,
			default: "",
		},
	},

	data() {
		return {
			isOpened: false,
		};
	},

	watch: {
		isDialogOpened(value) {
			this.isOpened = value;
		},

		isOpened(value) {
			if (!value) {
				this.$emit("modalClosed");
			}
		},
	},

	methods: {
		onActionConfirmed() {
			this.isOpened = false;
			this.$emit("actionConfirmed");
		},
	},
};
</script>
