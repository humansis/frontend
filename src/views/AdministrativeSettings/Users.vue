<template>
	<div>
		<Modal
			can-cancel
			:active="userModal.isOpened"
			:header="modalHeader"
			:is-waiting="userModal.isWaiting"
			@close="closeUserModal"
		>
			<UserForm
				close-button
				class="modal-card"
				:formModel="userModel"
				:submit-button-label="userModal.isEditing ? $t('Update') : $t('Create')"
				:is-editing="userModal.isEditing"
				:form-disabled="userModal.isDetail"
				@formSubmitted="submitUserForm"
				@formClosed="closeUserModal"
			/>
		</Modal>
		<b-button
			v-if="userCan.addEditUsers"
			class="mb-4"
			type="is-primary"
			icon-left="plus"
			@click="addNewUser"
		>
			{{ $t('Add') }}
		</b-button>
		<UsersList
			ref="usersList"
			@onRemove="removeUser"
			@onShowEdit="editUser"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import UsersList from "@/components/AdministrativeSettings/UsersList";
import UserForm from "@/components/AdministrativeSettings/UserForm";
import Modal from "@/components/Modal";
import UsersService from "@/services/UsersService";
import { Toast } from "@/utils/UI";
import { getArrayOfIdsByParam } from "@/utils/codeList";
import permissions from "@/mixins/permissions";

export default {
	name: "UsersPage",

	components: {
		UsersList,
		Modal,
		UserForm,
	},

	mixins: [permissions],

	data() {
		return {
			userModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
				isWaiting: false,
			},
			userModel: {
				id: null,
				username: "",
				email: "",
				password: "",
				rights: [],
				projectIds: [],
				countries: [],
				language: null,
				phonePrefix: [],
				phoneNumber: "",
				roles: [],
				updatePasswordOnNextLogin: false,
				disabledCountry: true,
				disabledProject: true,
				newUser: false,
			},
		};
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.userModal.isDetail) {
				result = this.$t("Detail of User");
			} else if (this.userModal.isEditing) {
				result = this.$t("Edit User");
			} else {
				result = this.$t("Create New User");
			}
			return result;
		},
	},

	methods: {
		editUser(user) {
			this.mapToFormModel(user);
			this.userModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
		},

		addNewUser() {
			this.userModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};

			this.userModel = {
				...this.userModel,
				id: null,
				username: "",
				email: "",
				password: "",
				rights: [],
				projectIds: [],
				roles: [],
				countries: [],
				language: null,
				phonePrefix: null,
				phoneNumber: "",
				updatePasswordOnNextLogin: false,
				disabledCountry: true,
				disabledProject: true,
				newUser: true,
			};
		},

		showDetail(user) {
			this.mapToFormModel(user);
			this.userModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
				isWaiting: false,
			};
		},

		closeUserModal() {
			this.userModal.isOpened = false;
		},

		submitUserForm(userForm) {
			const {
				id,
				email,
				password,
				rights,
				projectIds,
				countries,
				phonePrefix,
				phoneNumber,
				updatePasswordOnNextLogin,
				language,
				disabledCountry,
				disabledProject,
			} = userForm;

			const userBody = {
				username: email,
				email,
				password,
				roles: [rights.code],
				projectIds: !disabledProject ? getArrayOfIdsByParam(projectIds, "id") : [],
				countries: !disabledCountry ? getArrayOfIdsByParam(countries, "iso3") : [],
				phonePrefix: phonePrefix?.code,
				phoneNumber,
				language: language?.key || null,
				changePassword: updatePasswordOnNextLogin || false,
			};
			if (this.userModal.isEditing && id) {
				this.updateUser(id, userBody);
			} else {
				this.createUser(userBody);
			}
		},

		mapToFormModel(
			{
				id,
				username,
				email,
				password,
				rights,
				projectIds,
				countries,
				phonePrefix,
				phoneNumber,
				roles,
				language,
			},
		) {
			this.userModel = {
				...this.userModel,
				id,
				username,
				email,
				password,
				rights,
				projectIds,
				countries,
				roles,
				phonePrefix,
				phoneNumber,
				language,
			};
		},

		sendHistory(id) {
			UsersService.sendHistory(id);
		},

		async createUser(userBody) {
			this.userModal.isWaiting = true;

			await UsersService.createUser(userBody).then((response) => {
				if (response.status && response.status === 200) {
					Toast(this.$t("User Successfully Created"), "is-success");
					this.$refs.usersList.fetchData();
					this.closeUserModal();
				}
			}).catch((e) => {
				Toast(`${this.$t("User")} ${e}`, "is-danger");
				this.userModal.isWaiting = false;
			});
		},

		async updateUser(id, userBody) {
			this.userModal.isWaiting = true;

			await UsersService.updateUser(id, userBody).then((response) => {
				if (response?.status === 200) {
					Toast(this.$t("User Successfully Updated"), "is-success");
					this.$refs.usersList.fetchData();
					this.closeUserModal();
				}
			}).catch((e) => {
				Toast(`${this.$t("User")} ${e}`, "is-danger");
				this.userModal.isWaiting = false;
			});
		},

		async removeUser(id) {
			await UsersService.deleteUser(id).then((response) => {
				if (response.status === 204) {
					Toast(this.$t("User Successfully Deleted"), "is-success");
					this.$refs.usersList.removeFromList(id);
				}
			}).catch((e) => {
				Toast(`${this.$t("User")} ${e}`, "is-danger");
			});
		},
	},
};
</script>
