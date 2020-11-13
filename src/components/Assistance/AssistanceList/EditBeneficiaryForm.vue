<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="First Name"
			>
				<b-input
					v-model="formModel.firstName"
					disabled
					placeholder="First Name"
				/>
			</b-field>

			<b-field
				label="Family Name"
			>
				<b-input
					v-model="formModel.familyName"
					disabled
					placeholder="Family Name"
				/>
			</b-field>

			<b-field
				label="Gender"
			>
				<b-input
					v-model="formModel.gender"
					disabled
					placeholder="Gender"
				/>
			</b-field>

			<b-field
				label="Date Of Birth"
			>
				<b-input
					v-model="formModel.dateOfBirth"
					disabled
					placeholder="Date Of Birth"
				/>
			</b-field>

			<b-field
				label="Residency Status"
			>
				<b-input
					v-model="formModel.residencyStatus"
					disabled
					placeholder="Residency Status"
				/>
			</b-field>

			<b-field
				label="Status"
			>
				<b-input
					v-model="formModel.residencyStatus"
					disabled
					placeholder="Status"
				/>
			</b-field>

			<b-field label="Add A Referral Type">
				<b-checkbox v-model="addAReferral" />
			</b-field>

			<b-field
				v-if="addAReferral"
				label="Referral Type"
			>
				<MultiSelect
					v-model="formModel.referralType"
					searchable
					placeholder="Referral Type"
					:options="options.referralType"
				/>
			</b-field>

			<b-field
				v-if="addAReferral"
				label="Comment"
			>
				<b-input
					v-model="formModel.comment"
					placeholder="Comment"
				/>
			</b-field>

			<b-field
				label="Justification For Adding"
			>
				<b-input
					v-model="formModel.justificationForAdding"
					disabled
					placeholder="Justification For Adding"
				/>
			</b-field>
		</section>

		<footer class="modal-card-foot">
			<button v-if="closeButton" class="button" type="button" @click="closeForm">
				Close
			</button>
			<b-button
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
			addAReferral: false,
			options: {
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
