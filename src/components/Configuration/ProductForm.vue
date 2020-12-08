<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Name"
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
				label="Unit"
				:type="validateType('unit')"
			>
				<b-input
					v-model="formModel.unit"
					:disabled="formDisabled"
					@blur="validate('unit')"
				/>
			</b-field>
			<b-field
				label="Image"
				:type="validateType('image')"
			>
				<b-field
					v-if="!formDisabled"
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
			<b-field v-if="formDisabled && formModel.image">
				<b-image
					alt="Image"
					ratio="601by235"
					src="https://www.hello.com/img_/hellowithwaves.png"
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
	name: "ProductForm",

	mixins: [Validation],

	data() {
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
			name: { required },
			unit: {},
			image: {},
		},
	},

	methods: {
		submitForm() {
			this.formModel.image = this.uploadedImage;
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
