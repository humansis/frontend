<template>
	<section>
		<b-field
			:label="$t('Province')"
			:type="validateType('adm1Id')"
			:message="validateMsg('adm1Id', 'Required')"
		>
			<MultiSelect
				v-model="formModel.adm1Id"
				searchable
				label="name"
				track-by="id"
				:placeholder="$t('Click to select...')"
				:loading="provincesLoading"
				:disabled="formDisabled"
				:options="options.provinces"
				:class="validateMultiselect('adm1Id')"
				@select="onProvinceSelect"
			/>
		</b-field>

		<b-field>
			<template #label>
				{{ $t('District') }}
				<span class="optional-text has-text-weight-normal is-italic">
					- {{ $t('Optional') }}
				</span>
			</template>
			<MultiSelect
				v-model="formModel.adm2Id"
				searchable
				label="name"
				track-by="id"
				:placeholder="$t('Click to select...')"
				:loading="districtsLoading"
				:disabled="formDisabled"
				:options="options.districts"
				@select="onDistrictSelect"
			/>
		</b-field>

		<b-field>
			<template #label>
				{{ $t('Commune') }}
				<span class="optional-text has-text-weight-normal is-italic">
					- {{ $t('Optional') }}
				</span>
			</template>
			<MultiSelect
				v-model="formModel.adm3Id"
				searchable
				label="name"
				track-by="id"
				:placeholder="$t('Click to select...')"
				:loading="communesLoading"
				:disabled="formDisabled"
				:options="options.communes"
				@select="onCommuneSelect"
			/>
		</b-field>

		<b-field>
			<template #label>
				{{ $t('Village') }}
				<span class="optional-text has-text-weight-normal is-italic">
					- {{ $t('Optional') }}
				</span>
			</template>
			<MultiSelect
				v-model="formModel.adm4Id"
				:key="componentKey"
				searchable
				label="name"
				track-by="id"
				:placeholder="$t('Click to select...')"
				:loading="villagesLoading"
				:disabled="formDisabled"
				:options="options.villages"
				@select="onVillageSelect"
			/>
		</b-field>
	</section>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import LocationsService from "@/services/LocationsService";
import { Notification } from "@/utils/UI";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import Validation from "@/mixins/validation";

export default {
	name: "LocationForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		formDisabled: Boolean,
		isEditing: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			componentKey: 0,
			options: {
				provinces: [],
				districts: [],
				communes: [],
				villages: [],
			},
			provincesLoading: false,
			districtsLoading: false,
			communesLoading: false,
			villagesLoading: false,
		};
	},

	validations: {
		formModel: {
			adm1Id: { required },
			adm2Id: {},
			adm3Id: {},
			adm4Id: {},
		},
	},

	watch: {
		formModel: "mapLocations",
	},

	async mounted() {
		const promise = this.fetchProvinces();
		await Promise.all([promise]);
		if (this.formModel) {
			await this.mapLocations();
		}
	},

	methods: {
		submitLocationForm() {
			this.$v.$touch();
			return this.$v.$invalid;
		},

		onProvinceSelect({ id }) {
			this.validate("adm1Id");
			this.eraseData("adm1");
			this.fetchDistricts(id);
		},

		onDistrictSelect({ id }) {
			this.validate("adm2Id");
			this.eraseData("adm2");
			this.fetchCommunes(id);
		},

		onCommuneSelect({ id }) {
			this.validate("adm3Id");
			this.eraseData("adm3");
			this.fetchVillages(id);
		},

		onVillageSelect() {
			this.validate("adm4Id");
			this.componentKey += 1;
		},

		async fetchProvinces() {
			this.provincesLoading = true;
			await LocationsService.getListOfAdm1()
				.then((result) => { this.options.provinces = result.data; })
				.catch((e) => {
					Notification(`${this.$t("Adm1")} ${e}`, "is-danger");
				});
			this.provincesLoading = false;
		},

		async fetchDistricts(adm1Id) {
			this.districtsLoading = true;
			await LocationsService.getListOfAdm2(adm1Id)
				.then((result) => { this.options.districts = result.data; })
				.catch((e) => {
					Notification(`${this.$t("Adm2")} ${e}`, "is-danger");
				});
			this.districtsLoading = false;
		},

		async fetchCommunes(adm2Id) {
			this.communesLoading = true;
			await LocationsService.getListOfAdm3(adm2Id)
				.then((result) => { this.options.communes = result.data; })
				.catch((e) => {
					Notification(`${this.$t("Adm3")} ${e}`, "is-danger");
				});
			this.communesLoading = false;
		},

		async fetchVillages(adm3Id) {
			this.villagesLoading = true;
			await LocationsService.getListOfAdm4(adm3Id)
				.then((result) => { this.options.villages = result.data; })
				.catch((e) => {
					Notification(`${this.$t("Adm4")} ${e}`, "is-danger");
				});
			this.villagesLoading = false;
		},

		async mapLocations() {
			const { adm1Id, adm2Id, adm3Id, adm4Id } = this.formModel;
			if (adm1Id && typeof adm1Id !== "object") {
				this.formModel.adm1Id = getArrayOfCodeListByKey([adm1Id], this.options.provinces, "id");
				await this.fetchDistricts(adm1Id);
			}
			if (adm2Id && typeof adm2Id !== "object") {
				this.formModel.adm2Id = getArrayOfCodeListByKey([adm2Id], this.options.districts, "id");
				await this.fetchCommunes(adm2Id);
			}
			if (adm3Id && typeof adm3Id !== "object") {
				this.formModel.adm3Id = getArrayOfCodeListByKey([adm3Id], this.options.communes, "id");
				await this.fetchVillages(adm3Id);
			}
			if (adm4Id && typeof adm4Id !== "object") {
				this.formModel.adm4Id = getArrayOfCodeListByKey([adm4Id], this.options.villages, "id");
			}
		},

		eraseData(type) {
			switch (type) {
				case "adm1":
					this.formModel.adm2Id = null;
					this.formModel.adm3Id = null;
					this.formModel.adm4Id = null;
					break;
				case "adm2":
					this.formModel.adm3Id = null;
					this.formModel.adm4Id = null;
					break;
				case "adm3":
					this.formModel.adm4Id = null;
					break;
				default:
					break;
			}
		},
	},
};
</script>
