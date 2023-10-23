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
					:disabled="formDisabled"
					@blur="validate('name')"
				/>
			</b-field>

			<b-field
				:label="$t('Type')"
				:type="validateType('type')"
				:message="validateMsg('type')"
				:addons="false"
			>
				<div
					v-for="({code, value}) of options.categoryTypes"
					class="mb-3"
					:key="`category-type-${code}`"
				>
					<b-radio
						v-model="formModel.type"
						:native-value="code"
						:disabled="formDisabled"
						@blur="validate('type')"
					>
						<div class="is-flex is-align-items-center">
							{{ value }}
							<SvgIcon class="ml-2" :items="[{code, value}]" />
						</div>

					</b-radio>

				</div>
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
				class="is-primary"
				native-type="submit"
			>
				{{ $t(submitButtonLabel) }}
			</b-button>
		</footer>
	</form>
</template>

<script>
import { required, requiredIf } from "vuelidate/lib/validators";
import SvgIcon from "@/components/SvgIcon";
import validation from "@/mixins/validation";

export default {
	name: "CategoryForm",

	components: {
		SvgIcon,
	},

	mixins: [validation],

	validations: {
		formModel: {
			name: { required },
			type: { required },
			uploadedImage: { required: requiredIf((form) => !form.image) },
		},
	},

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
		editing: Boolean,
	},

	data() {
		return {
			options: {
				// TODO Get this from API (change it everywhere)
				categoryTypes: [
					{
						code: "Food",
						value: this.$t("Food"),
					},
					{
						code: "Non-Food",
						value: this.$t("Non-Food"),
					},
					{
						code: "Cashback",
						value: this.$t("Cashback"),
					},
				],
			},
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
