<template>
	<DataSelect
		v-model="idType"
		:label="label"
		:items="options.idType"
		:loading="idTypeLoading"
		:error-messages="validationMsg('idType')"
		name="id-type"
		item-title="value"
		item-value="code"
		class="mb-6"
		is-search-enabled
		@update:modelValue="validate('idType')"
	/>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import DataSelect from "@/components/Inputs/DataSelect";
import validation from "@/mixins/validation";
import { Notification } from "@/utils/UI";
import { requiredIf } from "@vuelidate/validators";

export default {
	name: "IdTypeSelect",

	components: {
		DataSelect,
	},

	mixins: [validation],

	validations() {
		return {
			idType: { required: requiredIf(this.required) },
		};
	},

	props: {
		value: {
			type: Object,
			default: () => null,
		},

		required: {
			type: Boolean,
			default: false,
		},

		label: {
			type: String,
			default: "ID Type",
		},

		modelValue: {
			type: Object,
			default: () => {},
		},
	},

	data() {
		return {
			idTypeLoading: true,
			options: {
				idType: [],
			},
		};
	},

	computed: {
		idType: {
			get() {
				return this.modelValue;
			},
			set(value) {
				this.$emit("update:modelValue", value);
			},
		},
	},

	async created() {
		await this.fetchNationalCardTypes();
		this.idTypeLoading = false;
	},

	methods: {
		async fetchNationalCardTypes() {
			return BeneficiariesService.getListOfTypesOfNationalIds()
				.then(({ data }) => { this.options.idType = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("National IDs")} ${e}`, "is-danger");
				});
		},

		onSubmit() {
			this.v$.idType.$touch();
		},
	},
};
</script>
