<template>
	<v-tooltip
		:disabled="!tooltipText.length"
		:text="$t(tooltipText)"
		location="top"
		content-class="tooltip-top"
	>
		<template v-slot:activator="{ props }">
			<v-btn
				v-if="isOnlyIcon"
				v-bind="props"
				:class="['action-button', $attrs.class, { disabled: isDisabled }]"
				:disabled="isDisabled"
				:loading="isLoading"
				:data-cy="identifierBuilder()"
				icon=""
				@click.stop="onButtonClicked"
			>
				<v-icon :icon="icon" :color="iconColor" />

				<slot name="combinedIcons" />
			</v-btn>

			<v-btn
				v-else-if="defaultButton"
				:disabled="isDisabled"
				:prepend-icon="icon"
				:data-cy="identifierBuilder()"
				color="blue-grey-lighten-4"
				variant="elevated"
				class="text-none"
				@click.stop="onButtonClicked"
			>
				{{ $t(label) }}
			</v-btn>

			<v-btn
				v-else
				v-bind="props"
				:class="['text-none action-button texted-button', $attrs.class, { disabled: isDisabled }]"
				:disabled="isDisabled"
				:loading="isLoading"
				:size="buttonSize"
				:color="color"
				:to="!isDisabled ? to : null"
				:data-cy="identifierBuilder()"
				@click.stop="onButtonClicked"
			>
				<v-icon :icon="icon" :color="iconColor" />

				<span class="pl-2">{{ $t(label) }}</span>
			</v-btn>

			<ConfirmAction
				v-if="isConfirmAction"
				:is-dialog-opened="isDialogOpened"
				:confirm-title="confirmTitle"
				:confirm-message="confirmMessage"
				:prepend-icon="prependIcon"
				:prepend-icon-color="prependIconColor"
				:close-button-name="closeButtonName"
				:close-button-color="closeButtonColor"
				:confirm-button-name="confirmButtonName"
				:confirm-button-color="confirmButtonColor"
				@modalClosed="onModalClosed"
				@actionConfirmed="$emit('actionConfirmed')"
			/>
		</template>
	</v-tooltip>
</template>

<script>
import ConfirmAction from "@/components/ConfirmAction";
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";

export default {
	name: "ButtonAction",

	components: {
		ConfirmAction,
	},

	mixins: [identifierBuilder, permissions],

	props: {
		label: {
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

		color: {
			type: String,
			default: "",
		},

		to: {
			type: Object,
			default: () => {},
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

		dataCy: {
			type: String,
			default: "",
		},

		isLoading: {
			type: Boolean,
			default: false,
		},

		requiredPermissions: {
			type: [String, Array],
			default: null,
		},
	},

	data() {
		return {
			isDialogOpened: false,
		};
	},

	computed: {
		isDisabled() {
			return this.disabled || !this.isUserPermissionGranted(this.requiredPermissions);
		},
	},

	watch: {
		openConfirmModal(value) {
			if (value) {
				this.isDialogOpened = value;
			}
		},
	},

	methods: {
		onButtonClicked() {
			if (this.isConfirmAction) {
				this.isDialogOpened = true;
			} else {
				this.$emit("actionConfirmed");
			}
		},

		onModalClosed() {
			this.isDialogOpened = false;
		},
	},
};
</script>
