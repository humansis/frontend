<template>
	<form>
		<section class="modal-card-body">
			<b-field label="Who">
				<b-input
					v-model="formModel.who"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field label="Where">
				<b-input
					v-model="formModel.where"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field label="What">
				<b-input
					v-model="formModel.what"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field label="Status">
				<b-input
					v-model="formModel.status"
					:disabled="formDisabled"
				/>
			</b-field>

		</section>

		<footer class="modal-card-foot">
			<button
				v-if="closeButton"
				class="button"
				type="button"
				@click="closeForm"
			>
				Close
			</button>
			<b-button
				v-if="!formDisabled"
				tag="input"
				class="is-success"
				native-type="submit"
			/>
		</footer>
	</form>
</template>

<script>

export default {
	name: "ImportForm",

	props: {
		formModel: Object,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	methods: {
		closeForm() {
			this.$emit("formClosed");
		},
	},
};
</script>
