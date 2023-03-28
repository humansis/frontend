<template>
	<section>
		<b-field
			:label="$t(admNames.adm1)"
			:type="validateType('adm1')"
			:message="validateMsg('adm1', 'Required')"
		>
			<MultiSelect
				v-model="formModel.adm1"
				searchable
				label="name"
				track-by="id"
				:placeholder="$t('Click to select')"
				:loading="provincesLoading"
				:disabled="formDisabled || disabledAdm.adm1"
				:options="options.provinces"
				:class="validateMultiselect('adm1')"
				@input="onProvinceSelect"
			>
				<span slot="noOptions">{{ $t("List is empty")}}</span>
			</MultiSelect>
		</b-field>

		<b-field>
			<template #label>
				{{ $t(admNames.adm2) }}
				<span class="optional-text has-text-weight-normal is-italic">
					- {{ $t('Optional') }}
				</span>
			</template>
			<MultiSelect
				v-model="formModel.adm2"
				searchable
				label="name"
				track-by="id"
				:placeholder="$t('Click to select')"
				:loading="districtsLoading"
				:disabled="formDisabled || disabledAdm.adm2"
				:options="options.districts"
				@input="onDistrictSelect"
			>
				<span slot="noOptions">{{ $t("List is empty")}}</span>
			</MultiSelect>
		</b-field>

		<b-field>
			<template #label>
				{{ $t(admNames.adm3) }}
				<span class="optional-text has-text-weight-normal is-italic">
					- {{ $t('Optional') }}
				</span>
			</template>
			<MultiSelect
				v-model="formModel.adm3"
				searchable
				label="name"
				track-by="id"
				:placeholder="$t('Click to select')"
				:loading="communesLoading"
				:disabled="formDisabled || disabledAdm.adm3"
				:options="options.communes"
				@input="onCommuneSelect"
			>
				<span slot="noOptions">{{ $t("List is empty")}}</span>
			</MultiSelect>
		</b-field>

		<p
			v-if="influenceDistributionProtocol.subDistrict"
			class="help is-danger"
		>
			{{ distributionProtocolMessage }}
		</p>

		<b-field>
			<template #label>
				{{ $t(admNames.adm4) }}
				<span class="optional-text has-text-weight-normal is-italic">
					- {{ $t('Optional') }}
				</span>
			</template>
			<MultiSelect
				v-model="formModel.adm4"
				:key="componentKey"
				searchable
				label="name"
				track-by="id"
				:placeholder="$t('Click to select')"
				:loading="villagesLoading"
				:disabled="formDisabled || disabledAdm.adm4"
				:options="options.villages"
				@input="onVillageSelect"
			>
				<span slot="noOptions">{{ $t("List is empty")}}</span>
			</MultiSelect>
		</b-field>

		<p
			v-if="influenceDistributionProtocol.village"
			class="help is-danger"
		>
			{{ distributionProtocolMessage }}
		</p>
	</section>
</template>

<script>
import { mapState } from "vuex";
import { required } from "vuelidate/lib/validators";
import LocationsService from "@/services/LocationsService";
import { Notification } from "@/utils/UI";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import Validation from "@/mixins/validation";
import AddressService from "@/services/AddressService";
import CONST from "@/const";

export default {
	name: "LocationForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		formDisabled: Boolean,
		disabledAdm: {
			type: Object,
			default: () => ({
				adm1: false,
				adm2: false,
				adm3: false,
				adm4: false,
			}),
		},
		isAssistanceModal: {
			type: Boolean,
			default: false,
		},
		influenceDistributionProtocol: {
			type: Object,
			default: () => ({
				subDistrict: false,
				village: false,
			}),
		},
		distributionProtocolMessage: {
			type: String,
			default: "",
		},
	},

	computed: {
		...mapState(["admNames"]),
	},

	data() {
		return {
			mapping: true,
			locationId: null,
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
			adm1: { required },
			adm2: {},
			adm3: {},
			adm4: {},
		},
	},

	watch: {
		formModel: "mapLocations",
	},

	async mounted() {
		await Promise.all([this.fetchProvinces()]);

		if (this.formModel) {
			await this.mapLocations();
		}

		if (this.isAssistanceModal && this.formModel.adm2) {
			await this.fetchCommunes(this.formModel.adm2?.id);

			if (this.formModel.adm3) {
				await this.fetchVillages(this.formModel.adm3?.id);
			}
		}
	},

	methods: {
		submitLocationForm() {
			this.$v.$touch();
			return this.$v.$invalid;
		},

		onProvinceSelect(location) {
			if (!location) {
				this.formModel.locationId = null;
			} else {
				this.formModel.locationId = location.locationId;
				this.validate("adm1");
				this.fetchDistricts(location.id);
			}
			this.componentKey += 1;
			this.eraseData("adm1");
			this.$emit("locationChanged", "adm1");
		},

		onDistrictSelect(location) {
			if (!location) {
				this.formModel.locationId = this.formModel.adm1.locationId;
			} else {
				this.formModel.locationId = location.locationId;
				this.validate("adm2");
				this.fetchCommunes(location.id);
			}
			this.componentKey += 1;
			this.eraseData("adm2");
			this.$emit("locationChanged", "adm2");
		},

		onCommuneSelect(location) {
			if (!location) {
				this.formModel.locationId = this.formModel.adm2.locationId;
			} else {
				this.formModel.locationId = location.locationId;
				this.validate("adm3");
				this.fetchVillages(location.id);
			}
			this.componentKey += 1;
			this.eraseData("adm3");
			this.$emit("locationChanged", "adm3");
		},

		onVillageSelect(location) {
			if (!location) {
				this.formModel.locationId = this.formModel.adm3.locationId;
			} else {
				this.formModel.locationId = location.locationId;
				this.validate("adm4");
			}
			this.componentKey += 1;
			this.$emit("locationChanged", "adm4");
		},

		async fetchProvinces() {
			this.provincesLoading = true;
			await LocationsService.getListOfAdm1()
				.then((result) => { this.options.provinces = result.data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Adm1")} ${e}`, "is-danger");
				});
			this.provincesLoading = false;
		},

		async fetchDistricts(adm1Id) {
			this.districtsLoading = true;
			await LocationsService.getListOfAdm2(adm1Id)
				.then((result) => { this.options.districts = result.data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Adm2")} ${e}`, "is-danger");
				});
			this.districtsLoading = false;
		},

		async fetchCommunes(adm2Id) {
			this.communesLoading = true;
			await LocationsService.getListOfAdm3(adm2Id)
				.then((result) => { this.options.communes = result.data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Adm3")} ${e}`, "is-danger");
				});
			this.communesLoading = false;
		},

		async fetchVillages(adm3Id) {
			this.villagesLoading = true;
			await LocationsService.getListOfAdm4(adm3Id)
				.then((result) => { this.options.villages = result.data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Adm4")} ${e}`, "is-danger");
				});
			this.villagesLoading = false;
		},

		async fetchCamps(id) {
			await AddressService.getCamp(id)
				.then((data) => {
					this.formModel.adm1Id = data.adm1Id;
					this.formModel.adm2Id = data.adm2Id;
					this.formModel.adm3Id = data.adm3Id;
					this.formModel.adm4Id = data.adm4Id;
					this.formModel.locationId = data.locationId;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Camp")} ${e}`, "is-danger");
				});
		},

		async mapLocations() {
			this.mapping = true;
			if (this.formModel.type === CONST.LOCATION_TYPE.camp.type) {
				await this.fetchCamps(this.formModel.campId);
			}
			const { adm1Id, adm2Id, adm3Id, adm4Id } = this.formModel;

			if (adm1Id && typeof adm1Id !== "object") {
				this.formModel.adm1 = getArrayOfCodeListByKey([adm1Id], this.options.provinces, "id");
				this.formModel.locationId = this.formModel.adm1.locationId;
				await this.fetchDistricts(adm1Id);
			}
			if (adm2Id && typeof adm2Id !== "object") {
				this.formModel.adm2 = getArrayOfCodeListByKey([adm2Id], this.options.districts, "id");
				this.formModel.locationId = this.formModel.adm2.locationId;
				await this.fetchCommunes(adm2Id);
			}
			if (adm3Id && typeof adm3Id !== "object") {
				this.formModel.adm3 = getArrayOfCodeListByKey([adm3Id], this.options.communes, "id");
				this.formModel.locationId = this.formModel.adm3.locationId;
				await this.fetchVillages(adm3Id);
			}
			if (adm4Id && typeof adm4Id !== "object") {
				this.formModel.adm4 = getArrayOfCodeListByKey([adm4Id], this.options.villages, "id");
				this.formModel.locationId = this.formModel.adm4.locationId;
			}

			for (let i = 1; i <= 4; i += 1) {
				delete this.formModel[`adm${i}Id`];
			}

			this.mapping = false;
			this.$emit("mapped");
			this.mapping = false;
		},

		eraseData(type) {
			switch (type) {
				case "adm1":
					this.formModel.adm2 = null;
					this.formModel.adm3 = null;
					this.formModel.adm4 = null;
					break;
				case "adm2":
					this.formModel.adm3 = null;
					this.formModel.adm4 = null;
					break;
				case "adm3":
					this.formModel.adm4 = null;
					break;
				default:
					break;
			}
		},
	},
};
</script>
