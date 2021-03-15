<template>
	<div>
		<h2 class="subtitle">{{ title }}</h2>
		<form class="box">
			<b-field
				v-if="visible.communities"
				label="Communities"
				:type="validateType('communities')"
				:message="validateMsg('communities')"
			>
				<MultiSelect
					v-model="formModel.communities"
					searchable
					label="name"
					track-by="id"
					multiple
					placeholder="Click to select..."
					:options="options.communities"
					:loading="loading.communities"
					:class="validateMultiselect('communities')"
					@select="validate('communities')"
				>
					<template
						#singleLabel
						v-slot:default="option"
					>
						{{ option.code }}
					</template>
				</MultiSelect>
			</b-field>
			<b-field
				v-if="visible.institutions"
				label="Institutions"
				:type="validateType('institutions')"
				:message="validateMsg('institutions')"
			>
				<MultiSelect
					v-model="formModel.institutions"
					searchable
					label="name"
					track-by="id"
					multiple
					placeholder="Click to select..."
					group-values="data"
					group-label="label"
					:group-select="true"
					:options="options.institutions"
					:loading="loading.institutions"
					:class="validateMultiselect('institutions')"
					@select="validate('institutions')"
				>
					<template
						#singleLabel
						v-slot:default="option"
					>
						{{ option.code }}
					</template>
				</MultiSelect>
			</b-field>
		</form>
	</div>
</template>

<script>
import validation from "@/mixins/validation";
import InstitutionsService from "@/services/InstitutionsService";
import { Notification } from "@/utils/UI";
import CommunitiesService from "@/services/CommunitiesService";
import { required } from "vuelidate/lib/validators";
import addressHelper from "@/mixins/addressHelper";
import { normalizeText } from "@/utils/datagrid";

export default {
	name: "TargetTypeSelect",

	mixins: [validation, addressHelper],

	props: {
		formModel: Object,
		visible: Object,
	},

	data() {
		return {
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
			return this.visible?.communities ? "Communities" : "Institutions";
		},
	},

	validations: {
		formModel: {
			communities: { required },
			institutions: { required },
		},
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			if (this.visible?.communities) await this.fetchCommunities();
			if (this.visible?.institutions) await this.fetchInstitutions();
		},

		async fetchInstitutions() {
			await InstitutionsService.getListOfInstitutions()
				.then(({ data }) => {
					this.options.institutions = this.prepareInstitutionsForSelect(data);
				})
				.catch((e) => {
					Notification(`Institutions ${e}`, "is-danger");
				});
			this.loading.institutions = false;
		},

		async fetchCommunities() {
			await CommunitiesService.getListOfCommunities()
				.then(async ({ data }) => {
					this.options.communities = await this.prepareCommunitiesForSelect(data);
				})
				.catch((e) => {
					Notification(`Communities ${e}`, "is-danger");
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
