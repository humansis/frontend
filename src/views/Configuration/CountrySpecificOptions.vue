<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">{{ $t('Country Specific Options') }}</h1>
			</div>

			<div class="level-right">
				<b-button
					type="is-primary"
					icon-left="plus"
					@click="addNewCountrySpecificOption"
				>
					{{ $t('Add') }}
				</b-button>
			</div>
		</div>

		<Modal
			can-cancel
			:active="countrySpecificOptionModal.isOpened"
			:header="modalHeader"
			:is-waiting="countrySpecificOptionModal.isWaiting"
			@close="closeCountrySpecificOptionModal"
		>
			<CountrySpecificOptionForm
				close-button
				class="modal-card"
				:formModel="countrySpecificOptionModel"
				:submit-button-label="$t('Update')"
				:form-disabled="countrySpecificOptionModal.isDetail"
				@formSubmitted="submitCountrySpecificOptionForm"
				@formClosed="closeCountrySpecificOptionModal"
			/>
		</Modal>

		<CountrySpecificOptionsList
			ref="countrySpecificOptionsList"
			@onRemove="onRemoveCountrySpecificOption"
			@onShowDetail="showDetail"
			@onShowEdit="editCountrySpecificOption"
		/>
	</div>
</template>

<script>
import { mapState } from "vuex";
import CountrySpecificOptionForm from "@/components/Configuration/CountrySpecificOptionForm";
import CountrySpecificOptionsList from "@/components/Configuration/CountrySpecificOptionsList";
import Modal from "@/components/Modal";
import CountrySpecificOptionsService from "@/services/CountrySpecificOptionsService";
import { Toast } from "@/utils/UI";

export default {
	name: "CountrySpecificOptionPage",

	components: {
		CountrySpecificOptionsList,
		Modal,
		CountrySpecificOptionForm,
	},

	data() {
		return {
			countrySpecificOptionModal: {
				isOpened: false,
				isDetail: false,
				isEditing: false,
				isWaiting: false,
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
		...mapState(["country"]),

		modalHeader() {
			let result = "";
			if (this.countrySpecificOptionModal.isDetail) {
				result = this.$t("Detail of Country Specific Option");
			} else if (this.countrySpecificOptionModal.isEditing) {
				result = this.$t("Edit Specific Option");
			} else {
				result = this.$t("Create New Country Specific Option");
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
				isWaiting: false,
			};
		},

		editCountrySpecificOption(countrySpecificOption) {
			this.mapToFormModel(countrySpecificOption);
			this.countrySpecificOptionModal = {
				isOpened: true,
				isDetail: false,
				isEditing: true,
				isWaiting: false,
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
				isEditing: false,
				isWaiting: false,
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
				target: target?.code,
				iso3: iso3 || this.country.iso3,
			};

			if (this.countrySpecificOptionModal.isEditing && id) {
				this.updateCountrySpecificOption(id, countrySpecificOptionBody);
			} else {
				this.createCountrySpecificOption(countrySpecificOptionBody);
			}
		},

		async createCountrySpecificOption(countrySpecificOptionBody) {
			this.countrySpecificOptionModal.isWaiting = true;

			await CountrySpecificOptionsService.createCountrySpecificOption(countrySpecificOptionBody)
				.then((response) => {
					if (response.status === 200) {
						Toast(
							this.$t("Country Specific Option Successfully Created"), "is-success",
						);
						this.$refs.countrySpecificOptionsList.fetchData();
						this.closeCountrySpecificOptionModal();
					}
				}).catch((e) => {
					Toast(`${this.$t("Country Specific Options")} ${e}`, "is-danger");
					this.countrySpecificOptionModal.isWaiting = false;
				});
		},

		async updateCountrySpecificOption(id, countrySpecificOptionBody) {
			this.countrySpecificOptionModal.isWaiting = true;

			await CountrySpecificOptionsService.updateCountrySpecificOption(id, countrySpecificOptionBody)
				.then((response) => {
					if (response.status === 200) {
						Toast(
							this.$t("Country Specific Option Successfully Updated"), "is-success",
						);
						this.$refs.countrySpecificOptionsList.fetchData();
						this.closeCountrySpecificOptionModal();
					}
				}).catch((e) => {
					Toast(`${this.$t("Country Specific Options")} ${e}`, "is-danger");
					this.countrySpecificOptionModal.isWaiting = false;
				});
		},

		async onRemoveCountrySpecificOption(id) {
			await CountrySpecificOptionsService.deleteCountrySpecificOption(id)
				.then((response) => {
					if (response.status === 204) {
						Toast(
							this.$t("Country Specific Option Successfully Removed"), "is-success",
						);
						this.$refs.countrySpecificOptionsList.removeFromList(id);
					}
				}).catch((e) => {
					Toast(`${this.$t("Country Specific Options")} ${e}`, "is-danger");
				});
		},
	},
};
</script>
