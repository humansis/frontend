<template>
	<v-container fluid>
		<v-card class="mx-auto mt-5">
			<v-card-title class="text-h5 font-weight-bold">
				{{ $t("Create New User") }}
			</v-card-title>

			<v-card-text>
				<h2 class="text-h6 font-weight-bold mb-2">{{ $t('General') }}</h2>

				<v-row>
					<v-col>
						<DataInput
							v-model="formModel.roleName"
							:error-messages="validationMsg('roleName')"
							label="Email"
							name="role-name"
							class="mb-4"
							max-width="500"
							@blur="onValidate('roleName')"
						/>

						<DataInput
							v-model="formModel.roleName"
							:error-messages="validationMsg('roleName')"
							label="First name"
							name="role-name"
							class="mb-4"
							max-width="500"
							@blur="onValidate('roleName')"
						/>

						<DataInput
							v-model="formModel.roleName"
							:error-messages="validationMsg('roleName')"
							label="Surname"
							name="role-name"
							class="mb-4"
							max-width="500"
							@blur="onValidate('roleName')"
						/>

						<DataInput
							v-model="formModel.roleName"
							:error-messages="validationMsg('roleName')"
							label="Position"
							name="role-name"
							class="mb-4"
							max-width="500"
							@blur="onValidate('roleName')"
						/>
					</v-col>

					<v-col>
						<DataSelect
							v-model="formModel.modality"
							:items="[{ code: 1, value: 'test' }]"
							label="Role"
							name="modality"
							class="mb-4"
						/>

						<DataSelect
							v-model="formModel.modality"
							:items="[{ code: 1, value: 'test' }]"
							label="Language"
							name="modality"
							class="mb-4"
							optional
						/>

						<DataSelect
							v-model="formModel.modality"
							:items="[{ code: 1, value: 'test' }]"
							label="Prefix"
							name="modality"
							class="mb-4"
							optional
						/>

						<DataInput
							v-model="formModel.roleName"
							:error-messages="validationMsg('roleName')"
							label="Phone Number"
							name="role-name"
							class="mb-4"
							max-width="500"
							optional
							@blur="onValidate('roleName')"
						/>
					</v-col>
				</v-row>

				<v-col>
					<h2 class="text-h6 font-weight-bold mb-5">{{ $t('Data Access') }}</h2>

					<div>
						<v-row>
							<v-col cols="8" class="pt-0 pb-0 pr-0">
								<v-expansion-panels
									v-for="group in groups"
									v-model="group.expanded"
									:key="group.name"
									ref="customFieldsPanel"
									variant="accordion"
									class="my-expansion"
									:style="{ 'background-color': '#fbfcfe' }"
								>
									<v-expansion-panel eager>
										<v-expansion-panel-title>
											<h4 class="ml-3">
												<v-icon :icon="group.icon" class="mr-2" />

												{{ $t(group.name) }}
											</h4>

											<template v-slot:actions="{ expanded }">
												<div class="d-flex align-center">
													<v-icon :icon="expanded ? 'arrow-up' : 'arrow-down'" />
												</div>
											</template>
										</v-expansion-panel-title>

										<v-expansion-panel-text class="pl-5 py-5">
											<v-row>
												<v-btn
													color="blue-grey-lighten-4"
													variant="elevated"
													size="small"
													class="text-none mr-4"
												>
													{{ $t('Select All') }}
												</v-btn>

												<v-btn
													color="blue-grey-lighten-4"
													variant="elevated"
													size="small"
													class="text-none mr-4"
												>
													{{ $t('Unselect All') }}
												</v-btn>

												<!--												<div class="d-flex align-center mr-4">-->
												<!--													<v-checkbox-->
												<!--														v-model="allFutureProjects"-->
												<!--														:label="$t('All projects, even future one')"-->
												<!--														name="enabled"-->
												<!--														class="checkbox my-checkbox head"-->
												<!--														hide-details-->
												<!--													/>-->

												<!--													<v-tooltip-->
												<!--														text="You will get access to all existing projects within this country and to all others that will be created in the future"-->
												<!--														location="top"-->
												<!--														color="red"-->
												<!--														content-class="tooltip-top"-->
												<!--													>-->
												<!--														<template v-slot:activator="{ props }">-->
												<!--															<v-icon v-bind="props" icon="circle-info" class="ml-2" />-->
												<!--														</template>-->
												<!--													</v-tooltip>-->
												<!--												</div>-->

												<!--												<div class="d-flex align-center mr-4">-->
												<!--													<v-checkbox-->
												<!--														v-model="hideAfterEndDate"-->
												<!--														:label="$t('Hide projects after end date')"-->
												<!--														name="enabled"-->
												<!--														class="checkbox my-checkbox head"-->
												<!--														hide-details-->
												<!--													/>-->

												<!--													<v-tooltip-->
												<!--														text="Tesrt"-->
												<!--														location="top"-->
												<!--														color="red"-->
												<!--														content-class="tooltip-top"-->
												<!--													>-->
												<!--														<template v-slot:activator="{ props }">-->
												<!--															<v-icon v-bind="props" icon="circle-info" class="ml-2" />-->
												<!--														</template>-->
												<!--													</v-tooltip>-->
												<!--												</div>-->

												<v-divider class="my-2" />
											</v-row>

											<v-row>
												<v-col
													v-for="permission in group.permissions"
													:key="permission.name"
													class="pt-0 pl-0 pr-5 pb-0"
													cols="12"
													sm="6"
													md="4"
													lg="2"
												>
													<v-checkbox
														v-model="permission.isSelected"
														:label="$t(permission.name)"
														name="enabled"
														class="checkbox my-checkbox"
														hide-details
														@mouseenter="getInfo(permission.info)"
													/>
												</v-col>
											</v-row>
										</v-expansion-panel-text>
									</v-expansion-panel>
								</v-expansion-panels>
							</v-col>

							<v-col cols="4" class="note-panel" id="test">
								<div ref="testElement" class="help-block">
									<div v-for="(values, key) in info" :key="key" class="permissions-info">
										<h2 class="pb-3">{{ formatTitle(key) }}:</h2>

										<ul class="pl-10">
											<li v-for="(value, index) in values" :key="index">
												{{ value }}
											</li>
										</ul>
									</div>
								</div>
							</v-col>
						</v-row>
					</div>
				</v-col>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
import { required } from "@vuelidate/validators";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect.vue";
import validation from "@/mixins/validation";

export default {
	components: {
		DataSelect,
		DataInput,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				roleName: { required },
			},
		};
	},

	data() {
		return {
			allFutureProjects: false,
			hideAfterEndDate: true,
			info: {},
			distance: 0,
			padding: 0,
			selected: [],
			formModel: {
				roleName: "",
			},
			country: [
				{
					name: "Cambodia",
					expanded: 0,
					permissions: [
						{
							name: "Cambodia",
							isSelected: false,
						},
						{
							name: "Project 1",
							isSelected: false,
						},
						{
							name: "Project 2",
							isSelected: false,
						},
						{
							name: "Project 3",
							isSelected: false,
						},
						{
							name: "Project 4",
							isSelected: false,
						},
						{
							name: "Project 5",
							isSelected: false,
						},
					],
				},
				{
					name: "Ukraine",
					expanded: 0,
					permissions: [
						{
							name: "Ukraine",
							isSelected: false,
						},
						{
							name: "Project 1",
							isSelected: false,
						},
						{
							name: "Project 2",
							isSelected: false,
						},
						{
							name: "Project 3",
							isSelected: false,
						},
					],
				},
				{
					name: "Ethiopia",
					expanded: 0,
					permissions: [
						{
							name: "Ethiopia",
							isSelected: false,
						},
						{
							name: "Project 1",
							isSelected: false,
						},
						{
							name: "Project 2",
							isSelected: false,
						},
					],
				},
				{
					name: "Mongolia",
					expanded: 0,
					permissions: [
						{
							name: "Mongolia",
							isSelected: false,
						},
						{
							name: "Project 1",
							isSelected: false,
						},
						{
							name: "Project 2",
							isSelected: false,
						},
					],
				},
				{
					name: "Armenia",
					expanded: 0,
					permissions: [
						{
							name: "Mongolia",
							isSelected: false,
						},
						{
							name: "Project 1",
							isSelected: false,
						},
						{
							name: "Project 2",
							isSelected: false,
						},
					],
				},
				{
					name: "Zambia",
					expanded: 0,
					permissions: [
						{
							name: "Zambia",
							isSelected: false,
						},
						{
							name: "Project 1",
							isSelected: false,
						},
						{
							name: "Project 2",
							isSelected: false,
						},
					],
				},
				{
					name: "Afghanistan",
					expanded: 0,
					permissions: [
						{
							name: "Afghanistan",
							isSelected: false,
						},
						{
							name: "Project 1",
							isSelected: false,
						},
						{
							name: "Project 2",
							isSelected: false,
						},
					],
				},
				{
					name: "Yemen",
					expanded: 0,
					permissions: [
						{
							name: "Yemen",
							isSelected: false,
						},
						{
							name: "Project 1",
							isSelected: false,
						},
						{
							name: "Project 2",
							isSelected: false,
						},
					],
				},
				{
					name: "Columbia",
					expanded: 0,
					permissions: [
						{
							name: "Columbia",
							isSelected: false,
						},
						{
							name: "Project 1",
							isSelected: false,
						},
						{
							name: "Project 2",
							isSelected: false,
						},
					],
				},
				{
					name: "Moldova",
					expanded: 0,
					permissions: [
						{
							name: "Moldova",
							isSelected: false,
						},
						{
							name: "Project 1",
							isSelected: false,
						},
					],
				},
				{
					name: "Czech Republic",
					expanded: 0,
					permissions: [
						{
							name: "Czech Republic",
							isSelected: false,
						},
						{
							name: "Project 1",
							isSelected: false,
						},
					],
				},
			],
			groups: [
				{
					name: "Home page",
					icon: "home",
					expanded: 0,
					permissions: [
						{
							name: "Home Page",
							isSelected: false,
							info: {
								groupOfPermissions: [
									"Map - display map",
									"Summary - display summary on home page",
									"Assistances (View & Filter, Sort, Clear) - display assistances on home page. You only see assitances from projects you have data access for",
									"Assistances view Detail - allow opening assistance from home page. You only see assitances from projects you have data access for",
								],
							},
						},
					],
				},
				{
					name: "Project Management",
					icon: "clipboard-list",
					expanded: 0,
					permissions: [
						{
							name: "Project Management",
							isSelected: false,
							info: {},
						},
						{
							name: "Add Project",
							isSelected: false,
							info: {},
						},
						{
							name: "Export Project / Assistance Overview (All formats)",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Assistance management",
					icon: "hands-holding-child",
					expanded: 0,
					permissions: [
						{
							name: "Assistance management",
							isSelected: false,
							info: {},
						},
						{
							name: "Assistance Detail",
							isSelected: false,
							info: {},
						},
						{
							name: "Assistance Corrections",
							isSelected: false,
							info: {
								groupOfPermissions: [
									"Edit Assistance (ELO number, Note, …) - allow editing assistance (ELO, Note...)",
									"Un-distribute - allow requesting un-distribute",
									"Invalidate SC distribution - allow requesting invalidation",
								],
								prerequisite: [
									"View Household Information",
								],
							},
						},
						{
							name: "Assistance Manipulation",
							isSelected: false,
							info: {},
						},
						{
							name: "Update Assistance (step 1,2,3 + see validated)",
							isSelected: false,
							info: {},
						},
						{
							name: "Validate & Lock New Assistance",
							isSelected: false,
							info: {},
						},
						{
							name: "Assistance Distribution",
							isSelected: false,
							info: {},
						},
						{
							name: "Assistance Approvals",
							isSelected: false,
							info: {},
						},
						{
							name: "Close & Approve Assistances",
							isSelected: false,
							info: {},
						},
						{
							name: "Assistance Exports",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Households",
					icon: "user-friends",
					expanded: 0,
					permissions: [
						{
							name: "Households",
							isSelected: false,
							info: {},
						},
						{
							name: "Create Household",
							isSelected: false,
							info: {},
						},
						{
							name: "View Household Information",
							isSelected: false,
							info: {},
						},
						{
							name: "Edit Household",
							isSelected: false,
							info: {},
						},
						{
							name: "Delete Household",
							isSelected: false,
							info: {},
						},
						{
							name: "Export: Households",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Institutions",
					icon: "building",
					expanded: 0,
					permissions: [
						{
							name: "Institutions",
							isSelected: false,
							info: {},
						},
						{
							name: "Create Institution",
							isSelected: false,
							info: {},
						},
						{
							name: "Edit Institution",
							isSelected: false,
							info: {},
						},
						{
							name: "Delete Institution",
							isSelected: false,
							info: {},
						},
						{
							name: "Export: Institutions",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Vendors",
					icon: "store",
					expanded: 0,
					permissions: [
						{
							name: "Vendors",
							isSelected: false,
							info: {},
						},
						{
							name: "Add Vendor",
							isSelected: false,
							info: {},
						},
						{
							name: "Show Vendor Summary",
							isSelected: false,
							info: {},
						},
						{
							name: "Open Vendor Detail (button and row click)",
							isSelected: false,
							info: {},
						},
						{
							name: "Edit Vendor",
							isSelected: false,
							info: {},
						},
						{
							name: "Delete Vendor",
							isSelected: false,
							info: {},
						},
						{
							name: "Export: Vendors",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Imports",
					icon: "file-import",
					expanded: 0,
					permissions: [
						{
							name: "Imports",
							isSelected: false,
							info: {},
						},
						{
							name: "Show Detail (button)",
							isSelected: false,
							info: {},
						},
						{
							name: "Manage Imports",
							isSelected: false,
							info: {},
						},
						{
							name: "Resolve Duplicities (several buttons)",
							isSelected: false,
							info: {},
						},
						{
							name: "Approve and Save (button)",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Reports",
					icon: "chart-line",
					expanded: 0,
					permissions: [
						{
							name: "Reports",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Vouchers",
					icon: "ticket-alt",
					expanded: 0,
					permissions: [
						{
							name: "Vouchers",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Country Settings",
					icon: "globe-africa",
					expanded: 0,
					permissions: [
						{
							name: "Country Settings",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Products Items",
					icon: "shopping-cart",
					expanded: 0,
					permissions: [
						{
							name: "Products Items",
							isSelected: false,
							info: {},
						},
						{
							name: "New Product",
							isSelected: false,
							info: {},
						},
						{
							name: "New Category",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Custom Fields",
					icon: "map-marker-alt",
					expanded: 0,
					permissions: [
						{
							name: "Custom Fields",
							isSelected: false,
							info: {},
						},
						{
							name: "New Custom Field",
							isSelected: false,
							info: {},
						},
						{
							name: "Export Custom Fields",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Scoring",
					icon: "sort-amount-down",
					expanded: 0,
					permissions: [
						{
							name: "Scoring",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Administrative settings",
					icon: "wrench",
					expanded: 0,
					permissions: [
						{
							name: "Administrative Settings",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Users",
					icon: "user",
					expanded: 0,
					permissions: [
						{
							name: "Users",
							isSelected: false,
							info: {},
						},
						{
							name: "Add user",
							isSelected: false,
							info: {},
						},
						{
							name: "Assign Admin",
							isSelected: false,
							info: {},
						},
						{
							name: "Edit Admin",
							isSelected: false,
							info: {},
						},
						{
							name: "Delete User",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Donors",
					icon: "dollar-sign",
					expanded: 0,
					permissions: [
						{
							name: "Donors",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "My Organizations",
					icon: "child",
					expanded: 0,
					permissions: [
						{
							name: "My Organizations",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Organization Services",
					icon: "th-large",
					expanded: 0,
					permissions: [
						{
							name: "Organization Services",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Sync",
					icon: "right-to-bracket",
					expanded: 0,
					permissions: [
						{
							name: "Sync",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Role Management",
					icon: "list-check",
					expanded: 0,
					permissions: [
						{
							name: "Role Management",
							isSelected: false,
							info: {},
						},
						{
							name: "Delete Role",
							isSelected: false,
							info: {},
						},
					],
				},
				{
					name: "Transactions",
					icon: "exchange-alt",
					expanded: 0,
					permissions: [
						{
							name: "Transactions",
							isSelected: false,
							info: {},
						},
						{
							name: "Assistances export",
							isSelected: false,
							info: {},
						},
						{
							name: "Purchased items export",
							isSelected: false,
							info: {},
						},
					],
				},
			],
		};
	},

	mounted() {
		window.addEventListener("scroll", this.handleScroll);
		this.updatePadding();

		const element = document.getElementById("test");
		const { top } = element.getBoundingClientRect();
		this.distance = top;
	},

	beforeUnmount() {
		window.removeEventListener("scroll", this.handleScroll);
	},

	methods: {
		handleScroll() {
			this.updatePadding();
		},

		formatTitle(key) {
			return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
		},

		getInfo(info) {
			this.info = { ...info };
		},

		updatePadding() {
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

			this.padding = scrollTop;
			if (this.$refs.testElement && this.padding > this.distance) {
				this.$refs.testElement.style.paddingTop = `${this.padding - this.distance}px`;
			}
		},
	},
};
</script>

<style lang="scss">
.note-panel {
	box-shadow: 0px 3px 1px -2px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)),
	0px 2px 2px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)),
	0px 1px 5px 0px var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0.12));
	background-color: #e9e9e9;
}

.permissions-info {
	background-color: white;
	border-radius: 12px;
	padding: 16px;
	margin: 12px;
}

.my-checkbox {
	border-radius: 6px;

	&.head {
		max-width: fit-content;
	}

	&:not(.head):hover {
		background-color: #e9eaec;
	}

	.v-selection-control__wrapper {
		left: 0;
	}

	.v-label {
		width: 100%;
		padding-left: 12px;
	}

	.v-selection-control--density-default {
		--v-selection-control-size: 25px;
	}
}

.v-checkbox.my-checkbox {
	.v-selection-control {
		--v-input-control-height: 45px !important;
	}
}

.v-expansion-panel-text__wrapper {
	.v-row {
		align-items: center;
	}
}
</style>
