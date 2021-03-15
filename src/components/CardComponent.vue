<template>
	<div class="card">
		<header v-if="title" class="card-header">
			<h2 class="card-header-title">
				<b-icon v-if="icon" :icon="icon" />
				{{ title }}
			</h2>
			<a
				v-if="headerIcon"
				href="#"
				class="card-header-icon"
				aria-label="more options"
				@click.prevent="headerIconClick"
			>
				<b-icon :icon="headerIcon" custom-size="default" />
			</a>
		</header>
		<div class="card-content">
			<slot />
		</div>
	</div>
</template>

<script>
export default {
	name: "CardComponent",
	props: {
		title: {
			type: String,
			default: null,
		},
		icon: {
			type: String,
			default: null,
		},
		headerIcon: {
			type: String,
			default: null,
		},
	},
	methods: {
		headerIconClick() {
			this.$emit("headerIconClick");
		},
	},
};
</script>
