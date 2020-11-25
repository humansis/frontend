<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Donor Name"
				:type="validateType('fullName')"
				:message="validateMsg('fullName', 'Required')"
			>
				<b-input
					v-model="formModel.fullName"
					:disabled="formDisabled"
					@blur="validate('fullName')"
				/>
			</b-field>

			<b-field
				label="Short Name"
				:type="validateType('shortName')"
				:message="validateMsg('shortName', 'Required')"
			>
				<b-input
					v-model="formModel.shortName"
					:disabled="formDisabled"
					@blur="validate('shortName')"
				/>
			</b-field>

			<b-field
				v-if="!formDisabled"
				label="Image"
				:type="validateType('logo')"
			>
				<b-field
					class="file"
				>
					<b-upload
						v-model="formModel.uploadedImage"
						expanded
					>
						<a class="button is-primary is-fullwidth">
							<b-icon icon="upload" />
							<span>
								{{ formModel.uploadedImage ? formModel.uploadedImage.name : "Click to upload"}}
							</span>
						</a>
					</b-upload>

				</b-field>
			</b-field>
			<b-field
				v-if="formDisabled && formModel.logo"
				label="Image"
				:type="validateType('logo')"
			>
				<b-image
					alt="Image"
					ratio="601by235"
					:src="formModel.logo"
				/>

			</b-field>

			<b-field
				label="Notes"
				:type="validateType('notes')"
			>
				<b-input
					v-model="formModel.notes"
					:disabled="formDisabled"
					@blur="validate('notes')"
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
import Validation from "@/mixins/validation";

export default {
	name: "DonorForm",

	mixins: [Validation],

	date() {
		return {
			uploadedImage: null,
		};
	},

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			fullName: {
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
			this.formModel.logo = this.uploadedImage;
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.$v.$reset();
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
