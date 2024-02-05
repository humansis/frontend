<template>
	<v-card-text>
		<DataInput
			v-model="formModel.field"
			:disabled="formDisabled"
			:error-messages="validationMsg('field')"
			label="Field"
			name="field"
			class="mb-4"
			@update:modelValue="onValidate('field')"
		/>

		<DataSelect
			v-model="formModel.type"
			:items="options.types"
			:disabled="formDisabled"
			:error-messages="validationMsg('type')"
			label="Type"
			name="type"
			class="mb-4"
			@update:modelValue="onValidate('type')"
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
import { required } from "@vuelidate/validators";
import AssistancesService from "@/services/AssistancesService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import validation from "@/mixins/validation";
import { Notification } from "@/utils/UI";

export default {
	name: "CustomFieldForm",

	emits: ["formSubmitted", "formClosed"],

	components: {
		DataInput,
		DataSelect,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				field: { required },
				type: { required },
				target: {},
			},
		};
	},

	props: {
		closeButton: Boolean,
		formDisabled: Boolean,

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
			options: {
				types: [
					{
						code: "number",
						value: this.$t("Number"),
					},
					{
						code: "text",
						value: this.$t("Text"),
					},
				],
				targets: [],
			},
			loadingTargets: true,
		};
	},

	mounted() {
		this.fetchTargets();
		this.mapSelects();
	},

	methods: {
		mapSelects() {
			this.formModel.type = this.options.types.find((item) => item.code === this.formModel.type);
		},

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

		async fetchTargets() {
			await AssistancesService.getTargetTypes()
				.then((response) => { this.options.targets = response.data; })
				.catch((e) => {
					Notification(`${this.$t("Target Types")} ${e.message || e}`, "error");
				});

			this.formModel.target = this.options.targets
				.find((item) => item.code === this.formModel.target);
			this.loadingTargets = false;
		},
	},
};
</script>
