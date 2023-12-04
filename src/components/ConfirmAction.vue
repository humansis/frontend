<template>
	<v-dialog
		v-model="dialog"
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
							size="large"
						/>
					</v-col>

					<v-col cols="10">
						<span>{{ $t(confirmMessage) }}</span>
					</v-col>
				</v-row>

			</v-card-text>

			<v-card-actions>
				<v-spacer />

				<v-btn
					:color="closeButtonColor"
					variant="elevated"
					class="text-none"
					@click="dialog = false"
				>
					{{ $t(closeButtonName) }}
				</v-btn>

				<v-btn
					:color="confirmButtonColor"
					variant="elevated"
					class="text-none"
					@click="actionConfirmed"
				>
					{{ $t(confirmButtonName) }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	name: "ConfirmAction",

	emits: ["modalClosed", "actionConfirmed"],

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
	},

	data() {
		return {
			dialog: false,
		};
	},

	watch: {
		isDialogOpened(value) {
			this.dialog = value;
		},

		dialog(value) {
			if (!value) {
				this.$emit("modalClosed");
			}
		},
	},

	methods: {
		actionConfirmed() {
			this.dialog = false;
			this.$emit("actionConfirmed");
		},
	},
};
</script>
