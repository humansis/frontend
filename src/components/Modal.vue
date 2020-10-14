<template>
	<b-modal
		:active="active"
		trap-focus
		aria-role="dialog"
		aria-modal
		:can-cancel="canCancel"
		:destroy-on-hide="false"
	>
		<template>
			<div class="modal-card" style="width: auto">
				<header class="modal-card-head">
					<p class="modal-card-title">{{ header }}</p>
					<button
						type="button"
						class="delete"
						@click="$emit('close')"
					/>
				</header>
				<slot name="content"/>
			</div>
		</template>
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
