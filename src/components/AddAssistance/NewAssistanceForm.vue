<template>
	<div>
		<h2 class="title">New Assistance</h2>
		<form>
			<b-field
				label="Province"
			>
				<MultiSelect
					v-model="formModel.adm1"
					searchable
					placeholder="Province"
					label="name"
					track-by="id"
					:options="provinces"
					@select="onProvinceSelect"
				/>
			</b-field>

			<b-field
				label="District"
			>
				<MultiSelect
					v-model="formModel.adm2"
					searchable
					placeholder="District"
					label="name"
					track-by="id"
					:options="districts"
					@select="onDistrictSelect"
				/>
			</b-field>

			<b-field
				label="Commune"
			>
				<MultiSelect
					v-model="formModel.adm3"
					searchable
					placeholder="Commune"
					label="name"
					track-by="id"
					:options="communes"
					@select="onCommuneSelect"
				/>
			</b-field>

			<b-field
				label="Village"
			>
				<MultiSelect
					v-model="formModel.adm4"
					searchable
					placeholder="Village"
					label="name"
					track-by="id"
					:options="villages"
				/>
			</b-field>
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
import LocationsService from "@/services/LocationsService";

export default {
	name: "NewAssistanceForm",

	updated() {
		// TODO Emit only if form is validated else emit false
		this.$emit("updatedData", this.formModel);
	},

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

	mounted() {
		this.fetchProvinces();
	},

	methods: {
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
				.then((result) => { this.provinces = result.data; });
		},

		fetchDistricts(adm1Id) {
			LocationsService.getListOfAdm2(adm1Id)
				.then((result) => { this.districts = result.data; });
		},

		fetchCommunes(adm2Id) {
			LocationsService.getListOfAdm3(adm2Id)
				.then((result) => { this.communes = result.data; });
		},

		fetchVillages(adm3Id) {
			LocationsService.getListOfAdm4(adm3Id)
				.then((result) => { this.villages = result.data; });
		},
	},
};
</script>
