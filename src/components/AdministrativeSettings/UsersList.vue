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
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input placeholder="Search..."
						type="search"
						icon="search"
					/>
				</b-field>
			</div>
		</div>

		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>

			<b-table-column
				v-slot="props"
				label="Actions"
			>
				<div class="block">
					<ActionButton
						icon="history"
						type="is-link"
						@click.native="sendHistory(props.row.id)"
					/>
					<ActionButton
						icon="search"
						type="is-link"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="editUser(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="User"
						:id="props.row.id"
						@submitted="onUserDelete"
					/>
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import { generateColumns } from "@/utils/datagrid";
import SafeDelete from "@/components/SafeDelete";
import UsersService from "@/services/UsersService";
import { Toast } from "@/utils/UI";
import UserForm from "@/components/AdministrativeSettings/UserForm";
import Modal from "@/components/Modal";

export default {
	name: "UsersList",

	components: {
		Modal,
		UserForm,
		SafeDelete,
		Table,
		ActionButton,
	},

	data() {
		return {
			fetch: {
				error: null,
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "email",
						label: "Email",
					},
					{
						key: "rights",
						label: "Rights",
					},
					{
						key: "prefix",
						label: "Prefix",
					},
					{
						key: "phoneNumber",
						label: "Phone Number",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
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
			},
		};
	},

	watch: {
		$route: "fetchData",
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

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open();

				await UsersService.getListOfUsers(
					this.table.currentPage,
					this.table.perPage,
					"desc",
				).then((response) => {
					this.table.data = response.data;
					this.table.total = response.totalCount;
					this.table.columns = generateColumns(
						this.table.visibleColumns,
					);
				});

				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
		},

		editUser(id) {
			this.userModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
			};

			this.mapToFormModel(this.table.data.find((item) => item.id === id));
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
				projects: "",
				countries: "",
				prefix: "",
				phoneNumber: "",
				updatePasswordOnNextLogin: false,
			};
		},

		submitUserForm(userForm) {
			const {
				id,
				email,
				password,
				rights,
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

		async createUser(userBody) {
			await UsersService.createUser(userBody).then((response) => {
				if (response.status === 200) {
					Toast("User Successfully Created", "is-success");
					this.fetchData();
				}
			});
		},

		async updateUser(id, userBody) {
			await UsersService.updateUser(id, userBody).then((response) => {
				if (response.status === 200) {
					Toast("User Successfully Updated", "is-success");
					this.fetchData();
				}
			});
		},

		async onUserDelete(id) {
			await UsersService.deleteUser(id).then((response) => {
				if (response.status === 204) {
					Toast("User Successfully Deleted", "is-success");
					this.fetchData();
				}
			});
		},

		closeUserModal() {
			this.userModal.isOpened = false;
		},

		showDetailWithId(id) {
			const user = this.table.data.find((item) => item.id === id);
			this.showDetail(user);
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

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},
	},
};
</script>
