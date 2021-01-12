<template>
	<section>
		<b-field
			label="Province"
			:type="validateType('adm1Id')"
			:message="validateMsg('adm1Id', 'Province is Required')"
		>
			<MultiSelect
				v-model="formModel.adm1Id"
				searchable
				label="name"
				track-by="id"
				placeholder="Click to select..."
				:loading="provincesLoading"
				:disabled="formDisabled"
				:options="provinces"
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
				:options="districts"
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
				:options="communes"
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
				:options="villages"
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

export default {
	name: "locationForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		formDisabled: Boolean,
	},

	data() {
		return {
			provinces: [],
			districts: [],
			communes: [],
			villages: [],
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

	mounted() {
		this.fetchProvinces();
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
				.then((result) => { this.provinces = result.data; })
				.catch((e) => {
					Notification(`Adm1 ${e}`, "is-danger");
				});
			this.provincesLoading = false;
		},

		async fetchDistricts(adm1Id) {
			this.districtsLoading = true;
			await LocationsService.getListOfAdm2(adm1Id)
				.then((result) => { this.districts = result.data; })
				.catch((e) => {
					Notification(`Adm2 ${e}`, "is-danger");
				});
			this.districtsLoading = false;
		},

		async fetchCommunes(adm2Id) {
			this.communesLoading = true;
			await LocationsService.getListOfAdm3(adm2Id)
				.then((result) => { this.communes = result.data; })
				.catch((e) => {
					Notification(`Adm3 ${e}`, "is-danger");
				});
			this.communesLoading = false;
		},

		async fetchVillages(adm3Id) {
			this.villagesLoading = true;
			await LocationsService.getListOfAdm4(adm3Id)
				.then((result) => { this.villages = result.data; })
				.catch((e) => {
					Notification(`Adm4 ${e}`, "is-danger");
				});
			this.villagesLoading = false;
		},
	},
};
</script>
