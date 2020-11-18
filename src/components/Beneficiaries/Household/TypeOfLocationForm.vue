<template>
	<section>
		type of location form
	</section>
</template>

<script>

export default {
	name: "TypeOfLocationForm",

	props: {
		formModel: Object,
	},

	methods: {
		submitTypeOfLocationForm() {
			this.$v.$touch();
		},
	},
};
</script>
