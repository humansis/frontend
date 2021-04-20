<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field>
				<template #label>
					{{ $t('Address Number') }}
				</template>
				<b-input v-model="code" />
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				tag="input"
				class="is-primary"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
export default {
	name: "StartTransactionsForm",

	props: {
		submitButtonLabel: String,
		closeButton: Boolean,
	},

	data() {
		return {
			code: null,
		};
	},

	methods: {
		submitForm() {
			this.$emit("formSubmitted", this.code);
		},

		closeForm() {
			this.$emit("formClosed");
		},

	},
};
</script>
