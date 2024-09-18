<template>
	<v-container fluid>
		<ConfirmAction
			:is-dialog-opened="autoPermissionManagerModal.isOpened"
			:confirm-title="autoPermissionManagerModal.title"
			close-button-name="No"
			close-button-color="blue-grey-lighten-4"
			confirm-button-name="Yes"
			confirm-button-color="primary"
			@modalClosed="closeAutoPermissionsManagerModal"
			@actionConfirmed="unselectOrSelectPermissions"
		>
			<template v-slot:customContent>
				<p class="text-body-2">{{ $t(autoPermissionManagerModal.message) }}</p>

				<ul class="pl-7 pt-3">
					<li
						v-for="permission in autoPermissionManagerModal.dependenciesPermissions"
						:key="permission.key"
					>
						{{ permission.label }}
					</li>
				</ul>
			</template>
		</ConfirmAction>

		<v-card class="mx-auto mt-5">
			<v-card-title class="text-h5 font-weight-bold">
				{{ $t(pageTitle) }}
			</v-card-title>

			<v-card-text>
				<v-row class="mt-1">
					<v-col cols="12" sm="6">
						<DataInput
							v-model="formModel.roleName"
							:disabled="roleAction.isDetail"
							:error-messages="validationMsg('roleName')"
							label="Role Name"
							name="role-name"
							class="mb-4"
							@update:modelValue="onValidate('roleName')"
						/>
					</v-col>
				</v-row>

				<h2 class="text-h6 font-weight-bold mb-1 mt-3">{{ $t('Data Access') }}</h2>

				<DataAccessManager
					v-model:groups="formModel.dataForPermissions"
					ref="accessManager"
					:is-loading="loading.isPermissions"
					:is-form-disabled="isDataAccessFormDisabled"
					property-name-for-access-group="permissions"
					property-name-for-access-label="label"
					is-note-panel-visible
					@data-in-group-updated="checkboxStatusUpdatedInGroup"
					@selected-all="selectedAllPermissionsInGroup"
				/>
			</v-card-text>
		</v-card>

		<v-row class="mt-5">
			<v-col class="d-flex justify-end">
				<v-btn
					:to="{ name: ROUTER.ROUTE_NAME.ROLES.ROOT }"
					color="blue-grey-lighten-4"
					variant="elevated"
					class="text-none"
				>
					{{ goBackButtonName }}
				</v-btn>

				<v-btn
					v-if="!roleAction.isDetail"
					color="primary"
					class="text-none ml-3"
					@click="validateNewRole"
				>
					{{ validateButtonName }}
				</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>
<script>

import { required } from "@vuelidate/validators";
import RolesService from "@/services/RolesService";
import ConfirmAction from "@/components/ConfirmAction";
import DataAccessManager from "@/components/DataAccessManager";
import DataInput from "@/components/Inputs/DataInput";
import userPermissions from "@/mixins/permissions";
import validation from "@/mixins/validation";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { ROLE, ROUTER } from "@/consts";

export default {
	components: { ConfirmAction, DataInput, DataAccessManager },

	mixins: [validation, userPermissions],

	validations() {
		return {
			formModel: {
				roleName: { required },
			},
		};
	},

	data() {
		return {
			ROUTER,
			pageTitle: "",
			roleAction: {},
			formModel: {
				id: null,
				roleName: "",
				dataForPermissions: [],
			},
			loading: {
				isPermissions: false,
			},
			autoPermissionManagerModal: {
				isOpened: false,
				isUnselect: false,
				title: "",
				message: "",
				selectedPermission: {},
			},
		};
	},

	computed: {
		validateButtonName() {
			return this.$t(this.roleAction.isCreate ? "Create" : "Update");
		},

		goBackButtonName() {
			return this.$t(this.roleAction.isDetail ? "Close" : "Cancel");
		},

		roleId() {
			return this.$route.params.roleId;
		},

		isDataAccessFormDisabled() {
			return this.roleAction.isDetail
				|| !this.isUserPermissionGranted(this.PERMISSIONS.ADMINISTRATIVE_SETTING_ROLE_MANAGEMENT);
		},
	},

	async created() {
		this.getRoleAction();
		await this.getPermissions();

		if (!this.roleAction.isCreate) {
			const role = await this.fetchRole(this.$route.params.roleId);
			this.mapToFormModel(role);
		}
	},

	methods: {
		async createRole(roleBody) {
			try {
				const {
					status,
					message,
				} = await RolesService.createRole(roleBody);

				checkResponseStatus(status, message, 201);

				Notification(this.$t("Role Successfully Created"), "success");
			} catch (e) {
				Notification(`${this.$t("Role")}: ${e.message || e}`, "error");
			} finally {
				this.$router.push({ name: ROUTER.ROUTE_NAME.ROLES.ROOT });
			}
		},

		async updateRole(id, roleBody) {
			try {
				const {
					status,
					message,
				} = await RolesService.updateRole({
					body: roleBody,
					id,
				});

				checkResponseStatus(status, message);

				Notification(this.$t("Role Successfully Updated"), "success");
			} catch (e) {
				Notification(`${this.$t("Role")}: ${e.message || e}`, "error");
			} finally {
				this.$router.push({ name: ROUTER.ROUTE_NAME.ROLES.ROOT });
			}
		},

		async fetchRole(id) {
			try {
				const {
					data,
					status,
					message,
				} = await RolesService.getDetailOfRole(id);

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Role")}: ${e.message || e}`, "error");
			}

			return {};
		},

		validateNewRole() {
			this.v$.$touch();

			if (this.v$.$invalid) return;

			this.submitUserForm(this.formModel);
			this.v$.$reset();
		},

		submitUserForm(roleForm) {
			const permissions = [];
			const {
				id,
				roleName,
				dataForPermissions,
			} = roleForm;

			Object.entries(dataForPermissions).forEach(([, group]) => {
				group.permissions.forEach((permission) => {
					if (permission.isSelected) {
						permissions.push(permission.key);
					}
				});
			});

			const roleBody = {
				name: roleName,
				permissions,
			};

			if (this.roleAction.isEdit && id) {
				this.updateRole(id, roleBody);
			} else {
				this.createRole(roleBody);
			}
		},

		async getPermissions() {
			try {
				this.loading.isPermissions = true;

				const {
					data,
					status,
					message,
				} = await RolesService.getListOfPermissions();

				checkResponseStatus(status, message);

				this.prepareDataForPermissions(data);
			} catch (e) {
				Notification(`${this.$t("Permissions List")}: ${e.message || e}`, "error");
			} finally {
				this.loading.isPermissions = false;
			}
		},

		mapToFormModel({
			id,
			name,
			permissions,
		}) {
			const { dataForPermissions } = this.formModel;

			Object.entries(this.formModel.dataForPermissions).forEach(([key]) => {
				this.formModel.dataForPermissions[key].permissions.forEach((permission, index) => {
					if (permissions.includes(permission.key)) {
						dataForPermissions[key].permissions[index].isSelected = true;
					}
				});
			});

			this.formModel = {
				...this.formModel,
				id,
				roleName: name,
			};
		},

		prepareDataForPermissions(permissions) {
			const permissionsGroups = {};

			permissions.forEach((permission) => {
				if (!permission.isAssignable) return;

				if (!permissionsGroups[permission.group]) {
					const groupIcon = ROLE.DATA_ACCESS_GROUP_ICONS[
						permission.group.toUpperCase().replace(" ", "_")
					];

					permissionsGroups[permission.group] = {
						groupName: permission.group,
						groupIcon,
						permissions: [],
					};
				}

				permissionsGroups[permission.group].permissions.push(permission);
			});

			this.formModel.dataForPermissions = permissionsGroups;
		},

		getUnselectedDependencies(dependencies, allPermissions) {
			let unselectedPermissions = [];

			dependencies.forEach((dependency) => {
				const dependencyPermission = allPermissions.find(
					(permission) => permission.key === dependency,
				);

				if (dependencyPermission) {
					if (!dependencyPermission.isSelected) {
						unselectedPermissions.push(dependencyPermission);
					}

					if (dependencyPermission.dependencies && dependencyPermission.dependencies.length > 0) {
						unselectedPermissions = [
							...unselectedPermissions,
							...this.getUnselectedDependencies(
								dependencyPermission.dependencies,
								allPermissions,
							),
						];
					}
				}
			});

			return unselectedPermissions;
		},

		checkboxStatusUpdatedInGroup({ groupIndex, dataAccess }) {
			if (!dataAccess) return;

			const { dependencies } = dataAccess;
			const selectedPermission = dataAccess;

			this.autoPermissionManagerModal = {
				...this.autoPermissionManagerModal,
				selectedPermission,
				groupIndex,
			};

			if (dataAccess.isSelected) {
				const notSelectedPermissionsForDependencies = Object.values(
					this.formModel.dataForPermissions,
				).flatMap((permissionsGroup) => this.getUnselectedDependencies(
					dependencies,
					permissionsGroup.permissions,
				));

				if (notSelectedPermissionsForDependencies.length) {
					this.autoPermissionManagerModal = {
						...this.autoPermissionManagerModal,
						isOpened: true,
						isUnselect: false,
						title: "Select permissions automatically?",
						message: `If you want to select (${selectedPermission.label}) permission,
					 it is necessary to select prerequisites for this permission.
					 Do you want to assign prerequisites permissions automatically?`,
						dependenciesPermissions: notSelectedPermissionsForDependencies,
					};
				}
			} else {
				const selectedPermissionsAsDependencies = Object.values(this.formModel.dataForPermissions)
					.flatMap((permissionsGroup) => permissionsGroup.permissions.filter(
						(permission) => permission.dependencies.includes(selectedPermission.key)
							&& permission.isSelected,
					));

				if (selectedPermissionsAsDependencies.length) {
					this.autoPermissionManagerModal = {
						...this.autoPermissionManagerModal,
						isOpened: true,
						isUnselect: true,
						title: "Unselect permissions automatically?",
						message: `If you want to unselect (${selectedPermission.label}) permission,
					 it is necessary to unselected permissions which have this permission as prerequisites.
					 Do you want to unassign permissions automatically?`,
						dependenciesPermissions: selectedPermissionsAsDependencies,
					};
				}
			}
		},

		unselectOrSelectPermissions() {
			const {
				isUnselect,
				dependenciesPermissions,
				selectedPermission,
			} = this.autoPermissionManagerModal;

			if (isUnselect) {
				Object.entries(this.formModel.dataForPermissions).forEach(([key]) => {
					this.formModel.dataForPermissions[key].permissions.forEach((permission, index) => {
						if (permission.dependencies.includes(selectedPermission.key)) {
							this.formModel.dataForPermissions[key].permissions[index].isSelected = false;
						}
					});
				});
			} else {
				dependenciesPermissions.forEach((dependencyPermission) => {
					this.formModel.dataForPermissions[dependencyPermission.group].permissions.find(
						(permission) => permission.key === dependencyPermission.key,
					).isSelected = true;
				});
			}

			this.autoPermissionManagerModal.isOpened = false;
		},

		closeAutoPermissionsManagerModal() {
			const { groupIndex, isUnselect, selectedPermission } = this.autoPermissionManagerModal;

			if (isUnselect) {
				const isDependenciesUnselected = Object.values(this.formModel.dataForPermissions)
					.every((permissionsGroup) => permissionsGroup.permissions
						.filter((permission) => permission.dependencies.includes(selectedPermission.key))
						.every((permission) => !permission.isSelected));

				if (isDependenciesUnselected) return;

				this.formModel.dataForPermissions[groupIndex].permissions.find(
					(permission) => permission.key === selectedPermission.key,
				).isSelected = true;
			} else {
				const isDependenciesSelected = Object.values(this.formModel.dataForPermissions)
					.every((permissionsGroup) => permissionsGroup.permissions
						.filter((permission) => selectedPermission.dependencies.includes(permission.key))
						.every((permission) => permission.isSelected));

				if (isDependenciesSelected) return;

				this.formModel.dataForPermissions[groupIndex].permissions.find(
					(permission) => permission.key === selectedPermission.key,
				).isSelected = false;
			}

			this.autoPermissionManagerModal.isOpened = false;
		},

		selectedAllPermissionsInGroup(groupIndex) {
			const allDependenciesForGroupPermissions = [
				...new Set(this.formModel.dataForPermissions[groupIndex].permissions.flatMap(
					(permission) => permission.dependencies,
				)),
			];

			// eslint-disable-next-line no-unused-vars
			const notSelectedPermissionsForDependencies = Object.values(
				this.formModel.dataForPermissions,
			).flatMap((permissionsGroup) => this.getUnselectedDependencies(
				allDependenciesForGroupPermissions,
				permissionsGroup.permissions,
			));
		},

		getRoleAction() {
			switch (this.$route.name) {
				case ROUTER.ROUTE_NAME.ROLES.DETAIL:
					this.roleAction = {
						isCreate: false,
						isEdit: false,
						isDetail: true,
					};

					this.pageTitle = `${this.$t("Detail of Role")} (${this.$t("ID")}: ${this.roleId})`;

					break;
				case ROUTER.ROUTE_NAME.ROLES.EDIT:
					this.roleAction = {
						isCreate: false,
						isEdit: true,
						isDetail: false,
					};

					this.pageTitle = `${this.$t("Role Edit")} (${this.$t("ID")}: ${this.roleId})`;

					break;
				default:
					this.roleAction = {
						isCreate: true,
						isEdit: false,
						isDetail: false,
					};

					this.pageTitle = this.$t("Create New Role");

					break;
			}
		},
	},
};
</script>
