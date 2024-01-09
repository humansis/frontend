<template>
	<div>
		<h4 class="text-center mb-4">
			{{ $t('Please add this household to one or more project') }}
		</h4>

		<v-row>
			<v-col cols="6" offset="3">
				<DataSelect
					v-model="formModel.selectedProjects"
					:items="options.projects"
					:error-messages="validationMsg('selectedProjects')"
					label="Projects"
					name="projects"
					item-title="name"
					item-value="id"
					class="mb-4"
					multiple
					chips
					closable-chips
					@update:modelValue="onValidate('selectedProjects')"
				/>

				<DataInput
					v-model="formModel.enumerator"
					label="Enumerator"
					name="enumerator"
					class="mb-4"
					optional
				/>
			</v-col>
		</v-row>

		<h4 class="text-center mb-4">
			{{ $t('Household Information Summary') }}
		</h4>

		<v-row class="mb-4">
			<v-col v-if="livelihoodFilled" cols="4">
				<v-card>
					<v-card-subtitle class="pt-1 pb-0">{{ $t('Livelihood') }}</v-card-subtitle>

					<v-card-title>{{ livelihood }}</v-card-title>
				</v-card>
			</v-col>

			<v-col :cols="livelihoodFilled ? 4 : 6">
				<v-card>
					<v-card-subtitle class="pt-1 pb-0">{{ $t('Current Address') }}</v-card-subtitle>

					<v-card-title>{{ address }}</v-card-title>
				</v-card>
			</v-col>

			<v-col :cols="livelihoodFilled ? 4 : 6">
				<v-card>
					<v-card-subtitle class="pt-1 pb-0">{{ $t('Current Location') }}</v-card-subtitle>

					<v-card-title>{{ location }}</v-card-title>
				</v-card>
			</v-col>
		</v-row>

		<h4 class="text-center mb-4">
			{{ $t('Household Members') }}
		</h4>

		<DataGrid
			:headers="table.columns"
			:items="membersData"
			:total-count="table.total"
			class="mb-4"
			is-header-disabled
			is-footer-disabled
		/>
	</div>
</template>

<script>
import ProjectService from "@/services/ProjectService";
import DataGrid from "@/components/DataGrid";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import validation from "@/mixins/validation";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import { required } from "@vuelidate/validators";

export default {
	name: "HouseholdSummary",

	components: {
		DataInput,
		DataSelect,
		DataGrid,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				selectedProjects: { required },
			},
		};
	},

	props: {
		members: Array,
		detailOfHousehold: Object,
		livelihood: String,
		location: String,
		address: String,

		isEditing: {
			type: Boolean,
			default: false,
		},
	},

	emits: ["loaded"],

	data() {
		return {
			formModel: {
				selectedProjects: [],
				enumerator: "",
			},
			options: {
				projects: [],
			},
			table: {
				columns: generateColumns([
					{ key: "familyName", title: "Local family name", sortable: false },
					{ key: "firstName", title: "Local given name", sortable: false },
					{ key: "gender", title: "Gender", type: "object", sortable: false },
					{ key: "dateBirth", title: "Date of birth", type: "date", sortable: false },
					{ key: "phone", title: "Phone", sortable: false },
					{ key: "nationalId", title: "ID Number", sortable: false },
				]),
				total: 0,
			},
		};
	},

	computed: {
		membersData() {
			return this.members;
		},

		livelihoodFilled() {
			return this.livelihood;
		},
	},

	async created() {
		await this.fetchProjects();
		this.$emit("loaded");
	},

	methods: {
		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then((response) => {
					this.options.projects = response.data;
				})
				.catch((e) => {
					Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
				});

			if (this.isEditing) {
				this.formModel.selectedProjects = getArrayOfCodeListByKey(this.detailOfHousehold.projectIds, this.options.projects, "id");
				this.formModel.enumerator = this.detailOfHousehold.enumeratorName;
			}
		},

		submit() {
			this.v$.$touch();

			if (this.v$.$error) {
				Notification(this.$t("Please fill all required fields"), "error");
			}

			return !this.v$.$invalid;
		},
	},
};
</script>

<style lang="scss">
.household-summary-table {
	div {
		justify-content: flex-start !important;
	}
}
</style>
