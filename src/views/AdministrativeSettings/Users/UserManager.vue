<template>
	<v-container fluid>
		<ConfirmAction
			:is-dialog-opened="autoProjectManagerModal.isOpened"
			:confirm-title="autoProjectManagerModal.title"
			close-button-name="No"
			close-button-color="blue-grey-lighten-4"
			confirm-button-name="Yes"
			confirm-button-color="primary"
			@modalClosed="closeAutoProjectManagerModal"
			@actionConfirmed="unselectOrSelectProjectForGroup"
		>
			<template v-slot:customContent>
				<p class="text-body-2">{{ $t(autoProjectManagerModal.message) }}</p>

				<ul class="pl-7 pt-3">
					<template v-if="autoProjectManagerModal.isUnselect">
						<li
							v-for="checkedProject in autoProjectManagerModal.checkedProjectsInGroup"
							:key="checkedProject.id"
						>
							{{ checkedProject.name }}
						</li>
					</template>

					<li v-else>
						{{ autoProjectManagerModal.countryNameForLastEditedGroup }}
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
							v-model="formModel.email"
							:disabled="!userAction.isCreate"
							:error-messages="validationMsg('email')"
							label="Email"
							name="email"
							type="email"
							class="mb-4"
							@update:modelValue="onValidate('email')"
						/>

						<DataInput
							v-model="formModel.firstName"
							:disabled="userAction.isDetail"
							:error-messages="validationMsg('firstName')"
							label="First name"
							name="first-name"
							class="mb-4"
							@update:modelValue="onValidate('firstName')"
						/>

						<DataInput
							v-model="formModel.lastName"
							:disabled="userAction.isDetail"
							:error-messages="validationMsg('lastName')"
							label="Surname"
							name="surname"
							class="mb-4"
							@update:modelValue="onValidate('lastName')"
						/>

						<DataInput
							v-model="formModel.position"
							:disabled="userAction.isDetail"
							:error-messages="validationMsg('position')"
							label="Position"
							name="position"
							class="mb-4"
							@update:modelValue="onValidate('position')"
						/>
					</v-col>

					<v-col cols="12" sm="6">
						<DataSelect
							v-model="formModel.role"
							:required-permissions="PERMISSIONS.ADMINISTRATIVE_SETTING_USER_CREATE"
							:items="options.roles"
							:loading="loading.isRoles"
							:disabled="userAction.isDetail"
							:error-messages="validationMsg('role')"
							label="Role"
							name="role"
							item-title="name"
							class="mb-4"
							@update:modelValue="onRightsSelect"
						/>

						<DataSelect
							v-model="formModel.language"
							:items="options.languages"
							:disabled="userAction.isDetail"
							label="Language"
							name="language"
							item-title="name"
							item-value="key"
							class="mb-4"
							optional
						/>

						<DataSelect
							v-model="formModel.phonePrefix"
							:items="options.phonePrefixes"
							:disabled="userAction.isDetail"
							label="Prefix"
							name="prefix"
							class="mb-4"
							optional
						/>

						<DataInput
							v-model="formModel.phoneNumber"
							:disabled="userAction.isDetail"
							label="Phone Number"
							name="phone-number"
							class="mb-4"
							optional
						/>
					</v-col>
				</v-row>

				<template v-if="!isUserRoleAdmin">
					<h2 class="text-h6 font-weight-bold mb-1 mt-3">{{ $t('Data Access') }}</h2>

					<DataAccessManager
						v-model:groups="formModel.dataForDataAccess"
						ref="accessManager"
						:is-loading="loading.isDataAccess"
						:is-form-disabled="isDataAccessFormDisabled"
						property-name-for-access-group="projects"
						property-name-for-access-label="name"
						@data-in-group-updated="checkboxStatusUpdatedInGroup"
					>
						<template v-slot:default="{ index }">
							<div class="d-flex align-center mr-4">
								<v-checkbox
									v-model="formModel.dataForDataAccess[index].isAllFutureProjectsEnabled"
									:label="$t('All projects, even future one')"
									:disabled="userAction.isDetail"
									name="enabled"
									class="checkbox my-checkbox head"
									hide-details
									@update:modelValue="handleAllFutureProjects(index)"
								/>

								<v-tooltip
									text="User will get access to all existing projects within this country, and to all other projects that will be created in the future."
									location="top"
									color="red"
									content-class="tooltip-top"
								>
									<template v-slot:activator="{ props }">
										<v-icon v-bind="props" icon="circle-info" class="ml-2" />
									</template>
								</v-tooltip>
							</div>

							<div class="d-flex align-center mr-4">
								<v-checkbox
									v-model="formModel.dataForDataAccess[index].isHideAfterEndDateEnabled"
									:label="$t('Hide projects after end date')"
									:disabled="userAction.isDetail"
									name="enabled"
									class="checkbox my-checkbox head"
									hide-details
									@update:modelValue="filterProjectsAfterEndDate(index)"
								/>

								<v-tooltip
									text="Hide projects with older end date than today."
									location="top"
									color="red"
									content-class="tooltip-top"
								>
									<template v-slot:activator="{ props }">
										<v-icon v-bind="props" icon="circle-info" class="ml-2" />
									</template>
								</v-tooltip>
							</div>
						</template>
					</DataAccessManager>
				</template>
			</v-card-text>
		</v-card>

		<v-row class="mt-5">
			<v-col class="d-flex justify-end">
				<v-btn
					color="blue-grey-lighten-4"
					variant="elevated"
					class="text-none"
					@click="goBack"
				>
					{{ goBackButtonName }}
				</v-btn>

				<v-btn
					v-if="!userAction.isDetail"
					color="primary"
					class="text-none ml-3"
					@click="validateNewUser"
				>
					{{ validateButtonName }}
				</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import { mapState } from "vuex";
import { email, required } from "@vuelidate/validators";
import ProjectService from "@/services/ProjectService";
import RolesService from "@/services/RolesService";
import UsersService from "@/services/UsersService";
import ConfirmAction from "@/components/ConfirmAction";
import DataAccessManager from "@/components/DataAccessManager";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import permissions from "@/mixins/permissions";
import usersHelper from "@/mixins/usersHelper";
import validation from "@/mixins/validation";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { PHONE, ROLE, ROUTER } from "@/consts";

export default {
	components: {
		ConfirmAction,
		DataSelect,
		DataInput,
		DataAccessManager,
	},

	mixins: [
		validation,
		usersHelper,
		permissions,
	],

	validations() {
		return {
			formModel: {
				email: { required, email },
				firstName: { required },
				lastName: { required },
				position: { required },
				role: { required },
			},
		};
	},

	data() {
		return {
			pageTitle: "",
			userAction: {},
			dataForDataAccessCopy: [],
			formModel: {
				id: null,
				username: "",
				email: "",
				firstName: "",
				lastName: "",
				position: "",
				role: [],
				language: null,
				phonePrefix: [],
				phoneNumber: null,
				dataForDataAccess: [],
				newUser: false,
			},
			options: {
				roles: [],
				phonePrefixes: PHONE.CODES,
				languages: [],
			},
			loading: {
				isRoles: false,
				isDataAccess: false,
			},
			autoProjectManagerModal: {
				isOpened: false,
				isUnselect: false,
				group: {},
				groupIndex: null,
				dataAccess: null,
				actionType: "",
				title: "",
				message: "",
				checkedProjectsInGroup: [],
				countryNameForLastEditedGroup: "",
				projectNameForLastEdit: "",
			},
		};
	},

	computed: {
		...mapState(["languages", "countries"]),

		validateButtonName() {
			return this.$t(this.userAction.isCreate ? "Create" : "Update");
		},

		goBackButtonName() {
			return this.$t(this.userAction.isDetail ? "Close" : "Cancel");
		},

		userId() {
			return this.$route.params.userId;
		},

		isUserRoleAdmin() {
			return this.formModel.role.name === ROLE.ADMIN;
		},

		isDataAccessFormDisabled() {
			return this.userAction.isDetail
				|| !this.isUserPermissionGranted(this.PERMISSIONS.ADMINISTRATIVE_SETTING_USER_CREATE);
		},
	},

	async mounted() {
		this.getUserAction();
		this.loadLanguages();
		this.mapSelects();

		if (!this.userAction.isCreate) {
			const user = await this.getDetailOfUser(this.$route.params.userId);
			this.mapToFormModel(user);
		}

		await Promise.all([
			this.getProjectsForDataAccess(),
			this.fetchRoles(),
		]);
	},

	methods: {
		async createUser(userBody) {
			try {
				const {
					status,
					message,
				} = await UsersService.createUser(userBody);

				checkResponseStatus(status, message);

				Notification(this.$t("User Successfully Created"), "success");
			} catch (e) {
				Notification(`${this.$t("User")}: ${e.message || e}`, "error");
			} finally {
				this.$router.push({ name: ROUTER.ROUTE_NAME.USERS.ROOT });
			}
		},

		async updateUser(id, userBody) {
			try {
				const {
					status,
					message,
				} = await UsersService.updateUser({
					body: userBody,
					id,
				});

				checkResponseStatus(status, message);

				Notification(this.$t("User Successfully Updated"), "success");
			} catch (e) {
				Notification(`${this.$t("User")}: ${e.message || e}`, "error");
			} finally {
				this.$router.push({ name: ROUTER.ROUTE_NAME.USERS.ROOT });
			}
		},

		async getProjectsForDataAccess() {
			try {
				this.loading.isDataAccess = true;

				const {
					data,
					status,
					message,
				} = await ProjectService.getListOfProjectsForDataAccess();

				checkResponseStatus(status, message);

				this.prepareDataForDataAccess(data);

				if (!this.userAction.isCreate) {
					await this.updateDataForDataAccess(this.formModel.countries, this.formModel.projectIds);
					this.setupForAllFutureProjectsSettings();
				}

				this.filterProjectByEndDateFilter();
			} catch (e) {
				Notification(`${this.$t("User Data Access")}: ${e.message || e}`, "error");
			} finally {
				this.loading.isDataAccess = false;
			}
		},

		async fetchRoles() {
			try {
				this.loading.isRoles = true;

				const {
					data: { data },
					status,
					message,
				} = await RolesService.getListOfRoles();

				checkResponseStatus(status, message);

				this.prepareRolesOptions(data);
			} catch (e) {
				Notification(`${this.$t("Roles")}: ${e.message || e}`, "error");
			} finally {
				this.formModel.rights = getArrayOfCodeListByKey(this.formModel.roles, this.options.rights, "code");
				this.loading.isRoles = false;
			}
		},

		validateNewUser() {
			this.v$.$touch();

			if (this.v$.$invalid) return;

			this.submitUserForm(this.formModel);
			this.v$.$reset();
		},

		goBack() {
			this.$router.push({ name: ROUTER.ROUTE_NAME.USERS.ROOT });
		},

		getUserAction() {
			switch (this.$route.name) {
				case ROUTER.ROUTE_NAME.USERS.DETAIL:
					this.userAction = {
						isCreate: false,
						isEdit: false,
						isDetail: true,
					};

					this.pageTitle = `${this.$t("Detail of User")} (${this.$t("ID")}: ${this.userId})`;

					break;
				case ROUTER.ROUTE_NAME.USERS.EDIT:
					this.userAction = {
						isCreate: false,
						isEdit: true,
						isDetail: false,
					};

					this.pageTitle = `${this.$t("User Edit")} (${this.$t("ID")}: ${this.userId})`;

					break;
				default:
					this.userAction = {
						isCreate: true,
						isEdit: false,
						isDetail: false,
					};

					this.pageTitle = this.$t("Create New User");

					break;
			}
		},

		mapToFormModel(
			{
				id,
				username,
				email: userEmail,
				firstName,
				lastName,
				position,
				role,
				phonePrefix,
				phoneNumber,
				roles,
				language,
				countries,
				projectIds,
			},
		) {
			this.formModel = {
				...this.formModel,
				id,
				username,
				email: userEmail,
				firstName,
				lastName,
				position,
				role,
				roles,
				phonePrefix,
				phoneNumber,
				language,
				countries,
				projectIds,
			};
		},

		submitUserForm(userForm) {
			const {
				id,
				email: userEmail,
				firstName,
				lastName,
				position,
				role,
				phonePrefix,
				phoneNumber,
				language,
				dataForDataAccess,
			} = userForm;

			const filteredCountries = dataForDataAccess.flatMap((item) => item.projects
				.filter((project) => project.isCountryAccessCheckbox === true && project.isSelected)
				.map((project) => (
					{
						iso3: project.iso3,
						hasAccessToAllProjects: item.isAllFutureProjectsEnabled,
					})));

			const filteredProjectIds = dataForDataAccess.flatMap((item) => item.projects
				.filter(
					(project) => project.isSelected === true && !project.isCountryAccessCheckbox,
				).map((project) => project.id));

			const userBody = {
				username: userEmail,
				email: userEmail,
				firstName,
				lastName,
				position,
				roleId: role.id,
				countries: filteredCountries,
				projectIds: filteredProjectIds,
				phonePrefix: phonePrefix?.code,
				phoneNumber: phoneNumber || null,
				language: language?.key || null,
			};

			if (this.userAction.isEdit && id) {
				this.updateUser(id, userBody);
			} else {
				this.createUser(userBody);
			}
		},

		onRightsSelect() {
			this.onValidate("rights");
		},

		loadLanguages() {
			this.options.languages = this.languages;
		},

		mapSelects() {
			if (typeof this.formModel.phonePrefix !== "object") {
				this.formModel.phonePrefix = getArrayOfCodeListByKey(
					[this.formModel.phonePrefix],
					this.options.phonePrefixes,
					"code",
				);
			}

			if (typeof this.formModel.language !== "object") {
				this.formModel.language = getArrayOfCodeListByKey(
					[this.formModel.language],
					this.options.languages,
					"key",
				);
			}
		},

		prepareRolesOptions(roles) {
			this.options.roles = roles.map((role) => ({
				...role,
				isOptionDisabled: role.name === ROLE.ADMIN
					? !this.isUserPermissionGranted(this.PERMISSIONS.ADMINISTRATIVE_SETTING_USER_ASSIGN_ADMIN)
					: false,
			}));
		},

		prepareDataForDataAccess(projects) {
			this.formModel.dataForDataAccess = this.countries.map((country) => {
				const projectsGroupedByCountry = projects.filter(
					(project) => project.iso3 === country.iso3,
				);

				return {
					groupName: country.name,
					iso3: country.iso3,
					projects: [
						{
							name: country.name,
							iso3: country.iso3,
							isCountryAccessCheckbox: true,
						},
						...projectsGroupedByCountry,
					],
					isAllFutureProjectsEnabled: false,
					isHideAfterEndDateEnabled: true,
				};
			});

			this.dataForDataAccessCopy = JSON.parse(
				JSON.stringify(this.formModel.dataForDataAccess),
			);
		},

		updateDataForDataAccess(countriesAccessData, projectIdsWithAccess) {
			countriesAccessData.forEach((countryAccess) => {
				const countryData = this.formModel.dataForDataAccess.find(
					(data) => data.iso3 === countryAccess.iso3,
				);

				if (countryData) {
					const countryCheckboxProject = countryData.projects.find(
						(project) => project.isCountryAccessCheckbox === true,
					);

					if (countryCheckboxProject) {
						countryCheckboxProject.isSelected = true;
					}

					if (countryAccess.hasAccessToAllProjects) {
						countryData.isAllFutureProjectsEnabled = true;
					}
				}
			});

			projectIdsWithAccess.forEach((projectId) => {
				this.formModel.dataForDataAccess.forEach((group, groupIndex) => {
					const project = group.projects.find(
						(proj) => proj.id === projectId && !proj.isCountryAccessCheckbox,
					);

					if (project) {
						project.isSelected = true;
					}

					this.checkboxStatusUpdatedInGroup({
						group,
						groupIndex,
						dataAccess: null,
					});
				});
			});
		},

		filterProjectsAfterEndDate(index) {
			if (this.formModel.dataForDataAccess[index].isHideAfterEndDateEnabled) {
				this.formModel.dataForDataAccess[index].projects = this.formModel
					.dataForDataAccess[index].projects.filter(
						(project) => (
							project.endDate
								? this.$moment(project.endDate) > this.$moment(new Date())
								: true
						),
					);
			} else {
				this.formModel.dataForDataAccess[index].projects = JSON.parse(
					JSON.stringify(this.dataForDataAccessCopy[index].projects),
				);
			}
		},

		handleAllFutureProjects(index) {
			if (this.formModel.dataForDataAccess[index].isAllFutureProjectsEnabled) {
				this.$refs.accessManager.selectOrUnselectAllDataInGroup(
					this.formModel.dataForDataAccess[index],
					index,
					true,
				);
				this.setValuesForDisabledProperties(index, true);
			} else {
				this.$refs.accessManager.selectOrUnselectAllDataInGroup(
					this.formModel.dataForDataAccess[index],
					index,
					false,
				);
				this.setValuesForDisabledProperties(index, false);
			}
		},

		setValuesForDisabledProperties(index, isDisabled) {
			this.formModel.dataForDataAccess[index] = {
				...this.formModel.dataForDataAccess[index],
				isGroupCheckboxesDisabled: isDisabled,
				isGroupSelectAllDisabled: isDisabled,
				isGroupUnselectAllDisabled: isDisabled,
			};
		},

		filterProjectByEndDateFilter() {
			this.countries.forEach((_, index) => {
				this.filterProjectsAfterEndDate(index);
			});
		},

		setupForAllFutureProjectsSettings() {
			this.countries.forEach((_, index) => {
				this.handleAllFutureProjects(index);
			});
		},

		checkboxStatusUpdatedInGroup({ group, groupIndex, dataAccess }) {
			const isCountryChecked = group.projects[0]?.isSelected;
			const checkedProjectsInGroup = group.projects.filter(
				(project, index) => project.isSelected && index > 0,
			);

			if (!dataAccess) return;

			this.autoProjectManagerModal = {
				...this.autoProjectManagerModal,
				countryNameForLastEditedGroup: group.groupName,
				projectNameForLastEdit: dataAccess.name,
				group,
				groupIndex,
				dataAccess,
				checkedProjectsInGroup,
			};

			if (!isCountryChecked
				&& this.autoProjectManagerModal.checkedProjectsInGroup.length
				&& dataAccess.isCountryAccessCheckbox) {
				this.autoProjectManagerModal = {
					...this.autoProjectManagerModal,
					isOpened: true,
					isUnselect: true,
					title: "Unselect projects?",
					message: `If you want to remove the data access to the country (${this.autoProjectManagerModal.countryNameForLastEditedGroup}),
					 it is necessary to remove data access to the following projects at the same time. Do you want to remove the data access automatically?`,
				};
			} else if (!dataAccess.isCountryAccessCheckbox && !isCountryChecked) {
				this.autoProjectManagerModal = {
					...this.autoProjectManagerModal,
					isOpened: true,
					isUnselect: false,
					title: "Select country?",
					message: `If you want to add the data access to the project (${this.autoProjectManagerModal.projectNameForLastEdit}),
					 it is necessary to add data access to the following country at the same time. Do you want to add the data access automatically?`,
				};
			}
		},

		unselectOrSelectProjectForGroup() {
			const { group, groupIndex, isUnselect } = this.autoProjectManagerModal;

			if (isUnselect) {
				this.$refs.accessManager.selectOrUnselectAllDataInGroup(
					group,
					groupIndex,
					false,
				);
			} else {
				const project = this.formModel.dataForDataAccess[groupIndex].projects.find(
					(groupProject) => groupProject.isCountryAccessCheckbox,
				);

				if (project) {
					project.isSelected = true;
				}
			}

			this.autoProjectManagerModal.isOpened = false;
		},

		closeAutoProjectManagerModal() {
			const { groupIndex, isUnselect, dataAccess } = this.autoProjectManagerModal;

			if (isUnselect) {
				const isGroupWithSelectedProject = this.formModel.dataForDataAccess[groupIndex].projects
					.some((project) => project.id && project.isSelected);

				if (!isGroupWithSelectedProject) return;

				const project = this.formModel.dataForDataAccess[groupIndex].projects.find(
					(groupProject) => groupProject.isCountryAccessCheckbox,
				);

				if (project) {
					project.isSelected = true;
				}
			} else {
				const isGroupWithSelectedCountry = this.formModel.dataForDataAccess[groupIndex].projects
					.find((project) => project.isCountryAccessCheckbox && project.isSelected);

				if (isGroupWithSelectedCountry) return;

				const lastCheckedProject = this.formModel.dataForDataAccess[groupIndex].projects
					.find((project) => project.id === dataAccess.id);

				if (lastCheckedProject) {
					lastCheckedProject.isSelected = false;
				}
			}

			this.autoProjectManagerModal.isOpened = false;
		},
	},
};
</script>
