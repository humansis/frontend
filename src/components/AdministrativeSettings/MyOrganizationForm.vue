<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Organization Name"
				:type="getValidationType('name')"
				:message="getValidationMessage('name', 'Required')"
			>
				<b-input
					v-model="formModel.name"
					placeholder="Organization Name"
					:disabled="formDisabled"
					@blur="validateInput('name')"
				/>
			</b-field>

			<b-field
				v-if="!formDisabled"
				label="Organizational Logo"
				:type="getValidationType('logo')"
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
			>
				<b-image
					alt="Image"
					ratio="601by235"
					:src="formModel.logo"
				/>

			</b-field>

			<b-field
				label="Font To Apply To The Pdf"
				:type="getValidationType('font')"
			>
				<MultiSelect
					v-model="formModel.font"
					searchable
					placeholder="Font To Apply To The Pdf"
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="fonts"
					@blur="validateInput('font')"
				/>
			</b-field>

			<b-field
				label="Organization Primary Color"
				:type="getValidationType('primaryColor')"
			>
				<VSwatches
					v-model="formModel.primaryColor"
					popover-x="right"
					popover-y="top"
					swatches="text-advanced"
					:disabled="formDisabled"
					@blur="validateInput('primaryColor')"
				/>
			</b-field>

			<b-field
				label="Organization Secondary Color"
				:type="getValidationType('secondaryColor')"
			>

				<VSwatches
					v-model="formModel.secondaryColor"
					row-lenght="6"
					popover-x="right"
					popover-y="top"
					swatches="text-advanced"
					:disabled="formDisabled"
					@blur="validateInput('secondaryColor')"
				/>
			</b-field>

			<b-field
				label="Pdf Footer Content"
				:type="getValidationType('footerContent')"
			>
				<b-input
					v-model="formModel.footerContent"
					placeholder="Pdf Footer Content"
					:disabled="formDisabled"
					@blur="validateInput('footerContent')"
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
	name: "MyOrganizationForm",

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
			logo: {},
			font: {},
			primaryColor: {},
			secondaryColor: {},
			footerContent: {
				required,
			},
		},
	},

	data() {
		return {
			fonts: [
				{
					id: "arial",
					name: "Arial",
				},
				{
					id: "helvetica",
					name: "Helvetica",
				},
				{
					id: "courier",
					name: "Courier",
				},
			],
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
