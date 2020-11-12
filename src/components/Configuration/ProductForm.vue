<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Name"
				:type="getValidationType('name')"
				:message="getValidationMessage('name', 'Required')"
			>
				<b-input
					v-model="formModel.name"
					placeholder="Name"
					:disabled="formDisabled"
					@blur="validateInput('name')"
				/>
			</b-field>

			<b-field
				label="Unit"
				:type="getValidationType('unit')"
			>
				<b-input
					v-model="formModel.unit"
					placeholder="Unit"
					:disabled="formDisabled"
					@blur="validateInput('unit')"
				/>
			</b-field>
			<b-field
				label="Image"
				:type="getValidationType('image')"
			>
				<b-field
					class="file"
					v-if="!formDisabled"
				>
					<b-upload
						v-model="formModel.image"
						expanded
					>
						<a class="button is-primary is-fullwidth">
							<b-icon icon="upload" />
							<span>
								{{ formModel.image ? formModel.image.name : "Click to upload"}}
							</span>
						</a>
					</b-upload>

				</b-field>
			</b-field>
			<b-field
				v-if="formDisabled && formModel.image"
			>
				<b-image
					alt="Image"
					ratio="601by235"
					src="https://www.hello.com/img_/hellowithwaves.png"
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
import { required } from "vuelidate/lib/validators";

export default {
	name: "ProductForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			name: {
				required,
			},
			unit: {
			},
			image: {
			},
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
