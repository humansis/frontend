<template>
	<section>
		<b-field label="Type Of Location">
			<MultiSelect
				v-model="formModel.typeOfLocation"
				placeholder="Type Of Location"
				label="value"
				track-by="code"
				:options="options.typeOfLocation"
				:searchable="false"
			/>
		</b-field>
		<div v-if="formModel.typeOfLocation === 'Camp'">
			<b-field label="Camp">
				<MultiSelect
					v-model="formModel.selectedTargetType"
					placeholder="Camp"
					:options="options.camps"
					:searchable="false"
				/>
			</b-field>
			<b-field label="Camp" grouped>
				<b-checkbox v-model="createCamp">Create A Camp</b-checkbox>
				<b-input
					v-if="createCamp"
					v-model="formModel.campName"
					placeholder="Camp name"
				/>
			</b-field>
			<b-field label="Tent Number">
				<b-input
					v-model="formModel.tentNumber"
					placeholder="Tent Number"
				/>
			</b-field>
		</div>
		<div v-else>
			<b-field label="Address Number">
				<b-input
					v-model="formModel.addressNumber"
					placeholder="Address Number"
				/>
			</b-field>
			<b-field label="Address Street">
				<b-input
					v-model="formModel.addressStreet"
					placeholder="Address Street"
				/>
			</b-field>
			<b-field label="Address Postcode">
				<b-input
					v-model="formModel.addressPostCode"
					placeholder="Address Postcode"
				/>
			</b-field>
		</div>
	</section>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import { Toast } from "@/utils/UI";

export default {
	name: "TypeOfLocationForm",

	props: {
		formModel: Object,
	},

	data() {
		return {
			createCamp: false,
			options: {
				typeOfLocation: [],
				camps: [],
			},
		};
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			await BeneficiariesService.getListOfLocationsTypes()
				.then((result) => { this.options.typeOfLocation = result.data; })
				.catch((e) => {
					Toast(`(Location Types) ${e}`, "is-danger");
				});
		},

		submitTypeOfLocationForm() {
			this.$v.$touch();
		},
	},
};
</script>
