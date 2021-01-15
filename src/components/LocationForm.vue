<template>
	<section>
		<b-field
			label="Province"
			:type="validateType('adm1Id')"
			:message="validateMsg('adm1Id', 'Required')"
		>
			<MultiSelect
				v-model="formModel.adm1Id"
				searchable
				label="name"
				track-by="id"
				placeholder="Click to select..."
				:loading="provincesLoading"
				:disabled="formDisabled"
				:options="options.provinces"
				:class="validateMultiselect('adm1Id')"
				@select="onProvinceSelect"
			/>
		</b-field>

		<b-field>
			<template #label>
				District<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
			</template>
			<MultiSelect
				v-model="formModel.adm2Id"
				searchable
				label="name"
				track-by="id"
				placeholder="Click to select..."
				:loading="districtsLoading"
				:disabled="formDisabled"
				:options="options.districts"
				@select="onDistrictSelect"
			/>
		</b-field>

		<b-field>
			<template #label>
				Commune<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
			</template>
			<MultiSelect
				v-model="formModel.adm3Id"
				searchable
				label="name"
				track-by="id"
				placeholder="Click to select..."
				:loading="communesLoading"
				:disabled="formDisabled"
				:options="options.communes"
				@select="onCommuneSelect"
			/>
		</b-field>

		<b-field>
			<template #label>
				Village<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
			</template>
			<MultiSelect
				v-model="formModel.adm4Id"
				searchable
				label="name"
				track-by="id"
				placeholder="Click to select..."
				:loading="villagesLoading"
				:disabled="formDisabled"
				:options="options.villages"
				@select="validate('adm4Id')"
			/>
		</b-field>
	</section>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";
import LocationsService from "@/services/LocationsService";
import { Notification } from "@/utils/UI";
// import { resolveLocations } from "@/utils/LocationResolver";
import { getArrayOfCodeListByKey } from "@/utils/codeList";

export default {
	name: "locationForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		formDisabled: Boolean,
		locationObject: Promise,
		isEditing: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
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

	async mounted() {
		await this.fetchProvinces();
		await Promise.all([this.locationObject]);
		this.locationObject.then(async (location) => {
			if (this.isEditing || this.formDisabled) {
				this.formModel.adm1Id = getArrayOfCodeListByKey([location.adm1], this.options.provinces, "code");
				if (location.adm2) {
					await this.fetchDistricts(location.adm1);
					this.formModel.adm2Id = getArrayOfCodeListByKey([location.adm2], this.options.districts, "code");
					if (location.adm3) {
						await this.fetchCommunes(location.adm2);
						this.formModel.adm3Id = getArrayOfCodeListByKey([location.adm3], this.options.communes, "code");
						if (location.adm4) {
							await this.fetchVillages(location.adm3);
							this.formModel.adm4Id = getArrayOfCodeListByKey([location.adm4], this.options.villages, "code");
						}
					}
				}
			}
		});
	},

	methods: {
		submitLocationForm() {
			this.$v.$touch();
			return this.$v.$invalid;
		},

		onProvinceSelect({ id }) {
			this.validate("adm1Id");
			this.fetchDistricts(id);
		},

		onDistrictSelect({ id }) {
			this.validate("adm2Id");
			this.fetchCommunes(id);
		},

		onCommuneSelect({ id }) {
			this.validate("adm3Id");
			this.fetchVillages(id);
		},

		async fetchProvinces() {
			this.provincesLoading = true;
			await LocationsService.getListOfAdm1()
				.then((result) => { this.options.provinces = result.data; })
				.catch((e) => {
					Notification(`Adm1 ${e}`, "is-danger");
				});
			this.provincesLoading = false;
		},

		async fetchDistricts(adm1Id) {
			this.districtsLoading = true;
			await LocationsService.getListOfAdm2(adm1Id)
				.then((result) => { this.options.districts = result.data; })
				.catch((e) => {
					Notification(`Adm2 ${e}`, "is-danger");
				});
			this.districtsLoading = false;
		},

		async fetchCommunes(adm2Id) {
			this.communesLoading = true;
			await LocationsService.getListOfAdm3(adm2Id)
				.then((result) => { this.options.communes = result.data; })
				.catch((e) => {
					Notification(`Adm3 ${e}`, "is-danger");
				});
			this.communesLoading = false;
		},

		async fetchVillages(adm3Id) {
			this.villagesLoading = true;
			await LocationsService.getListOfAdm4(adm3Id)
				.then((result) => { this.options.villages = result.data; })
				.catch((e) => {
					Notification(`Adm4 ${e}`, "is-danger");
				});
			this.villagesLoading = false;
		},
	},
};
</script>
