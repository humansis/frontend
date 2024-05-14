<template>
	<DataSelect
		v-model="idType"
		:label="label"
		:items="options.idType"
		:loading="idTypeLoading"
		:error-messages="validationMsg('idType')"
		name="id-type"
		class="mb-4"
		@update:modelValue="onValidate('idType')"
	/>
</template>

<script>
import { requiredIf } from "@vuelidate/validators";
import BeneficiariesService from "@/services/BeneficiariesService";
import DataSelect from "@/components/Inputs/DataSelect";
import validation from "@/mixins/validation";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

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
			try {
				const {
					data: { data },
					status,
					message,
				} = await BeneficiariesService.getListOfTypesOfNationalIds();

				checkResponseStatus(status, message);

				this.options.idType = data;
			} catch (e) {
				Notification(`${this.$t("National IDs")}: ${e.message || e}`, "error");
			}
		},

		onSubmit() {
			this.v$.idType.$touch();
		},
	},
};
</script>
