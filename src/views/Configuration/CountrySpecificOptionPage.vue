<template>
	<div>
		<h2 class="title">Country Specific Options</h2>
		<Modal
			can-cancel
			is-small
			:active="countrySpecificOptionModal.isOpened"
			:header="modalHeader"
			@close="closeCountrySpecificOptionModal"
		>
			<CountrySpecificOptionForm
				close-button
				class="modal-card"
				:formModel="countrySpecificOptionModel"
				:submit-button-label="'Create'"
				:form-disabled="countrySpecificOptionModal.isDetail"
				@formSubmitted="submitCountrySpecificOptionForm"
				@formClosed="closeCountrySpecificOptionModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewCountrySpecificOption"
		>
			Add
		</b-button>
		<CountrySpecificOptionList
			ref="countrySpecificOptionList"
			@onRemove="onRemoveCountrySpecificOption"
			@onShowDetail="showDetail"
			@onShowEdit="editCountrySpecificOption"
		/>
	</div>
</template>

<script>
import { Toast } from "@/utils/UI";
import CountrySpecificOptionsService from "@/services/CountrySpecificOptionsService";
import CountrySpecificOptionForm from "@/components/Configuration/CountrySpecificOptionForm";
import Modal from "@/components/Modal";
import CountrySpecificOptionList from "@/components/Configuration/CountrySpecificOptionList";

export default {
	name: "CountrySpecificOptionPage",

	components: {
		CountrySpecificOptionList,
		Modal,
		CountrySpecificOptionForm,
	},

	data() {
		return {
			countrySpecificOptionModal: {
				isOpened: false,
				isDetail: false,
				isEditing: false,
			},
			countrySpecificOptionModel: {
				id: null,
				iso3: "",
				field: "",
				type: "",
				target: "",
			},
		};
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.countrySpecificOptionModal.isDetail) {
				result = "Detail of Country Specific Option";
			} else if (this.countrySpecificOptionModal.isEditing) {
				result = "Edit Specific Option";
			} else {
				result = "Create new Country Specific Option";
			}
			return result;
		},
	},

	methods: {
		showDetail(countrySpecificOption) {
			this.mapToFormModel(countrySpecificOption);
			this.countrySpecificOptionModal = {
				isOpened: true,
				isDetail: true,
				isEditing: false,
			};
		},

		editCountrySpecificOption(countrySpecificOption) {
			this.mapToFormModel(countrySpecificOption);
			this.countrySpecificOptionModal = {
				isOpened: true,
				isDetail: false,
				isEditing: true,
			};
		},

		mapToFormModel(
			{
				id,
				iso3,
				field,
				type,
				target,
			},
		) {
			this.countrySpecificOptionModel = {
				...this.countrySpecificOptionModel,
				id,
				iso3,
				field,
				type,
				target,
			};
		},

		closeCountrySpecificOptionModal() {
			this.countrySpecificOptionModal.isOpened = false;
		},

		addNewCountrySpecificOption() {
			this.countrySpecificOptionModal = {
				isOpened: true,
				isDetail: false,
			};

			this.countrySpecificOptionModel = {
				...this.countrySpecificOptionModel,
				id: null,
				iso3: "",
				field: "",
				type: "",
			};
		},

		submitCountrySpecificOptionForm(countrySpecificOptionForm) {
			const {
				id,
				field,
				type,
				target,
				iso3,
			} = countrySpecificOptionForm;

			const countrySpecificOptionBody = {
				field,
				type: type.code,
				target: target.code,
				iso3: iso3 || this.$store.state.country.iso3,
			};

			if (this.countrySpecificOptionModal.isEditing && id) {
				this.updateCountrySpecificOption(id, countrySpecificOptionBody);
			} else {
				this.createCountrySpecificOption(countrySpecificOptionBody);
			}

			this.closeCountrySpecificOptionModal();
		},

		async createCountrySpecificOption(countrySpecificOptionBody) {
			await CountrySpecificOptionsService.createCountrySpecificOption(countrySpecificOptionBody)
				.then((response) => {
					if (response.status === 200) {
						Toast("Country Specific Option Successfully Created", "is-success");
						this.$refs.countrySpecificOptionList.fetchData();
					}
				}).catch((e) => {
					Toast(`(Country Specific Options) ${e}`, "is-danger");
				});
		},

		async updateCountrySpecificOption(id, countrySpecificOptionBody) {
			await CountrySpecificOptionsService.updateCountrySpecificOption(id, countrySpecificOptionBody)
				.then((response) => {
					if (response.status === 200) {
						Toast("Country Specific Option Successfully Updated", "is-success");
						this.$refs.countrySpecificList.fetchData();
					}
				}).catch((e) => {
					Toast(`(Country Specific Options) ${e}`, "is-danger");
				});
		},

		async onRemoveCountrySpecificOption(id) {
			await CountrySpecificOptionsService.deleteCountrySpecificOption(id)
				.then((response) => {
					if (response.status === 204) {
						Toast("Country Specific Option successfully removed", "is-success");
						this.$refs.countrySpecificOptionList.fetchData();
					}
				}).catch((e) => {
					Toast(`(Country Specific Options) ${e}`, "is-danger");
				});
		},
	},
};
</script>
