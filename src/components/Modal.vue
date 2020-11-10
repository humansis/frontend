<template>
	<b-modal
		v-model="active"
		has-modal-card
		trap-focus
		aria-role="dialog"
		destroy-on-hide
		aria-modal
		:can-cancel="canCancel"
	>
		<div class="modal-card">
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
	},
};
</script>
