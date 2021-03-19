<template>
	<b-modal
		:active="active"
		has-modal-card
		trap-focus
		aria-role="dialog"
		destroy-on-hide
		aria-modal
		:can-cancel="canCancel && !isWaiting"
		@close="$emit('close')"
	>
		<div :class="modalCardClass">
			<b-loading :is-full-page="false" :active="isWaiting" />
			<header class="modal-card-head">
				<h2 class="modal-card-title title is-5 mb-0">{{ header }}</h2>

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
		isWaiting: Boolean,
	},

	computed: {
		modalCardClass() {
			return this.isSmall ? "modal-card small-modal" : "modal-card";
		},
	},
};
</script>
