<template>
	<div>
		<Modal
			:active="userModal.isOpened"
			:can-cancel="true"
			:header="modalHeader"
			:is-waiting="userModal.isWaiting"
			@close="closeUserModal"
		>
			<UserForm
				close-button
				class="modal-card"
				:formModel="userModel"
				:submit-button-label="userModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="userModal.isDetail"
				@formSubmitted="submitUserForm"
				@formClosed="closeUserModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewUser"
		>
			Add
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
import UsersService from "@/services/UsersService";
import { Toast, Notification } from "@/utils/UI";
import UserForm from "@/components/AdministrativeSettings/UserForm";
import Modal from "@/components/Modal";
import UsersList from "@/components/AdministrativeSettings/UsersList";

export default {
	name: "UsersPage",

	components: {
		UsersList,
		Modal,
		UserForm,
	},

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
				email: "",
				password: "",
				rights: "",
				projects: "",
				countries: "",
				prefix: "",
				phoneNumber: "",
				updatePasswordOnNextLogin: false,
				disabledCountry: true,
				disabledProject: true,
			},
		};
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.userModal.isDetail) {
				result = "Detail of User";
			} else if (this.userModal.isEditing) {
				result = "Edit User";
			} else {
				result = "Create new User";
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
				email: "",
				password: "",
				rights: "",
				organization: "",
				projects: "",
				countries: "",
				prefix: "",
				phoneNumber: "",
				updatePasswordOnNextLogin: false,
				disabledCountry: true,
				disabledProject: true,
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
				organization,
				projects,
				countries,
				prefix,
				phoneNumber,
				updatePasswordOnNextLogin,
			} = userForm;

			const userBody = {
				email,
				password,
				rights,
				organization,
				projects,
				countries,
				prefix,
				phoneNumber,
				updatePasswordOnNextLogin,
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
				email,
				password,
				rights,
				organization,
				projects,
				countries,
				prefix,
				phoneNumber,
				updatePasswordOnNextLogin,
			},
		) {
			this.userModel = {
				...this.userModel,
				id,
				email,
				password,
				rights,
				organization,
				projects,
				countries,
				prefix,
				phoneNumber,
				updatePasswordOnNextLogin,
			};
		},

		sendHistory(id) {
			UsersService.sendHistory(id);
		},

		async createUser(userBody) {
			this.userModal.isWaiting = true;

			await UsersService.createUser(userBody).then((response) => {
				if (response.status === 200) {
					Toast("User Successfully Created", "is-success");
					this.$refs.usersList.fetchData();
					this.closeUserModal();
				}
			}).catch((e) => {
				Notification(`User ${e}`, "is-danger");
				this.userModal.isWaiting = false;
			});
		},

		async updateUser(id, userBody) {
			this.userModal.isWaiting = true;

			await UsersService.updateUser(id, userBody).then((response) => {
				if (response.status === 200) {
					Toast("User Successfully Updated", "is-success");
					this.$refs.usersList.fetchData();
					this.closeUserModal();
				}
			}).catch((e) => {
				Notification(`User ${e}`, "is-danger");
				this.userModal.isWaiting = false;
			});
		},

		async removeUser(id) {
			await UsersService.deleteUser(id).then((response) => {
				if (response.status === 204) {
					Toast("User Successfully Deleted", "is-success");
					this.$refs.usersList.removeFromList(id);
				}
			}).catch((e) => {
				Notification(`User ${e}`, "is-danger");
			});
		},
	},
};
</script>
