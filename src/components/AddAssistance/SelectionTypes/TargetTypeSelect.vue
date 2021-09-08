<template>
	<div class="mt-5">
		<h3 class="title is-4">{{ title }}</h3>
		<form class="box">
			<b-field
				v-if="visible.communities"
				:label="$t('Communities')"
				:type="validateType('communities')"
				:message="validateMsg('communities')"
			>
				<MultiSelect
					v-model="formModel.communities"
					searchable
					label="name"
					track-by="id"
					multiple
					:placeholder="$t('Click to select')"
					:options="options.communities"
					:loading="loading.communities"
					:class="validateMultiselect('communities')"
					@select="validate('communities')"
				>
					<template #singleLabel v-slot:default="option">
						{{ option.code }}
					</template>
				</MultiSelect>
			</b-field>
			<b-field
				v-if="visible.institutions"
				:label="$t('Institutions')"
				:type="validateType('institutions')"
				:message="validateMsg('institutions')"
			>
				<MultiSelect
					v-model="formModel.institutions"
					searchable
					label="name"
					track-by="id"
					multiple
					:placeholder="$t('Click to select')"
					group-values="data"
					group-label="label"
					group-select
					:options="options.institutions"
					:loading="loading.institutions"
					:class="validateMultiselect('institutions')"
					@select="validate('institutions')"
				>
					<template #singleLabel v-slot:default="option">
						{{ option.code }}
					</template>
				</MultiSelect>
			</b-field>
		</form>
	</div>
</template>

<script>
import validation from "@/mixins/validation";
import InstitutionService from "@/services/InstitutionService";
import { Notification } from "@/utils/UI";
import CommunityService from "@/services/CommunityService";
import { requiredIf } from "vuelidate/lib/validators";
import addressHelper from "@/mixins/addressHelper";
import { normalizeText } from "@/utils/datagrid";

export default {
	name: "TargetTypeSelect",

	mixins: [validation, addressHelper],

	props: {
		visible: Object,
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

	watch: {
		visible: "fetchData",
	},

	computed: {
		title() {
			return this.visible?.communities ? this.$t("Communities") : this.$t("Institutions");
		},
	},

	validations: {
		formModel: {
			// eslint-disable-next-line func-names
			communities: { required: requiredIf(function () {
				return this.visible?.communities;
			}) },
			// eslint-disable-next-line func-names
			institutions: { required: requiredIf(function () {
				return this.visible?.institutions;
			}) },
		},
	},

	updated() {
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

	mounted() {
		this.fetchData();
	},

	methods: {
		submit() {
			this.$v.$touch();
			return !this.$v.$invalid;
		},

		async fetchData() {
			if (this.visible?.communities) await this.fetchCommunities();
			if (this.visible?.institutions) await this.fetchInstitutions();
		},

		async fetchInstitutions() {
			await InstitutionService.getListOfInstitutions()
				.then(({ data }) => {
					this.options.institutions = this.prepareInstitutionsForSelect(data);
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Institutions")} ${e}`, "is-danger");
				});
			this.loading.institutions = false;
		},

		async fetchCommunities() {
			await CommunityService.getListOfCommunities()
				.then(async ({ data }) => {
					this.options.communities = await this.prepareCommunitiesForSelect(data);
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Communities")} ${e}`, "is-danger");
				});
			this.loading.communities = false;
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

		prepareInstitutionsForSelect(data) {
			const groups = [];

			data.forEach((item) => {
				const group = groups.find((g) => g.name === item.type);

				if (!group) {
					groups.push({
						name: item.type,
						label: normalizeText(item.type),
						data: [item],
					});
				} else {
					const index = groups.indexOf(group);
					groups[index].data.push(item);
				}
			});

			return groups;
		},
	},
};
</script>
