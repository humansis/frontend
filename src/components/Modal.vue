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
		<div class="modal-card">
			<b-loading :is-full-page="false" :active="isWaiting" />
			<header v-if="!customHeader" class="modal-card-head">
				<h2 class="modal-card-title title is-5 mb-0">{{ header }}</h2>
				<button
					v-if="canCancel"
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
		isWaiting: Boolean,

		customHeader: {
			type: Boolean,
			default: false,
		},

		canCancel: {
			type: Boolean,
			required: false,
			default: true,
		},
	},
};
</script>
