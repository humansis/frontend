<template>
	<div>
		<h2 class="title">New Assistance</h2>
		<form>
			<LocationForm
				ref="locationForm"
				:form-model="formModel"
			/>
			<b-field
				label="Date of Assistance"
			>
				<b-datepicker
					v-model="formModel.dateOfAssistance"
					show-week-number
					locale="en-GB"
					placeholder="Click to select..."
					icon="calendar-day"
					trap-focus
				/>
			</b-field>

			<b-field
				label="Target"
				:type="validateType('target')"
				:message="validateMsg('target', 'Target is Required')"
			>
				<div class="block">
					<b-radio
						v-model="formModel.target"
						name="target"
						native-value="Household"
					>
						Household
					</b-radio>
					<b-radio
						v-model="formModel.target"
						name="target"
						native-value="Individual"
					>
						Individual
					</b-radio>
				</div>
			</b-field>
		</form>
	</div>
</template>

<script>
import { Toast } from "@/utils/UI";
import { required } from "vuelidate/lib/validators";
import LocationsService from "@/services/LocationsService";
import LocationForm from "@/components/LocationForm";
import Validation from "@/mixins/validation";

export default {
	name: "NewAssistanceForm",

	components: { LocationForm },

	updated() {
		// TODO Emit only if form is validated else emit false
		this.$emit("updatedData", this.formModel);
	},

	mixins: [Validation],

	data() {
		return {
			formModel: {
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
				dateOfAssistance: new Date(),
				target: "",
			},
			provinces: [],
			districts: [],
			communes: [],
			villages: [],
		};
	},

	validations: {
		formModel: {
			target: {
				required,
			},
			adm1: {
			},
			adm2: {
			},
			adm3: {
			},
			adm4: {
			},
			dateOfAssistance: {
			},
		},
	},

	mounted() {
		this.fetchProvinces();
	},

	methods: {
		submit() {
			this.$v.$touch();
			const validLocationForm = this.$refs.locationForm.submitLocationForm();
			return this.$v.$invalid || validLocationForm;
		},

		onProvinceSelect({ id }) {
			this.fetchDistricts(id);
		},

		onDistrictSelect({ id }) {
			this.fetchCommunes(id);
		},

		onCommuneSelect({ id }) {
			this.fetchVillages(id);
		},

		fetchProvinces() {
			LocationsService.getListOfAdm1()
				.then((result) => { this.provinces = result.data; })
				.catch((e) => {
					Toast(`(Provinces) ${e}`, "is-danger");
				});
		},

		fetchDistricts(adm1Id) {
			LocationsService.getListOfAdm2(adm1Id)
				.then((result) => { this.districts = result.data; })
				.catch((e) => {
					Toast(`(Districts) ${e}`, "is-danger");
				});
		},

		fetchCommunes(adm2Id) {
			LocationsService.getListOfAdm3(adm2Id)
				.then((result) => { this.communes = result.data; })
				.catch((e) => {
					Toast(`(Communes) ${e}`, "is-danger");
				});
		},

		fetchVillages(adm3Id) {
			LocationsService.getListOfAdm4(adm3Id)
				.then((result) => { this.villages = result.data; })
				.catch((e) => {
					Toast(`(Villages) ${e}`, "is-danger");
				});
		},
	},
};
</script>
