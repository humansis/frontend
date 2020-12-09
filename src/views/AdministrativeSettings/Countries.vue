<template>
	<div>
		<Modal
			:active="countryModal.isOpened"
			:can-cancel="true"
			:header="modalHeader"
			@close="closeCountryModal"
		>
			<CountryForm
				close-button
				class="modal-card"
				:formModel="countryModel"
				:submit-button-label="countryModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="countryModal.isDetail"
				@formSubmitted="submitCountryForm"
				@formClosed="closeCountryModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewCountry"
		>
			Add
		</b-button>
		<CountriesList
			ref="countriesList"
			@onShowDetail="showDetail"
			@onRemove="removeCountry"
			@onShowEdit="editCountry"
		/>
	</div>
</template>

<script>
import CountriesService from "@/services/CountriesService";
import CountryForm from "@/components/AdministrativeSettings/CountryForm";
import Modal from "@/components/Modal";
import CountriesList from "@/components/AdministrativeSettings/CountriesList";
import { Toast } from "@/utils/UI";

export default {
	name: "Countries",

	components: {
		Modal,
		CountryForm,
		CountriesList,
	},

	data() {
		return {
			countryModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
			},
			countryModel: {
				id: null,
				name: "",
				iso3: "",
				availableCurrencies: [],
				countryFlag: "",
			},
		};
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.countryModal.isDetail) {
				result = "Detail of Country";
			} else if (this.countryModal.isEditing) {
				result = "Edit Country";
			} else {
				result = "Create new Country";
			}
			return result;
		},
	},

	methods: {
		showDetail(country) {
			this.mapToFormModel(country);
			this.countryModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
			};
		},

		mapToFormModel(
			{
				id,
				name,
				iso3,
				availableCountries,
				countryFlag,
			},
		) {
			this.countryModel = {
				...this.countryModel,
				id,
				name,
				iso3,
				availableCountries,
				countryFlag,
			};
		},

		closeCountryModal() {
			this.countryModal.isOpened = false;
		},

		editCountry(country) {
			this.mapToFormModel(country);
			this.countryModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
			};
		},

		addNewCountry() {
			this.countryModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
			};

			this.countryModel = {
				...this.countryModel,
				id: null,
				name: "",
				iso3: "",
				availableCurrencies: [],
				countryFlag: "",
			};
		},

		submitCountryForm(countryForm) {
			const {
				id,
				name,
				iso3,
				availableCountries,
				countryFlag,
			} = countryForm;

			const countryBody = {
				name,
				iso3,
				availableCountries,
				countryFlag,

			};

			if (this.countryModal.isEditing && id) {
				this.updateCountry(id, countryBody);
			} else {
				this.createCountry(countryBody);
			}

			this.closeCountryModal();
		},

		async createCountry(countryBody) {
			await CountriesService.createCountry(countryBody).then((response) => {
				if (response.status === 200) {
					Toast("Country Successfully Created", "is-success");
					this.$refs.countriesList.fetchData();
				}
			}).catch((e) => {
				Toast(`(Country) ${e}`, "is-danger");
			});
		},

		async updateCountry(id, countryBody) {
			await CountriesService.updateCountry(id, countryBody).then((response) => {
				if (response.status === 200) {
					Toast("Country Successfully Updated", "is-success");
					this.$refs.countriesList.fetchData();
				}
			}).catch((e) => {
				Toast(`(Country) ${e}`, "is-danger");
			});
		},

		async removeCountry(id) {
			await CountriesService.deleteCountry(id).then((response) => {
				if (response.status === 204) {
					Toast("Country successfully removed", "is-success");
					this.$refs.countriesList.fetchData();
				}
			}).catch((e) => {
				Toast(`(Country) ${e}`, "is-danger");
			});
		},
	},
};
</script>
