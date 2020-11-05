<template>
	<button class="button is-light" @click="confirmDelete">
		<b-icon
			:icon="icon"
			type="is-danger"
			size="is-medium"
		/>
	</button>
</template>

<script>
export default {
	name: "SafeDelete",

	props: {
		icon: String,
		entity: String,
	},

	methods: {
		confirmDelete() {
			let message = "Are you sure";
			let title = "Deleting";
			let confirmMessage = "Deleted";
			if (this.entity !== undefined) {
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
				onConfirm: () => this.$buefy.toast.open(`${confirmMessage}!`),
			});
		},
	},
};

</script>

<style scoped>

</style>
