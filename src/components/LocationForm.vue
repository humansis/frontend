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
				:loading="provincesLoading"
				:disabled="formDisabled"
				:options="provinces"
				:class="validateMultiselect('adm1Id')"
				@select="onProvinceSelect"
			/>
		</b-field>

		<b-field
			label="District"
			:type="validateType('adm2Id')"
		>
			<MultiSelect
				v-model="formModel.adm2Id"
				searchable
				label="name"
				track-by="id"
				:loading="districtsLoading"
				:disabled="formDisabled"
				:options="districts"
				:class="validateMultiselect('adm2Id')"
				@select="onDistrictSelect"
			/>
		</b-field>

		<b-field
			label="Commune"
			:type="validateType('adm3Id')"
		>
			<MultiSelect
				v-model="formModel.adm3Id"
				searchable
				label="name"
				track-by="id"
				:loading="communesLoading"
				:disabled="formDisabled"
				:options="communes"
				:class="validateMultiselect('adm3Id')"
				@select="onCommuneSelect"
			/>
		</b-field>

		<b-field
			label="Village"
			:type="validateType('adm4Id')"
		>
			<MultiSelect
				v-model="formModel.adm4Id"
				searchable
				label="name"
				track-by="id"
				:loading="villagesLoading"
				:disabled="formDisabled"
				:options="villages"
				:class="validateMultiselect('adm4Id')"
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

		fetchProvinces() {
			this.provincesLoading = true;
			LocationsService.getListOfAdm1()
				.then((result) => { this.provinces = result.data; })
				.catch((e) => {
					Notification(`Adm1 ${e}`, "is-danger");
				});
			this.provincesLoading = false;
		},

		fetchDistricts(adm1Id) {
			this.districtsLoading = true;
			LocationsService.getListOfAdm2(adm1Id)
				.then((result) => { this.districts = result.data; })
				.catch((e) => {
					Notification(`Adm2 ${e}`, "is-danger");
				});
			this.districtsLoading = false;
		},

		fetchCommunes(adm2Id) {
			this.communesLoading = true;
			LocationsService.getListOfAdm3(adm2Id)
				.then((result) => { this.communes = result.data; })
				.catch((e) => {
					Notification(`Adm3 ${e}`, "is-danger");
				});
			this.communesLoading = false;
		},

		fetchVillages(adm3Id) {
			this.villagesLoading = true;
			LocationsService.getListOfAdm4(adm3Id)
				.then((result) => { this.villages = result.data; })
				.catch((e) => {
					Notification(`Adm4 ${e}`, "is-danger");
				});
			this.villagesLoading = false;
		},
	},
};
</script>
