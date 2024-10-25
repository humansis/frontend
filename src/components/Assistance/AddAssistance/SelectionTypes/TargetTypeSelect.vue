<template>
	<h2 class="text-h6 mt-5 text-left font-weight-bold">{{ $t(title) }}</h2>

	<v-card class="mx-auto mt-5">
		<v-card-text>
			<DataSelect
				v-if="visible.isInstitutions"
				v-model="formModel.institutions"
				:items="options.institutions"
				:loading="loading.isInstitutions"
				:error-messages="validationMsg('institutions')"
				label="Institutions"
				name="institutions"
				item-title="name"
				item-value="id"
				multiple
				@update:modelValue="onTargetSelect('institutions')"
			/>
		</v-card-text>
	</v-card>
</template>

<script>
import { requiredIf } from "@vuelidate/validators";
import AssistancesService from "@/services/AssistancesService";
import InstitutionService from "@/services/InstitutionService";
import DataSelect from "@/components/Inputs/DataSelect";
import addressHelper from "@/mixins/addressHelper";
import validation from "@/mixins/validation";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	name: "TargetTypeSelect",

	components: {
		DataSelect,
	},

	emits: ["updatedData"],

	mixins: [validation, addressHelper],

	validations() {
		return {
			formModel: {
				institutions: {
					required: requiredIf(this.visible?.isInstitutions),
				},
			},
		};
	},

	props: {
		visible: {
			type: Object,
			required: true,
		},

		projectId: {
			type: Number,
			required: true,
		},

		isAssistanceDuplicated: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			title: "Institutions",
			formModel: {
				institutions: [],
			},
			options: {
				institutions: [],
			},
			loading: {
				isInstitutions: true,
			},
		};
	},

	async mounted() {
		await this.fetchInstitutions();

		if (this.isAssistanceDuplicated) {
			const assistanceId = this.$route.query.duplicateAssistance;

			await this.fetchUsedInstitutions(assistanceId);
		}
	},

	methods: {
		isFormValid() {
			this.v$.$touch();

			return !this.v$.$invalid;
		},

		async fetchData() {
			if (this.visible?.institutions) await this.fetchInstitutions();
		},

		async fetchInstitutions() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await InstitutionService.getShortListOfProjectInstitutions(this.projectId);

				checkResponseStatus(status, message);

				this.options.institutions = data;
			} catch (e) {
				Notification(`${this.$t("Institutions")}: ${e.message || e}`, "error");
			} finally {
				this.loading.isInstitutions = false;
			}
		},

		async fetchUsedInstitutions(assistanceId) {
			try {
				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getListOfInstitutions({
					id: assistanceId,
				});

				checkResponseStatus(status, message);

				this.prepareDuplicatedInstitutions(data);
				this.onTargetSelect();
			} catch (e) {
				Notification(`${this.$t("Institutions")} ${e.message || e}`, "error");
			}
		},

		prepareDuplicatedInstitutions(data) {
			const notArchivedInstitutions = data.filter((institution) => !institution.archived);

			notArchivedInstitutions.forEach((assistanceInstitution, key) => {
				const { institution } = assistanceInstitution;
				const { name, id } = institution;

				this.formModel.institutions[key] = {
					name,
					id,
				};
			});
		},

		onTargetSelect(field) {
			if (field) {
				this.onValidate(field);
			}

			const institutions = [];

			if (this.formModel.institutions.length) {
				this.formModel.institutions.forEach(({ id }) => institutions.push(id));
			}

			this.$emit("updatedData", { institutions });
		},
	},
};
</script>
