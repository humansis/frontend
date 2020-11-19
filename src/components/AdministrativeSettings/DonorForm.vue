<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Donor Name"
				:type="getValidationType('fullname')"
				:message="getValidationMessage('fullname', 'Required')"
			>
				<b-input
					v-model="formModel.fullname"
					placeholder="Donor Name"
					:disabled="formDisabled"
					@blur="validateInput('fullname')"
				/>
			</b-field>

			<b-field
				label="Short Name"
				:type="getValidationType('shortName')"
				:message="getValidationMessage('shortName', 'Required')"
			>
				<b-input
					v-model="formModel.shortName"
					placeholder="Short Name"
					:disabled="formDisabled"
					@blur="validateInput('shortName')"
				/>
			</b-field>

			<b-field
				v-if="!formDisabled"
				label="Image"
				:type="getValidationType('logo')"
			>
				<b-field
					class="file"
				>
					<b-upload
						v-model="formModel.logo"
						expanded
					>
						<a class="button is-primary is-fullwidth">
							<b-icon icon="upload" />
							<span>
								{{ formModel.logo ? formModel.logo.name : "Click to upload"}}
							</span>
						</a>
					</b-upload>

				</b-field>
			</b-field>
			<b-field
				v-if="formDisabled && formModel.logo"
				label="Image"
				:type="getValidationType('logo')"
			>
				<b-image
					alt="Image"
					ratio="601by235"
					:src="formModel.logo"
				/>

			</b-field>

			<b-field
				label="Notes"
				:type="getValidationType('notes')"
			>
				<b-input
					v-model="formModel.notes"
					placeholder="Notes"
					:disabled="formDisabled"
					@blur="validateInput('notes')"
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
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";

export default {
	name: "DonorForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			fullname: {
				required,
			},
			shortName: {
				required,
			},
			logo: {},
			notes: {},
		},
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

		validateInput(fieldName) {
			this.$v.formModel[fieldName].$touch();
		},

		getValidationMessage(fieldName, message) {
			return this.$v.formModel[fieldName].$error ? message : "";
		},

		getValidationType(fieldName) {
			let result = "";
			if (this.$v.formModel[fieldName].$dirty) {
				result = this.$v.formModel[fieldName].$error ? "is-danger" : "is-success";
			}
			return result;
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
