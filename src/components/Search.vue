<template>
	<b-field>
		<b-input
			v-model="value"
			placeholder="Search..."
			type="search"
			icon="search"
			@keypress.enter.native="onSearch"
		/>
	</b-field>
</template>

<script>
export default {
	name: "Search",

	data() {
		return {
			value: "",
			timer: null,
		};
	},

	watch: {
		value() {
			this.onSearch();
		},
	},

	methods: {
		onSearch(event) {
			clearTimeout(this.timer);
			if (event) {
				this.$emit("search", this.value);
			} else {
				this.timer = setTimeout(() => {
					this.$emit("search", this.value);
				}, 1000);
			}
		},
	},
};
</script>
