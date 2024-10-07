<template>
	<v-container fluid>
		<ConfirmAction
			:is-dialog-opened="autoPermissionManagerModal.isOpened"
			:confirm-title="autoPermissionManagerModal.title"
			close-button-name="No"
			close-button-color="blue-grey-lighten-4"
			confirm-button-name="Yes"
			confirm-button-color="primary"
			@modalClosed="onCloseAutoPermissionsManagerModal"
			@actionConfirmed="onUnselectOrSelectPermissions"
		>
			<template v-slot:customContent>
				<p class="text-body-2">{{ $t(autoPermissionManagerModal.message) }}</p>

				<ul class="pl-7 pt-3">
					<li
						v-for="permission in dependencyPermissionsForModal"
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

				<h2 class="text-h6 font-weight-bold mb-1 mt-3">{{ $t('Permissions') }}</h2>

				<DataAccessManager
					v-model:groups="formModel.dataForPermissions"
					ref="accessManager"
					:is-loading="loading.isPermissions"
					:is-form-disabled="isDataAccessFormDisabled"
					property-name-for-access-group="permissions"
					property-name-for-access-label="label"
					is-note-panel-visible
					@data-in-group-updated="onCheckboxStatusUpdatedInGroup"
					@selected-all="onSelectedAllPermissionsInGroup"
					@unselected-all="onUnselectedPermissionsInGroup"
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
					@click="onValidateNewRole"
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
				isSelectAllOrUnselectAll: false,
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

		dependencyPermissionsForModal() {
			return [...new Set(this.autoPermissionManagerModal.dependenciesPermissions)];
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

		onValidateNewRole() {
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

			if (!permissions.length) {
				Notification(`${this.$t("Please select at least one permission to create a role.")}`, "error");
				return;
			}

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
			this.formModel.dataForPermissions = this.changePermissionsSelectedValue(
				permissions,
				this.formModel.dataForPermissions,
				true,
			);

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

				const prerequisitesPermission = permissions.filter(
					(prerequisitePermission) => permission.dependencies.some(
						(dependencyPermission) => dependencyPermission === prerequisitePermission.key,
					),
				);
				const prerequisitesLabelWithTag = prerequisitesPermission.flatMap(
					(prerequisitePermission) => `<li>${prerequisitePermission.label}</li>`,
				);
				const allowedActionsWithTags = `<h3><b>${this.$t("Allowed actions:")}</b></h3>${permission.description}<br>`;
				const prerequisitesWithTags = prerequisitesLabelWithTag.length
					? `<h3><b>${this.$t("Prerequisites:")}</b></h3><ul>${prerequisitesLabelWithTag.join("")}</ul>`
					: "";
				const modifiedPermission = {
					...permission,
					description: allowedActionsWithTags + prerequisitesWithTags,
				};

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

				permissionsGroups[permission.group].permissions.push(modifiedPermission);
			});

			this.formModel.dataForPermissions = permissionsGroups;
		},

		getUnselectedDependencies(dependencies, allPermissions) {
			let unselectedPermissions = [];

			dependencies.forEach((dependency) => {
				const dependencyPermission = allPermissions.find(
					(permission) => permission.key === dependency,
				);

				if (!dependencyPermission) return;

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
			});

			return unselectedPermissions;
		},

		getSelectedDependencies(dependencyKey, allPermissions) {
			let selectedPermissions = [];

			allPermissions.forEach((permission) => {
				if (!permission.dependencies.includes(dependencyKey) || !permission.isSelected) return;

				selectedPermissions.push(permission);

				if (!permission.dependencies || permission.dependencies.length === 0) return;

				selectedPermissions = [
					...selectedPermissions,
					...this.getSelectedDependencies(permission.key, allPermissions),
				];
			});

			return selectedPermissions;
		},

		onCheckboxStatusUpdatedInGroup({ group, groupIndex, dataAccess }) {
			const selectedPermission = dataAccess;

			this.autoPermissionManagerModal = {
				...this.autoPermissionManagerModal,
				selectedPermission,
				group,
				groupIndex,
			};

			if (!dataAccess) return;

			const { dependencies } = dataAccess;

			if (dataAccess.isSelected) {
				const notSelectedPermissionsForDependencies = Object.values(
					this.formModel.dataForPermissions,
				).flatMap((permissionsGroup) => this.getUnselectedDependencies(
					dependencies,
					permissionsGroup.permissions,
				));

				this.autoSelectModalData([selectedPermission.label], notSelectedPermissionsForDependencies);
			} else {
				const selectedPermissionsAsDependencies = Object.values(
					this.formModel.dataForPermissions,
				).flatMap((permissionsGroup) => this.getSelectedDependencies(
					selectedPermission.key,
					permissionsGroup.permissions,
				));

				this.autoUnselectModalData(
					[selectedPermission.key],
					[selectedPermission.label],
					selectedPermissionsAsDependencies,
				);
			}
		},

		autoSelectModalData(
			selectedPermissionsLabel,
			notSelectedPermissionsForDependencies,
			isSelectAllOrUnselectAll = false,
		) {
			if (!notSelectedPermissionsForDependencies.length) return;

			const regardingPermissionsText = selectedPermissionsLabel
				? `(${selectedPermissionsLabel.join(", ")})`
				: "";

			this.autoPermissionManagerModal = {
				...this.autoPermissionManagerModal,
				isOpened: true,
				isUnselect: false,
				title: "Select permissions automatically?",
				message: `If you want to select ${regardingPermissionsText} permission,
					 it is necessary to select prerequisites for this permission.
					 Do you want to assign prerequisites permissions automatically?`,
				dependenciesPermissions: notSelectedPermissionsForDependencies,
				isSelectAllOrUnselectAll,
			};
		},

		autoUnselectModalData(
			selectedPermissionsKeys,
			selectedPermissionsLabel,
			selectedPermissionsAsDependencies,
			isSelectAllOrUnselectAll = false,
		) {
			if (!selectedPermissionsAsDependencies.length) return;

			const regardingPermissionsText = selectedPermissionsLabel
				? `(${selectedPermissionsLabel.join(", ")})`
				: "";

			this.autoPermissionManagerModal = {
				...this.autoPermissionManagerModal,
				isOpened: true,
				isUnselect: true,
				title: "Unselect permissions automatically?",
				message: `If you want to unselect ${regardingPermissionsText} permission,
					 it is necessary to unselected permissions which have this permission as prerequisites.
					 Do you want to un-assign permissions automatically?`,
				dependenciesPermissions: selectedPermissionsAsDependencies,
				isSelectAllOrUnselectAll,
				selectedPermissionsKeys,
			};
		},

		onUnselectOrSelectPermissions() {
			const {
				selectedPermissionsKeys,
				isUnselect,
				dependenciesPermissions,
			} = this.autoPermissionManagerModal;

			if (isUnselect) {
				Object.entries(this.formModel.dataForPermissions).forEach(([key]) => {
					this.formModel.dataForPermissions[key].permissions.forEach((permission, index) => {
						if (selectedPermissionsKeys.some(
							(selectedPermissionKey) => permission.dependencies.includes(selectedPermissionKey),
						)) {
							this.formModel.dataForPermissions[key].permissions[index].isSelected = false;
						}
					});
				});
			} else {
				dependenciesPermissions.forEach((dependencyPermission) => {
					this.changeSpecificPermissionSelectedValue(
						dependencyPermission.group,
						dependencyPermission,
						true,
					);
				});
			}

			this.autoPermissionManagerModal.isOpened = false;
		},

		isAllDependenciesUnselectedForPermission(permissionKey) {
			return Object.values(this.formModel.dataForPermissions)
				.every((permissionsGroup) => permissionsGroup.permissions
					.filter((permission) => permission.dependencies.includes(permissionKey))
					.every((permission) => !permission.isSelected));
		},

		isAllPermissionsFromDependenciesSelected(dependencies) {
			return Object.values(this.formModel.dataForPermissions)
				.every((permissionsGroup) => permissionsGroup.permissions
					.filter((permission) => dependencies.includes(permission.key))
					.every((permission) => permission.isSelected));
		},

		changeSpecificPermissionSelectedValue(groupIndex, selectedPermission, value) {
			if (typeof value !== "boolean") return;

			this.formModel.dataForPermissions[groupIndex].permissions.find(
				(permission) => permission.key === selectedPermission.key,
			).isSelected = value;
		},

		changePermissionsSelectedValue(permissions, objectToChange, value) {
			const permissionsObject = objectToChange;

			Object.entries(this.formModel.dataForPermissions).forEach(([key]) => {
				this.formModel.dataForPermissions[key].permissions.forEach((permission, index) => {
					if (permissions.includes(permission.key)) {
						permissionsObject[key].permissions[index].isSelected = value;
					}
				});
			});

			return permissionsObject;
		},

		getSpecificPropertyFromPermissions(permissionsGroup, propertyName) {
			return permissionsGroup.map((permission) => permission[propertyName]);
		},

		getSelectedPermissionsWithCommonDependencies(dependencyKeys) {
			return Object.entries(this.formModel.dataForPermissions)
				.flatMap(([, value]) => (
					value.permissions.filter((permission) => permission.isSelected
						&& permission.dependencies.some(
							(dependency) => dependencyKeys.includes(dependency),
						))
				));
		},

		getAllUniqueDependenciesFromPermissionsGroup(group) {
			return [
				...new Set(group.flatMap(
					(permission) => permission.dependencies,
				)),
			];
		},

		getSpecificPropertyFromPermissionWithFilter(groupIndex, permissionKeys, propertyName) {
			return this.formModel.dataForPermissions[groupIndex].permissions
				.filter((permission) => permissionKeys.includes(permission.key))
				.map((permission) => permission[propertyName]);
		},

		onCloseAutoPermissionsManagerModal() {
			const {
				group,
				groupIndex,
				isUnselect,
				selectedPermission,
				isSelectAllOrUnselectAll,
				dependenciesPermissions,
			} = this.autoPermissionManagerModal;

			if (isUnselect && !isSelectAllOrUnselectAll) {
				if (this.isAllDependenciesUnselectedForPermission(selectedPermission.key)) return;

				this.changeSpecificPermissionSelectedValue(groupIndex, selectedPermission, true);
			} else if (!isUnselect && !isSelectAllOrUnselectAll) {
				if (this.isAllPermissionsFromDependenciesSelected(selectedPermission.dependencies)) return;

				this.changeSpecificPermissionSelectedValue(groupIndex, selectedPermission, false);
			} else if (!isUnselect && isSelectAllOrUnselectAll) {
				const dependenciesPermissionsKeys = this.getSpecificPropertyFromPermissions(
					dependenciesPermissions,
					"key",
				);

				if (this.isAllPermissionsFromDependenciesSelected(dependenciesPermissionsKeys)) return;

				this.$refs.accessManager.selectOrUnselectAllDataInGroup(
					group,
					groupIndex,
					false,
				);
			} else {
				const allGroupPermissionsKeys = this.getSpecificPropertyFromPermissions(
					this.formModel.dataForPermissions[groupIndex].permissions,
					"key",
				);
				const conflictedPermissions = this.getSelectedPermissionsWithCommonDependencies(
					allGroupPermissionsKeys,
				);
				const conflictedPermissionKeys = this.getSpecificPropertyFromPermissions(
					conflictedPermissions,
					"key",
				);
				const isConflictedPermissionSelected = this.isAllPermissionsFromDependenciesSelected(
					conflictedPermissionKeys,
				);
				const uniqueConflictedPermissionsDependencies = this
					.getAllUniqueDependenciesFromPermissionsGroup(conflictedPermissions);
				const selectedPermissionsKeys = this.getSpecificPropertyFromPermissionWithFilter(
					groupIndex,
					uniqueConflictedPermissionsDependencies,
					"key",
				);

				if (!isConflictedPermissionSelected) return;

				this.formModel.dataForPermissions = this.changePermissionsSelectedValue(
					selectedPermissionsKeys,
					this.formModel.dataForPermissions,
					true,
				);
			}

			this.autoPermissionManagerModal.isOpened = false;
		},

		onSelectedAllPermissionsInGroup(groupIndex) {
			const allDependenciesForGroupPermissions = this.getAllUniqueDependenciesFromPermissionsGroup(
				this.formModel.dataForPermissions[groupIndex].permissions,
			);

			const notSelectedPermissionsForDependencies = Object.values(
				this.formModel.dataForPermissions,
			).flatMap((permissionsGroup) => this.getUnselectedDependencies(
				allDependenciesForGroupPermissions,
				permissionsGroup.permissions,
			));
			const conflictedPermissions = this.formModel.dataForPermissions[groupIndex].permissions
				.filter((permission) => permission.dependencies.some(
					(dependency) => notSelectedPermissionsForDependencies
						.map((notSelectedDependency) => notSelectedDependency.key).includes(dependency),
				));
			const selectedPermissionsLabel = this.getSpecificPropertyFromPermissions(
				conflictedPermissions,
				"label",
			);

			this.autoSelectModalData(
				selectedPermissionsLabel,
				notSelectedPermissionsForDependencies,
				true,
			);
		},

		onUnselectedPermissionsInGroup(groupIndex) {
			const allGroupPermissionsKeys = this.getSpecificPropertyFromPermissions(
				this.formModel.dataForPermissions[groupIndex].permissions,
				"key",
			);
			const conflictedPermissions = this.getSelectedPermissionsWithCommonDependencies(
				allGroupPermissionsKeys,
			);
			const conflictedPermissionsDependencies = this
				.getAllUniqueDependenciesFromPermissionsGroup(conflictedPermissions);
			const selectedPermissionsLabel = this.getSpecificPropertyFromPermissionWithFilter(
				groupIndex,
				conflictedPermissionsDependencies,
				"label",
			);
			const conflictedPermissionsKeys = this.getSpecificPropertyFromPermissionWithFilter(
				groupIndex,
				conflictedPermissionsDependencies,
				"key",
			);

			this.autoUnselectModalData(
				conflictedPermissionsKeys,
				selectedPermissionsLabel,
				conflictedPermissions,
				true,
			);
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
