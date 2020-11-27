<template>
	<div>
		<Modal
			:active="userModal.isOpened"
			:can-cancel="true"
			:header="modalHeader"
			@close="closeUserModal"
		>
			<UserForm
				close-button
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
import { Toast } from "@/utils/UI";
import UserForm from "@/components/AdministrativeSettings/UserForm";
import Modal from "@/components/Modal";
import UsersList from "@/components/AdministrativeSettings/UsersList";

export default {
	name: "Users",

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
			};
		},

		addNewUser() {
			this.userModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
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

			this.closeUserModal();
		},

		closeUserModal() {
			this.userModal.isOpened = false;
		},

		showDetail(user) {
			this.mapToFormModel(user);
			this.userModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
			};
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
			await UsersService.createUser(userBody).then((response) => {
				if (response.status === 200) {
					Toast("User Successfully Created", "is-success");
					this.$refs.usersList.fetchData();
				}
			}).catch((e) => { Toast(e, "is-danger"); });
		},

		async updateUser(id, userBody) {
			await UsersService.updateUser(id, userBody).then((response) => {
				if (response.status === 200) {
					Toast("User Successfully Updated", "is-success");
					this.$refs.usersList.fetchData();
				}
			}).catch((e) => { Toast(e, "is-danger"); });
		},

		async removeUser(id) {
			await UsersService.deleteUser(id).then((response) => {
				if (response.status === 204) {
					Toast("User Successfully Deleted", "is-success");
					this.$refs.usersList.fetchData();
				}
			}).catch((e) => { Toast(e, "is-danger"); });
		},
	},
};
</script>
