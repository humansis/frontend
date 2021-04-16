<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				:label="$t('Name')"
				:type="validateType('name')"
				:message="validateMsg('name')"
			>
				<b-input
					v-model="formModel.name"
					:disabled="formDisabled || editing"
					@blur="validate('name')"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Unit') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.unit"
					:disabled="formDisabled"
					@blur="validate('unit')"
				/>
			</b-field>

			<b-field
				:label="$t('Image')"
				:type="validateType('uploadedImage')"
				:message="validateMsg('uploadedImage')"
			>
				<b-field
					v-if="!formDisabled"
					class="file"
				>
					<b-upload v-model="formModel.uploadedImage" expanded>
						<a class="button is-primary is-fullwidth">
							<b-icon icon="upload" />
							<span>
								{{ formModel.uploadedImage ? formModel.uploadedImage.name : $t("Click to Upload")}}
							</span>
						</a>
					</b-upload>
				</b-field>
			</b-field>

			<b-field v-if="formDisabled && formModel.image">
				<b-image
					alt="Image"
					ratio="601by235"
					:src="formModel.image"
				/>

			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button
				v-if="closeButton"
				@click="closeForm"
			>
				{{ $t('Close') }}
			</b-button>
			<b-button
				v-if="!formDisabled"
				tag="input"
				class="is-primary"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
import { required, requiredIf } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";

export default {
	name: "ProductForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
		editing: Boolean,
	},

	validations: {
		formModel: {
			name: { required },
			unit: {},
			uploadedImage: { required: requiredIf((form) => !form.image) },
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

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
