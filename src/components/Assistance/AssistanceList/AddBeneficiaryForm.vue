<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field label="Beneficiaries">
				<MultiSelect
					v-model="formModel.beneficiaries"
					searchable
					placeholder="Beneficiaries"
					:disabled="formDisabled"
					:options="options.beneficiaries"
				/>
			</b-field>

			<b-field
				label="Justification"
			>
				<b-input
					v-model="formModel.justification"
					placeholder="Justification"
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
	name: "AddBeneficiaryForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	data() {
		return {
			options: {
				beneficiaries: [],
			},
		};
	},

	methods: {
		submitForm() {
			this.$emit("formSubmitted", this.formModel);
		},

		closeForm() {
			this.$emit("formClosed");
		},

	},
};
</script>
