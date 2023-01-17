<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				:label="$t('Donor Name')"
				:type="validateType('fullname')"
				:message="validateMsg('fullname')"
			>
				<b-input
					v-model="formModel.fullname"
					:disabled="formDisabled"
					@blur="validate('fullname')"
				/>
			</b-field>

			<b-field
				:label="$t('Short Name')"
				:type="validateType('shortname')"
				:message="validateMsg('shortname')"
			>
				<b-input
					v-model="formModel.shortname"
					:disabled="formDisabled"
					@blur="validate('shortname')"
				/>
			</b-field>

			<b-field
				v-if="!formDisabled"
				:type="validateType('logo')"
			>
				<template #label>
					{{ $t('Image') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-field class="file">
					<b-upload
						v-model="formModel.uploadedImage"
						expanded
					>
						<a class="button is-primary is-fullwidth">
							<b-icon icon="upload" />
							<span>
								{{ formModel.uploadedImage
									? formModel.uploadedImage.name : $t("Click to Upload") }}
							</span>
						</a>
					</b-upload>
				</b-field>
			</b-field>

			<b-field
				v-if="formDisabled && formModel.logo"
				:label="$t('Image')"
				:type="validateType('logo')"
			>
				<b-image
					alt="Image"
					ratio="601by235"
					:src="formModel.logo"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Notes') }}<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.notes"
					:disabled="formDisabled"
					@blur="validate('notes')"
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
				class="is-primary"
				native-type="submit"
			>
				{{ $t(submitButtonLabel) }}
			</b-button>
		</footer>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";

export default {
	name: "DonorForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			fullname: { required },
			shortname: { required },
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

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
