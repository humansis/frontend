<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Organization Name"
				:type="validateType('name')"
				:message="validateMsg('name', 'Required')"
			>
				<b-input
					v-model="formModel.name"
					:disabled="formDisabled"
					@blur="validate('name')"
				/>
			</b-field>

			<b-field
				v-if="!formDisabled"
				label="Organizational Logo"
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
			>
				<b-image
					alt="Image"
					ratio="601by235"
					:src="formModel.logo"
				/>

			</b-field>

			<b-field
				label="Font To Apply To The Pdf"
				:type="validateType('font')"
			>
				<MultiSelect
					v-model="formModel.font"
					searchable
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="fonts"
					@blur="validate('font')"
				/>
			</b-field>

			<b-field
				label="Organization Primary Color"
				:type="validateType('primaryColor')"
			>
				<VSwatches
					v-model="formModel.primaryColor"
					popover-x="right"
					popover-y="top"
					swatches="text-advanced"
					:disabled="formDisabled"
					@blur="validate('primaryColor')"
				/>
			</b-field>

			<b-field
				label="Organization Secondary Color"
				:type="validateType('secondaryColor')"
			>

				<VSwatches
					v-model="formModel.secondaryColor"
					row-lenght="6"
					popover-x="right"
					popover-y="top"
					swatches="text-advanced"
					:disabled="formDisabled"
					@blur="validate('secondaryColor')"
				/>
			</b-field>

			<b-field
				label="Pdf Footer Content"
				:type="validateType('footerContent')"
			>
				<b-input
					v-model="formModel.footerContent"
					:disabled="formDisabled"
					@blur="validate('footerContent')"
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
	name: "MyOrganizationForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			name: { required },
			logo: {},
			font: {},
			primaryColor: {},
			secondaryColor: {},
			footerContent: { required },
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

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
