<template>
	<div>
		<Modal
			can-cancel
			:active="languageModal.isOpened"
			:header="modalHeader"
			@close="closeLanguageModal"
		>
			<LanguagesForm
				close-button
				:formModel="languageModel"
				:submit-button-label="'Create'"
				:form-disabled="languageModal.isDetail"
				@formSubmitted="submitLanguageForm"
				@formClosed="closeLanguageModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewLanguage"
		>
			Add
		</b-button>
		<LanguagesList
			ref="languagesList"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import CountrySpecificOptionsService from "@/services/CountrySpecificOptionsService";
import { Toast } from "@/utils/UI";
import Modal from "@/components/Modal";
import LanguagesForm from "@/components/AdministrativeSettings/LanguagesForm";
import LanguagesList from "@/components/AdministrativeSettings/LanguagesList";

export default {
	name: "Languages",

	components: {
		LanguagesList,
		LanguagesForm,
		Modal,
	},

	data() {
		return {
			languageModal: {
				isOpened: false,
				isDetail: false,
			},
			languageModel: {
				id: null,
				name: "",
				published: false,
			},
		};
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.languageModal.isDetail) {
				result = "Detail of Country Specifics";
			} else {
				result = "Create new Country Specifics";
			}
			return result;
		},
	},

	methods: {
		showDetail(language) {
			this.mapToFormModel(language);
			this.languageModal = {
				isOpened: true,
				isDetail: true,
			};
		},

		mapToFormModel(
			{
				id,
				name,
				published,
			},
		) {
			this.languageModel = {
				...this.languageModel,
				id,
				name,
				published,
			};
		},

		closeLanguageModal() {
			this.languageModal.isOpened = false;
		},

		addNewLanguage() {
			this.languageModal = {
				isOpened: true,
				isDetail: false,
			};

			this.languageModel = {
				...this.languageModel,
				id: null,
				name: "",
				published: false,
			};
		},

		submitLanguageForm(languageForm) {
			const {
				name,
				published,
			} = languageForm;

			const languageBody = {
				name,
				published,
			};

			this.createLanguage(languageBody);

			this.closeLanguageModal();
		},

		async createLanguage(languageBody) {
			await CountrySpecificOptionsService.createCountrySpecificOption(languageBody)
				.then((response) => {
					if (response.status === 200) {
						Toast("Country Specifics Successfully Created", "is-success");
						this.$refs.languagesList.fetchData();
					}
				});
		},
	},
};
</script>
