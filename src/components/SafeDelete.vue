<template>
	<b-tooltip :label="tooltip" :active="isActive">
		<button class="button is-light" @click="confirmDelete">
			<b-icon
				:icon="icon"
				type="is-danger"
				size="is-medium"
			/>
		</button>
	</b-tooltip>
</template>

<script>
export default {
	name: "SafeDelete",

	props: {
		icon: String,
		entity: String,
		tooltip: String,
		id: Number,
		hasConfirmMessage: Boolean,
	},

	computed: {
		isActive() {
			return !!(this.tooltip && this.tooltip.length !== 0);
		},
	},

	methods: {
		confirmDelete() {
			let message = "Are you sure";
			let title = "Deleting";
			let confirmMessage = "Deleted";
			if (this.entity) {
				message = `${message} you want to delete ${this.entity}`;
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
