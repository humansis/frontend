<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field label="First Name">
				<b-input v-model="formModel.givenName" disabled />
			</b-field>

			<b-field label="Family Name">
				<b-input v-model="formModel.familyName" disabled />
			</b-field>

			<b-field label="Gender">
				<b-input v-model="formModel.gender" disabled />
			</b-field>

			<b-field label="Date Of Birth">
				<b-input v-model="formModel.dateOfBirth" disabled />
			</b-field>

			<b-field label="Residency Status">
				<b-input v-model="formModel.residencyStatus" disabled />
			</b-field>

			<b-field label="Status">
				<b-input v-model="formModel.residencyStatus" disabled />
			</b-field>

			<b-field label="Add A Referral Type">
				<b-checkbox
					v-model="addAReferral"
					:disabled="disabled"
				/>
			</b-field>

			<b-field v-if="addAReferral" label="Referral Type">
				<MultiSelect
					v-model="formModel.referralType"
					:disabled="disabled"
					searchable
					placeholder="Click to select..."
					:options="options.referralType"
				/>
			</b-field>

			<b-field v-if="addAReferral" label="Comment">
				<b-input
					v-model="formModel.comment"
					:disabled="disabled"
				/>
			</b-field>

			<b-field label="Justification For Adding">
				<b-input
					v-model="formModel.justificationForAdding"
					disabled
				/>
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="closeForm">
				Close
			</b-button>
			<b-button
				v-if="!disabled"
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
	name: "EditBeneficiaryForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		disabled: Boolean,
	},

	data() {
		return {
			addAReferral: false,
			options: {
				// TODO Fetch Referral types
				referralType: ["Health", "Protection", "Shelter", "Nutrition", "Other"],
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
