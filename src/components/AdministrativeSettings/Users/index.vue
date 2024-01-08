<template>
	<Modal
		v-model="userModal.isOpened"
		:header="modalHeader"
	>
		<UserForm
			:form-model="userModel"
			:submit-button-label="userModal.isEditing ? 'Update' : 'Create'"
			:is-editing="userModal.isEditing"
			:form-disabled="userModal.isDetail"
			close-button
			@formSubmitted="onSubmitUserForm"
			@formClosed="onCloseUserModal"
		/>
	</Modal>

	<div class="d-flex justify-end">
		<v-btn
			v-if="userCan.addEditUsers"
			class="text-none ml-0 mb-3"
			color="primary"
			prepend-icon="plus"
			@click="onAddNewUser"
		>
			{{ $t('Add') }}
		</v-btn>
	</div>

	<UsersList
		ref="usersList"
		@delete="onRemoveUser"
		@showEdit="onEditUser"
		@showDetail="onShowDetail"
	/>
</template>

<script>
import UsersService from "@/services/UsersService";
import UserForm from "@/components/AdministrativeSettings/Users/Form";
import UsersList from "@/components/AdministrativeSettings/Users/List";
import Modal from "@/components/Inputs/Modal";
import permissions from "@/mixins/permissions";
import { getArrayOfIdsByParam } from "@/utils/codeList";
import { Notification } from "@/utils/UI";

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
				firstName: "",
				lastName: "",
				position: "",
				rights: [],
				projectIds: [],
				countries: [],
				language: null,
				phonePrefix: [],
				phoneNumber: null,
				roles: [],
				disabledCountry: true,
				disabledProject: true,
				newUser: false,
			},
		};
	},

	computed: {
		modalHeader() {
			if (this.userModal.isDetail) {
				return "Detail of User";
			}

			if (this.userModal.isEditing) {
				return "Edit User";
			}

			return "Create New User";
		},
	},

	methods: {
		onEditUser(user) {
			this.mapToFormModel(user);
			this.userModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
		},

		onAddNewUser() {
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
				firstName: "",
				lastName: "",
				position: "",
				rights: [],
				projectIds: [],
				roles: [],
				countries: [],
				language: null,
				phonePrefix: null,
				phoneNumber: null,
				disabledCountry: true,
				disabledProject: true,
				newUser: true,
			};
		},

		onShowDetail(user) {
			this.mapToFormModel(user);
			this.userModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
				isWaiting: false,
			};
		},

		onCloseUserModal() {
			this.userModal.isOpened = false;
		},

		onSubmitUserForm(userForm) {
			const {
				id,
				email,
				firstName,
				lastName,
				position,
				rights,
				projectIds,
				countries,
				phonePrefix,
				phoneNumber,
				language,
				disabledCountry,
				disabledProject,
			} = userForm;

			const userBody = {
				username: email,
				email,
				firstName,
				lastName,
				position,
				roles: [rights.code],
				projectIds: !disabledProject ? getArrayOfIdsByParam(projectIds, "id") : [],
				countries: !disabledCountry ? getArrayOfIdsByParam(countries, "iso3") : [],
				phonePrefix: phonePrefix?.code,
				phoneNumber: phoneNumber || null,
				language: language?.key || null,
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
				firstName,
				lastName,
				position,
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
				firstName,
				lastName,
				position,
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
				if (response?.status === 200) {
					Notification(this.$t("User Successfully Created"), "success");
					this.$refs.usersList.fetchData();
					this.onCloseUserModal();
				}
			}).catch((e) => {
				Notification(`${this.$t("User")} ${e.message || e}`, "error");
				this.userModal.isWaiting = false;
			});
			this.userModal.isWaiting = false;
		},

		async updateUser(id, userBody) {
			this.userModal.isWaiting = true;

			await UsersService.updateUser(id, userBody).then((response) => {
				if (response?.status === 200) {
					Notification(this.$t("User Successfully Updated"), "success");
					this.$refs.usersList.fetchData();
					this.onCloseUserModal();
				}
			}).catch((e) => {
				Notification(`${this.$t("User")} ${e.message || e}`, "error");
				this.userModal.isWaiting = false;
			});
		},

		async onRemoveUser(id) {
			await UsersService.deleteUser(id).then((response) => {
				if (response.status === 204) {
					Notification(this.$t("User Successfully Deleted"), "success");
					this.$refs.usersList.removeFromList(id);
				}
			}).catch((e) => {
				Notification(`${this.$t("User")} ${e.message || e}`, "error");
			});
		},
	},
};
</script>
