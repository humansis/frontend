<template>
	<h2 class="text-h6 mt-5 text-left font-weight-bold">{{ title }}</h2>

	<v-card
		class="mx-auto mt-5"
	>
		<v-card-text>
			<DataSelect
				v-if="visible.communities"
				v-model="formModel.communities"
				:items="options.communities"
				:loading="loading.communities"
				:error-messages="validationMsg('communities')"
				label="Communities"
				name="communities"
				item-title="name"
				item-value="id"
				multiple
				@update:modelValue="onTargetSelect('communities')"
			/>

			<DataSelect
				v-if="visible.institutions"
				v-model="formModel.institutions"
				:items="options.institutions"
				:loading="loading.institutions"
				:error-messages="validationMsg('institutions')"
				label="Institutions"
				name="institutions"
				item-title="name"
				item-value="id"
				multiple
				is-data-shown-as-tag
				@update:modelValue="onTargetSelect('institutions')"
			/>
		</v-card-text>
	</v-card>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import CommunityService from "@/services/CommunityService";
import InstitutionService from "@/services/InstitutionService";
import DataSelect from "@/components/Inputs/DataSelect";
import addressHelper from "@/mixins/addressHelper";
import validation from "@/mixins/validation";
import { Notification } from "@/utils/UI";
import { requiredIf } from "@vuelidate/validators";

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
				communities: { required: requiredIf(this.visible?.communities),
				},
				institutions: { required: requiredIf(this.visible?.institutions),
				},
			},
		};
	},

	props: {
		visible: Object,

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
			formModel: {
				communities: [],
				institutions: [],
			},
			options: {
				communities: [],
				institutions: [],
			},
			loading: {
				communities: true,
				institutions: true,
			},
		};
	},

	computed: {
		title() {
			return this.visible?.communities ? this.$t("Communities") : this.$t("Institutions");
		},
	},

	watch: {
		visible: "fetchData",
		isAssistanceDuplicated(value) {
			if (value) {
				const assistanceId = this.$route.query.duplicateAssistance;

				this.fetchUsedInstitutions(assistanceId);
			}
		},
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		submit() {
			this.v$.$touch();
			return !this.v$.$invalid;
		},

		async fetchData() {
			if (this.visible?.communities) await this.fetchCommunities();
			if (this.visible?.institutions) await this.fetchInstitutions();
		},

		async fetchInstitutions() {
			await InstitutionService.getListOfInstitutions(
				null,
				null,
				null,
				null,
				{ projects: [this.projectId] },
			)
				.then(({ data }) => {
					this.options.institutions = data;
				})
				.catch((e) => {
					Notification(`${this.$t("Institutions")} ${e.message || e}`, "error");
				});
			this.loading.institutions = false;
		},

		async fetchCommunities() {
			await CommunityService.getListOfCommunities()
				.then(async ({ data }) => {
					this.options.communities = await this.prepareCommunitiesForSelect(data);
				})
				.catch((e) => {
					Notification(`${this.$t("Communities")} ${e.message || e}`, "error");
				});
			this.loading.communities = false;
		},

		async fetchUsedInstitutions(assistanceId) {
			try {
				const { data: { data } } = await AssistancesService.getListOfInstitutions(
					assistanceId,
				);

				this.prepareDuplicatedInstitutions(data);
				this.onTargetSelect();
			} catch (e) {
				Notification(`${this.$t("Institutions")} ${e.message || e}`, "error");
			}
		},

		async prepareCommunitiesForSelect(data) {
			const filledData = [];
			const addressesIds = [];

			data.forEach((item, key) => {
				filledData[key] = item;
				addressesIds.push(item.addressId);
			});

			const mappedLocations = await this.getPreparedLocations(addressesIds);

			filledData.forEach((item, key) => {
				filledData[key].name = this.prepareEntityForTable(item.addressId, mappedLocations, "locationName");
			});

			return filledData;
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

			const communities = [];
			const institutions = [];

			if (this.formModel.communities.length) {
				this.formModel.communities.forEach(({ id }) => communities.push(id));
			}

			if (this.formModel.institutions.length) {
				this.formModel.institutions.forEach(({ id }) => institutions.push(id));
			}

			this.$emit("updatedData", { communities, institutions });
		},
	},
};
</script>
