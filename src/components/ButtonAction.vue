<template>
	<v-tooltip
		location="top"
		:disabled="!tooltipText.length"
		:text="$t(tooltipText)"
	>
		<template v-slot:activator="{ props }">
			<v-btn
				v-if="isOnlyIcon"
				v-bind="props"
				:class="['action-button', { disabled }, buttonClass]"
				:disabled="disabled"
				icon=""
				@click.stop="buttonClicked"
			>
				<v-icon :icon="icon" :color="iconColor" />
			</v-btn>

			<v-btn
				v-else-if="!isOnlyIcon && defaultButton"
				:prepend-icon="icon"
				color="primary"
				size="small"
				variant="elevated"
				class="text-none"
				@click.stop="buttonClicked"
			>
				{{ $t(label) }}
			</v-btn>

			<v-btn
				v-else
				v-bind="props"
				:class="['text-none action-button texted-button', { disabled }]"
				:disabled="disabled"
				:size="buttonSize"
				@click.stop="buttonClicked"
			>
				<v-icon :icon="icon" :color="iconColor" />

				<span class="pl-2">{{ label }}</span>
			</v-btn>

			<ConfirmAction
				:is-dialog-opened="isDialogOpened"
				:confirm-title="confirmTitle"
				:confirm-message="confirmMessage"
				:prepend-icon="prependIcon"
				:prepend-icon-color="prependIconColor"
				:close-button-name="closeButtonName"
				:close-button-color="closeButtonColor"
				:confirm-button-name="confirmButtonName"
				:confirm-button-color="confirmButtonColor"
				@modalClosed="modalClosed()"
				@actionConfirmed="$emit('actionConfirmed')"
			/>
		</template>
	</v-tooltip>
</template>

<script>
import ConfirmAction from "@/components/ConfirmAction";

export default {
	name: "ButtonAction",

	components: {
		ConfirmAction,
	},

	props: {
		label: {
			type: String,
			default: "",
		},

		buttonClass: {
			type: String,
			default: "",
		},

		tooltipText: {
			type: String,
			default: "",
		},

		isOnlyIcon: {
			type: Boolean,
			default: true,
		},

		buttonSize: {
			type: String,
			default: "default",
		},

		buttonName: {
			type: String,
			default: "",
		},

		icon: {
			type: String,
			default: "",
		},

		iconColor: {
			type: String,
			default: "",
		},

		isConfirmAction: {
			type: Boolean,
			default: false,
		},

		confirmTitle: {
			type: String,
			default: "",
		},

		confirmMessage: {
			type: String,
			default: "",
		},

		prependIcon: {
			type: String,
			default: "",
		},

		prependIconColor: {
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

		disabled: {
			type: Boolean,
			default: false,
		},

		defaultButton: {
			type: Boolean,
			default: false,
		},

		openConfirmModal: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			isDialogOpened: false,
		};
	},

	watch: {
		openConfirmModal(value) {
			if (value) {
				this.isDialogOpened = value;
			}
		},
	},

	methods: {
		buttonClicked() {
			if (this.isConfirmAction) {
				this.isDialogOpened = true;
			} else {
				this.$emit("actionConfirmed");
			}
		},

		modalClosed() {
			this.isDialogOpened = false;
		},
	},
};
</script>
