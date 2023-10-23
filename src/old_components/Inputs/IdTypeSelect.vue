<template>
	<b-field
		:label="label"
		:type="validateType('idType', true)"
		:message="validateMsg('idType')"
	>
		<MultiSelect
			v-model="idType"
			label="value"
			:select-label="$t('Press enter to select')"
			:selected-label="$t('Selected')"
			:deselect-label="$t('Press enter to remove')"
			track-by="code"
			searchable
			:placeholder="$t('Click to select')"
			:loading="idTypeLoading"
			:options="options.idType"
			:class="validateMultiselect('idType', true)"
			@select="validate('idType')"
		>
			<span slot="noOptions">{{ $t("List is empty")}}</span>
		</MultiSelect>
	</b-field>
</template>

<script>
import { requiredIf } from "vuelidate/lib/validators";
import BeneficiariesService from "@/services/BeneficiariesService";
import validation from "@/mixins/validation";
import { Notification } from "@/utils/UI";

export default {

	mixins: [validation],

	validations() {
		return {
			idType: { required: requiredIf(() => this.required) },
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
				return this.value;
			},
			set(value) {
				this.$emit("input", value);
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
			this.$v.idType.$touch();
		},
	},
};
</script>
