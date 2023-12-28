<template>
	<v-card-text>
		<DataInput
			v-model="formModel.name"
			:disabled="formDisabled"
			:error-messages="validationMsg('name')"
			label="Name"
			name="name"
			class="mb-6"
			@update:modelValue="validate('name')"
		/>

		<v-radio-group
			v-model="formModel.type"
			:error-messages="validationMsg('type')"
			class="category-types radio-group"
			@update:modelValue="validate('type')"
		>
			<div
				v-for="({ code, value }) of options.categoryTypes"
				class="mb-3"
				:key="`category-type-${code}`"
			>
				<v-radio
					:disabled="formDisabled"
					:value="value"
					@update:modelValue="validate('type')"
				>
					<template v-slot:label>
						{{ $t(value) }}

						<SvgIcon
							:items="[{ code, value }]"
							class="ml-2"
						/>
					</template>
				</v-radio>
			</div>
		</v-radio-group>

		<FileUpload
			v-if="!formDisabled"
			v-model="formModel.uploadedImage"
			:error-messages="validationMsg('uploadedImage')"
			prepend-icon=""
			hide-details="auto"
			variant="outlined"
			density="compact"
			accept="image/*"
			class="mt-1"
			@update:modelValue="validate('uploadedImage')"
		/>

		<v-img
			v-if="formDisabled && formModel.image"
			:src="formModel.image"
			alt="item-image"
			height="125"
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			class="text-none"
			size="small"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="closeForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			v-if="!formDisabled"
			color="primary"
			size="small"
			class="text-none ml-3"
			variant="elevated"
			@click="submitForm"
		>
			{{ $t(submitButtonLabel) }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import DataInput from "@/components/Inputs/DataInput";
import FileUpload from "@/components/Inputs/FileUpload";
import SvgIcon from "@/components/SvgIcon";
import validation from "@/mixins/validation";
import { required, requiredIf } from "@vuelidate/validators";

export default {
	name: "CategoryForm",

	emits: [
		"formSubmitted",
		"formClosed",
	],

	components: {
		SvgIcon,
		DataInput,
		FileUpload,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				name: { required },
				type: { required },
				uploadedImage: { required: requiredIf(!this.formModel.image) },
			},
		};
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
			this.v$.$touch();
			if (this.v$.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.v$.$reset();
		},

		closeForm() {
			this.$emit("formClosed");
			this.v$.$reset();
		},
	},
};
</script>
