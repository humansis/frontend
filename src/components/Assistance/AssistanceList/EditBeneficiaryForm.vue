<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Village"
			>
				<MultiSelect
					v-model="formModel.addressAdm3Id"
					searchable
					placeholder="Village"
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="villages"
				/>
			</b-field>

			<b-field
				label="Address Street"
			>
				<b-input
					v-model="formModel.addressStreet"
					placeholder="Address Street"
					:disabled="formDisabled"
				/>
			</b-field>
		</section>

		<footer class="modal-card-foot">
			<button v-if="closeButton" class="button" type="button" @click="closeForm">
				Close
			</button>
			<b-button
				v-if="!formDisabled"
				tag="input"
				class="is-success"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
export default {
	name: "EditBeneficiaryForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	data() {
		return {

		};
	},

	methods: {
		submitForm() {
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.$v.$reset();
		},

		closeForm() {
			this.$emit("formClosed");
		},

	},
};
</script>
