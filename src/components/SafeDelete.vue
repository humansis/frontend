<template>
	<b-tooltip :label="tooltip" :active="isActive" type="is-danger">
		<b-button
			type="is-danger"
			size="is-small"
			:disabled="disabled"
			@click="confirmDelete"
		>
			<b-icon :icon="icon" />
		</b-button>
	</b-tooltip>
</template>

<script>
export default {
	name: "SafeDelete",

	props: {
		icon: {
			type: String,
			required: true,
		},
		entity: String,
		tooltip: String,
		id: Number,
		hasConfirmMessage: Boolean,
		disabled: {
			type: Boolean,
			default: false,
		},
	},

	computed: {
		isActive() {
			return this.tooltip?.length !== 0;
		},
	},

	methods: {
		confirmDelete() {
			let message = this.$t("Are you sure");
			let title = this.$t("Deleting");
			let confirmMessage = this.$t("Deleted");

			if (this.entity) {
				message = `${message} ${this.$t("you want to delete")} ${this.entity}`;
				title = `${title} ${this.entity}`;
				confirmMessage = `${this.entity} ${confirmMessage}`;
			}

			this.$buefy.dialog.confirm({
				title,
				message: `${message}?`,
				confirmText: "Delete",
				type: "is-danger",
				hasIcon: true,
				onConfirm: () => {
					this.$emit("submitted", this.id);
					if (this.hasConfirmMessage) {
						this.$buefy.toast.open(`${confirmMessage}!`);
					}
				},
			});
		},
	},
};
</script>
