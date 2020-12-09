<template>
	<b-modal
		:active="active"
		has-modal-card
		trap-focus
		aria-role="dialog"
		destroy-on-hide
		aria-modal
		:can-cancel="canCancel"
		@close="$emit('close')"
	>
		<div :class="modalCardClass">
			<header class="modal-card-head">
				<p class="modal-card-title">{{ header }}</p>

				<button
					type="button"
					class="delete"
					@click="$emit('close')"
				/>
			</header>

			<slot />
		</div>
	</b-modal>
</template>

<script>
export default {
	name: "Modal",

	props: {
		active: Boolean,
		header: String,
		canCancel: Boolean,
		isSmall: {
			type: Boolean,
			default: false,
		},
	},

	computed: {
		modalCardClass() {
			return this.isSmall ? "modal-card small-modal" : "modal-card";
		},
	},
};
</script>
