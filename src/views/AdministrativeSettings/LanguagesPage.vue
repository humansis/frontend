<template>
	<div>
		<Modal
			can-cancel
			:active="languageModal.isOpened"
			:header="modalHeader"
			:is-waiting="languageModal.isWaiting"
			@close="closeLanguageModal"
		>
			<LanguagesForm
				close-button
				class="modal-card"
				:formModel="languageModel"
				:submit-button-label="'Add'"
				:form-disabled="languageModal.isDetail"
				@formSubmitted="submitLanguageForm"
				@formClosed="closeLanguageModal"
			/>
		</Modal>
		<b-button
			class="mb-4"
			type="is-primary"
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
import LanguagesForm from "@/components/AdministrativeSettings/LanguagesForm";
import LanguagesList from "@/components/AdministrativeSettings/LanguagesList";
import Modal from "@/components/Modal";
import LanguagesService from "@/services/LanguagesService";
import { Toast } from "@/utils/UI";

export default {
	name: "LanguagesPage",

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
				isWaiting: false,
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
				result = "Detail of Language";
			} else {
				result = "Add New Language";
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
				isWaiting: false,
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
				isWaiting: false,
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
		},

		async createLanguage(languageBody) {
			this.languageModal.isWaiting = true;

			await LanguagesService.createLanguage(languageBody)
				.then((response) => {
					if (response.status === 200) {
						Toast("Language Successfully Added", "is-success");
						this.$refs.languagesList.fetchData();
						this.closeLanguageModal();
					}
				}).catch((e) => {
					Toast(`Language ${e}`, "is-danger");
					this.languageModal.isWaiting = false;
				});
		},
	},
};
</script>
