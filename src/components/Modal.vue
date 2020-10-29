<template>
	<b-modal
		trap-focus
		aria-role="dialog"
		scroll="keep"
		aria-modal
		:active="active"
		:can-cancel="canCancel"
		:destroy-on-hide="false"
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
			<slot/>
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

	data() {
		return {
			isModalActive: false,
		};
	},
};
</script>
