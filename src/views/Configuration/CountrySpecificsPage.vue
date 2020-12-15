<template>
	<div>
		<h2 class="title">Country Specific Options</h2>
		<Modal
			can-cancel
			is-small
			:active="countrySpecificsModal.isOpened"
			:header="modalHeader"
			@close="closeCountrySpecificsModal"
		>
			<CountrySpecificsForm
				close-button
				class="modal-card"
				:formModel="countrySpecificsModel"
				:submit-button-label="'Create'"
				:form-disabled="countrySpecificsModal.isDetail"
				@formSubmitted="submitCountrySpecificsForm"
				@formClosed="closeCountrySpecificsModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewCountrySpecifics"
		>
			Add
		</b-button>
		<CountrySpecificsList
			ref="countrySpecificList"
			@onRemove="onRemoveCountrySpecifics"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import CountrySpecificOptionsService from "@/services/CountrySpecificOptionsService";
import CountrySpecificsForm from "@/components/Configuration/CountrySpecificsForm";
import { Toast, Notification } from "@/utils/UI";
import Modal from "@/components/Modal";
import CountrySpecificsList from "@/components/Configuration/CountrySpecificsList";

export default {
	name: "CountrySpecificsPage",

	components: {
		CountrySpecificsList,
		Modal,
		CountrySpecificsForm,
	},

	data() {
		return {
			countrySpecificsModal: {
				isOpened: false,
				isDetail: false,
			},
			countrySpecificsModel: {
				id: null,
				field: "",
				type: "",
				target: "",
			},
		};
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.countrySpecificsModal.isDetail) {
				result = "Detail of Country Specifics";
			} else {
				result = "Create new Country Specifics";
			}
			return result;
		},
	},

	methods: {
		showDetail(countrySpecifics) {
			this.mapToFormModel(countrySpecifics);
			this.countrySpecificsModal = {
				isOpened: true,
				isDetail: true,
			};
		},

		mapToFormModel(
			{
				id,
				field,
				type,
				target,
			},
		) {
			this.countrySpecificsModel = {
				...this.countrySpecificsModel,
				id,
				field,
				type,
				target,
			};
		},

		closeCountrySpecificsModal() {
			this.countrySpecificsModal.isOpened = false;
		},

		addNewCountrySpecifics() {
			this.countrySpecificsModal = {
				isOpened: true,
				isDetail: false,
			};

			this.countrySpecificsModel = {
				...this.countrySpecificsModel,
				id: null,
				field: "",
				type: "",
			};
		},

		submitCountrySpecificsForm(countrySpecificsForm) {
			const {
				field,
				type,
				target,
			} = countrySpecificsForm;

			const countrySpecificsBody = {
				field,
				type,
				target,
				iso3: this.$store.state.country,
			};

			this.createCountrySpecifics(countrySpecificsBody);

			this.closeCountrySpecificsModal();
		},

		async createCountrySpecifics(countrySpecificsBody) {
			await CountrySpecificOptionsService.createCountrySpecificOption(countrySpecificsBody)
				.then((response) => {
					if (response.status === 200) {
						Toast("Country Specifics Successfully Created", "is-success");
						this.$refs.countrySpecificList.fetchData();
					}
				}).catch((e) => {
					Notification(`Country Specific Options ${e}`, "is-danger");
				});
		},

		async onRemoveCountrySpecifics(id) {
			await CountrySpecificOptionsService.deleteCountryOption(id)
				.then((response) => {
					if (response.status === 204) {
						Toast("Country Specifics successfully removed", "is-success");
						this.$refs.countrySpecificList.fetchData();
					}
				}).catch((e) => {
					Notification(`Country Specific Options ${e}`, "is-danger");
				});
		},
	},
};
</script>
