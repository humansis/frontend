<!-- TODO Not used for now -->
<template>
	<div>
		<Modal
			can-cancel
			:active="countryModal.isOpened"
			:header="modalHeader"
			:is-waiting="countryModal.isWaiting"
			@close="closeCountryModal"
		>
			<CountryForm
				close-button
				class="modal-card"
				:formModel="countryModel"
				:submit-button-label="countryModal.isEditing ? $t('Update') : $t('Create')"
				:form-disabled="countryModal.isDetail"
				@formSubmitted="submitCountryForm"
				@formClosed="closeCountryModal"
			/>
		</Modal>
		<b-button
			class="mb-4"
			type="is-primary"
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
import CountriesList from "@/components/AdministrativeSettings/CountriesList";
import CountryForm from "@/components/AdministrativeSettings/CountryForm";
import Modal from "@/components/Modal";
import CountriesService from "@/services/CountriesService";
import { Toast } from "@/utils/UI";

export default {
	name: "CountriesPage",

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
				isWaiting: false,
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
				result = this.$t("Detail of Country");
			} else if (this.countryModal.isEditing) {
				result = this.$t("Edit Country");
			} else {
				result = this.$t("Create New Country");
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
				isWaiting: false,
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
				isWaiting: false,
			};
		},

		addNewCountry() {
			this.countryModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
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
		},

		async createCountry(countryBody) {
			this.countryModal.isWaiting = true;

			await CountriesService.createCountry(countryBody).then((response) => {
				if (response.status === 200) {
					Toast(this.$t("Country Successfully Created"), "is-success");
					this.$refs.countriesList.fetchData();
					this.closeCountryModal();
				}
			}).catch((e) => {
				Toast(`${this.$t("Country")} ${e}`, "is-danger");
				this.countryModal.isWaiting = false;
			});
		},

		async updateCountry(id, countryBody) {
			this.countryModal.isWaiting = true;

			await CountriesService.updateCountry(id, countryBody).then((response) => {
				if (response.status === 200) {
					Toast(this.$t("Country Successfully Updated"), "is-success");
					this.$refs.countriesList.fetchData();
					this.closeCountryModal();
				}
			}).catch((e) => {
				Toast(`${this.$t("Country")} ${e}`, "is-danger");
				this.countryModal.isWaiting = false;
			});
		},

		async removeCountry(id) {
			await CountriesService.deleteCountry(id).then((response) => {
				if (response.status === 204) {
					Toast(this.$t("Country successfully removed"), "is-success");
					this.$refs.countriesList.removeFromList(id);
				}
			}).catch((e) => {
				Toast(`${this.$t("Country")} ${e}`, "is-danger");
			});
		},
	},
};
</script>
