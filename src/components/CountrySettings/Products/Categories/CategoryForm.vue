<template>
	<v-card-text>
		<DataInput
			v-model="formModel.name"
			:disabled="formDisabled"
			:error-messages="validationMsg('name')"
			:data-cy="prepareComponentIdentifier()"
			label="Name"
			name="name"
			class="mb-4"
			@update:modelValue="onValidate('name')"
		/>

		<h4 :data-cy="identifierBuilder('type-text')">{{ $t('Type') }}</h4>

		<v-radio-group
			v-model="formModel.type"
			:error-messages="validationMsg('type')"
			class="category-types radio-group"
			@update:modelValue="onValidate('type')"
		>
			<v-radio
				v-for="({ code, value }) of options.categoryTypes"
				:key="`category-type-${code}`"
				:value="value"
				:disabled="formDisabled"
				:data-cy="identifierBuilder(`${code}-checkbox`)"
				class="mb-3"
				@update:modelValue="onValidate('type')"
			>
				<template v-slot:label>
					{{ $t(value) }}

					<SvgIcon
						:items="[{ code, value }]"
						class="ml-2"
					/>
				</template>
			</v-radio>
		</v-radio-group>

		<h4 :data-cy="identifierBuilder('image-text')">{{ $t('Image') }}</h4>

		<FileUpload
			v-if="!formDisabled"
			v-model="formModel.uploadedImage"
			:error-messages="validationMsg('uploadedImage')"
			:data-cy="prepareComponentIdentifier()"
			name="image"
			prepend-icon=""
			hide-details="auto"
			variant="outlined"
			density="compact"
			accept="image/*"
			class="mt-1"
			@update:modelValue="onValidate('uploadedImage')"
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
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			v-if="!formDisabled"
			color="primary"
			class="text-none ml-3"
			variant="elevated"
			@click="onSubmitForm"
		>
			{{ $t(submitButtonLabel) }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import { required, requiredIf } from "@vuelidate/validators";
import DataInput from "@/components/Inputs/DataInput";
import FileUpload from "@/components/Inputs/FileUpload";
import SvgIcon from "@/components/SvgIcon";
import identifierBuilder from "@/mixins/identifierBuilder";
import validation from "@/mixins/validation";

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

	mixins: [validation, identifierBuilder],

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
		closeButton: Boolean,
		formDisabled: Boolean,
		editing: Boolean,

		formModel: {
			type: Object,
			required: true,
		},

		submitButtonLabel: {
			type: String,
			required: true,
		},
	},

	data() {
		return {
			dataCy: "categories-form",
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
		onSubmitForm() {
			this.v$.$touch();
			if (this.v$.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.v$.$reset();
		},

		onCloseForm() {
			this.$emit("formClosed");
			this.v$.$reset();
		},
	},
};
</script>
