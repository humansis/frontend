<template>
	<v-container fluid>
		<ConfirmAction
			:is-dialog-opened="isConfirmModalOpen"
			confirm-title="Date of Assistance"
			confirm-message="You picked date from the past. Is it ok?"
			prepend-icon="circle-exclamation"
			prepend-icon-color="warning"
			close-button-name="Cancel"
			confirm-button-name="Yes and Continue"
			confirm-button-color="warning"
			@modalClosed="isConfirmModalOpen = false"
			@actionConfirmed="onSubmitAddingAssistance"
		/>

		<ConfirmAction
			:is-dialog-opened="isUnValidCardModalOpen"
			:confirm-message="unValidCardMessage"
			:is-close-button-visible="false"
			confirm-title="Warning"
			prepend-icon="circle-exclamation"
			prepend-icon-color="warning"
			confirm-button-name="OK"
			confirm-button-color="warning"
			@actionConfirmed="isUnValidCardModalOpen = false"
		/>

		<div class="new-assistance-title">
			<h1 class="text-h5 font-weight-bold" data-cy="page-title-text">
				{{ $t('New Assistance') }}
			</h1>

			<span v-if="householdWithoutHead" class="integrity-issues">
				<v-icon icon="exclamation-triangle" class="pr-2" />

				{{ $t('Some of households in project have integrity issues') }}:

				<span class="pl-2">
					<v-tooltip
						:text="$t('No household head')"
						location="top"
						content-class="tooltip-top"
					>
						<template v-slot:activator="{ props }">
							<v-icon v-bind=props icon="users" />
						</template>
					</v-tooltip>
				</span>
			</span>
		</div>

		<v-row class="new-assistance">
			<v-col cols="5">
				<NewAssistanceForm
					ref="newAssistanceForm"
					:project="project"
					:new-assistance-form="componentsData.newAssistanceForm"
					:data-before-duplicated="componentsData.dataBeforeDuplicated"
					:date-expiration="assistanceBody.dateExpiration"
					:validation-messages="validationMessages"
					@updatedData="onFetchNewAssistanceForm"
					@targetSelect="onTargetSelected"
					@showComponent="onShowComponent"
				/>
			</v-col>

			<v-col cols="7">
				<div v-show="visibleComponents.selectionCriteria">
					<SelectionCriteria
						ref="selectionCriteria"
						:target-type="targetType"
						:data="componentsData.selectionCriteria"
						:assistance-body="assistanceBody"
						:is-assistance-duplicated="isDuplicated"
						:custom-fields="customFields"
						@updatedData="onFetchSelectionCriteria"
						@beneficiariesCounted="selectedBeneficiariesCount = $event"
						@deliveredCommodityValue="onGetDeliveredCommodityValue"
					/>
				</div>

				<div v-show="visibleComponents.communities || visibleComponents.institutions">
					<TargetTypeSelect
						ref="targetTypeSelect"
						:project-id="assistanceBody.projectId"
						:visible="targetTypeSelectVisible"
						:is-assistance-duplicated="isDuplicated"
						@updatedData="onFetchTargetType"
					/>
				</div>

				<div v-show="visibleComponents.distributedCommodity">
					<DistributedCommodity
						v-if="isProjectReady"
						ref="distributedCommodity"
						:project="project"
						:commodity="componentsData.distributedCommodity"
						:selected-beneficiaries="selectedBeneficiariesCount"
						:calculated-commodity-value="calculatedCommodityValue"
						:is-assistance-duplicated="isDuplicated"
						:target-type="targetType"
						:date-of-assistance="assistanceBody.dateDistribution"
						:validation-messages="validationMessages"
						@updatedData="onFetchDistributedCommodity"
						@deliveredCommodityValue="onGetDeliveredCommodityValue"
					/>
				</div>

				<div
					v-show="visibleComponents.activityDescription
						|| visibleComponents.householdsTargeted
						|| visibleComponents.individualsTargeted"
				>
					<ActivityDetails
						ref="activityDetails"
						:visible="visibleActivityDetails"
						:data="componentsData.activityDetails"
						@updatedData="onFetchActivityDetails"
					/>
				</div>

			</v-col>
		</v-row>

		<div class="d-flex justify-end mt-5">
			<v-btn
				:to="{ name: 'Project', params: { projectId: this.$route.params.projectId } }"
				color="blue-grey-lighten-4"
				variant="elevated"
				class="text-none mr-3"
			>
				{{ $t('Back') }}
			</v-btn>

			<v-btn
				:disabled="createAssistanceButtonDisabled"
				:loading="loading"
				color="primary"
				class="text-none"
				@click="onValidateNewAssistance"
			>
				{{ $t('Create') }}
			</v-btn>
		</div>
	</v-container>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import CustomFieldsService from "@/services/CustomFieldsService";
import ProjectService from "@/services/ProjectService";
import NewAssistanceForm from "@/components/Assistance/AddAssistance/NewAssistanceForm";
import ActivityDetails from "@/components/Assistance/AddAssistance/SelectionTypes/ActivityDetails";
import DistributedCommodity from "@/components/Assistance/AddAssistance/SelectionTypes/DistributedCommodity";
import SelectionCriteria from "@/components/Assistance/AddAssistance/SelectionTypes/SelectionCriteria";
import TargetTypeSelect from "@/components/Assistance/AddAssistance/SelectionTypes/TargetTypeSelect";
import ConfirmAction from "@/components/ConfirmAction";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";

export default {
	name: "AddAssistance",

	components: {
		TargetTypeSelect,
		ActivityDetails,
		NewAssistanceForm,
		SelectionCriteria,
		DistributedCommodity,
		ConfirmAction,
	},

	data() {
		return {
			componentsData: {
				newAssistanceForm: null,
				dataBeforeDuplicated: {},
				distributedCommodity: null,
				activityDetails: null,
				selectionCriteria: null,
			},
			project: {},
			isProjectReady: false,
			isConfirmModalOpen: false,
			isUnValidCardModalOpen: false,
			visibleComponents: {
				selectionCriteria: false,
				distributedCommodity: false,
				communities: false,
				institutions: false,
				activityDescription: false,
				householdsTargeted: false,
				individualsTargeted: false,
			},
			targetType: "",
			assistanceBody: {
				dateDistribution: "",
				dateExpiration: "",
				description: "",
				householdsTargeted: null,
				individualsTargeted: null,
				projectId: Number(this.$route.params.projectId),
				target: "",
				type: "",
				sector: "",
				name: "",
				scoringBlueprintId: null,
				subsector: "",
				locationId: null,
				commodities: [],
				selectionCriteria: [],
				communities: [],
				institutions: [],
				threshold: null,
				completed: false,
				validated: false,
				iso3: this.$store.state.country?.iso3,
				remoteDistributionAllowed: null,
				allowedProductCategoryTypes: [],
				cashbackLimit: null,
				note: "",
				round: null,
			},
			validationMessages: {
				activity: "",
				budgetLine: "",
				modalityType: "",
			},
			scoringTypes: [],
			customFields: [],
			selectedBeneficiariesCount: 0,
			loading: false,
			isDuplicated: false,
			duplicateAssistance: null,
			assistanceSelectionCriteria: [],
			calculatedCommodityValue: [],
			createAssistanceButtonDisabled: false,
			unValidCardMessage: "",
		};
	},

	computed: {
		visibleActivityDetails() {
			return {
				activityDescription: this.visibleComponents.activityDescription,
				householdsTargeted: this.visibleComponents.householdsTargeted,
				individualsTargeted: this.visibleComponents.individualsTargeted,
			};
		},

		targetTypeSelectVisible() {
			return {
				communities: this.visibleComponents.communities,
				institutions: this.visibleComponents.institutions,
			};
		},

		householdWithoutHead() {
			return this.project.householdIntegrityIssues?.find(
				(issue) => issue === ASSISTANCE.INTEGRITY_ISSUES.HOUSEHOLD_WITHOUT_HEAD,
			);
		},

		visibleRightSidePanel() {
			return this.visibleComponents.selectionCriteria
				|| this.visibleComponents.communities
				|| this.visibleComponents.institutions
				|| this.visibleComponents.distributedCommodity
				|| this.visibleComponents.activityDescription
				|| this.visibleComponents.householdsTargeted
				|| this.visibleComponents.individualsTargeted;
		},
	},

	async created() {
		await this.fetchProject();

		this.isDuplicated = !!this.$route.query.duplicateAssistance;

		if (this.isDuplicated) {
			await AssistancesService.getSelectionCriteria(this.$route.query.duplicateAssistance)
				.then(({ data, message }) => {
					if (!data) {
						throw new Error(message);
					}

					this.assistanceSelectionCriteria = this.getValidSelectionCriteria(data);
				})
				.catch((e) => {
					Notification(`${this.$t("Assistance Selection Criteria")} ${e.message || e}`, "error");
				});

			await AssistancesService.getDetailOfAssistance(this.$route.query.duplicateAssistance)
				.then(async (data) => {
					this.duplicateAssistance = data;
				})
				.catch((e) => {
					Notification(`${this.$t("Duplicate Assistance")} ${e.message || e}`, "error");
				});

			try {
				this.scoringTypesLoading = true;

				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getScoringTypes(
					null,
					null,
				);

				checkResponseStatus(status, message);

				this.scoringTypes = data;
			} catch (e) {
				Notification(`${this.$t("Scoring Types")}: ${e.message || e}`, "error");
			} finally {
				this.scoringTypesLoading = false;
			}

			await this.mapAssistance(this.duplicateAssistance);
		}
	},

	methods: {
		async fetchProject() {
			this.isProjectReady = false;
			const { projectId } = this.$route.params;

			if (projectId) {
				await ProjectService.getDetailOfProject(projectId)
					.then(({ data }) => {
						this.project = data;
						this.isProjectReady = true;
					})
					.catch((e) => {
						Notification(`${this.$t("Project")} ${e.message || e}`, "error");
					});
			}
		},

		async onGetDeliveredCommodityValue(updatedCommodities = null) {
			if (this.assistanceBody.commodities[0]?.modalityType) {
				this.validationMessages.modalityType = "";
			}

			await this.onFetchDistributedCommodity(updatedCommodities || this.assistanceBody.commodities);

			const { dateExpiration, ...commoditiesBody } = this.assistanceBody;
			const result = await AssistancesService.calculationCommodities(commoditiesBody);

			if (result.status !== 200) return;

			this.calculatedCommodityValue = result.data.data;
		},

		onValidateNewAssistance() {
			if (this.$refs.newAssistanceForm.submit()) {
				const dateDistribution = this.$moment(this.assistanceBody.dateDistribution).format("YYYY-MM-DD");
				const today = this.$moment().format("YYYY-MM-DD");
				const isBeforeToday = this.$moment(dateDistribution).isBefore(today);

				if (isBeforeToday) {
					this.isConfirmModalOpen = true;
				} else {
					this.onSubmitAddingAssistance();
				}
			}
		},

		async onSubmitAddingAssistance() {
			if (!this.$refs.newAssistanceForm.submit()) return;
			this.assistanceBody.locationId = this.$refs.newAssistanceForm.getLocationId();

			if (this.visibleComponents.communities || this.visibleComponents.institutions) {
				if (!this.$refs.targetTypeSelect.submit()) return;
			}

			if (this.visibleComponents.activityDescription
				|| this.visibleComponents.householdsTargeted
				|| this.visibleComponents.individualsTargeted
			) {
				if (!this.$refs.activityDetails.submit()) return;
			}

			if (this.visibleComponents.selectionCriteria) {
				if (!this.$refs.selectionCriteria.submit()) {
					Notification(`${this.$t("Assistance cannot be created with no criteria.")}`, "warning");
					return;
				}
			}

			if (this.visibleComponents.distributedCommodity) {
				if (!this.$refs.distributedCommodity.submit()) {
					Notification(`${this.$t("Assistance cannot be created with no commodity.")}`, "warning");
					return;
				}
			}

			if (!this.isRemoteAndValid()) return;

			this.loading = true;

			const { dateExpiration, ...assistanceBody } = this.assistanceBody;

			await AssistancesService.createAssistance(assistanceBody)
				.then(({ status, data: { id }, message }) => {
					const success = status === 200;
					const badRequest = status === 400;

					if (success) {
						Notification(this.$t("Assistance Successfully Created"), "success");
						if (id) {
							this.$router.push({
								name: "AssistanceEdit",
								params: { assistanceId: id },
							});
						} else {
							this.$router.push({
								name: "Project",
								params: { projectId: this.$route.params.projectId },
							});
						}
					}

					if (badRequest) {
						Notification(message || `${this.$t("Error code 400")}`, "warning");
					}
				}).catch((e) => {
					Notification(`${this.$t("New Assistance")} ${e.message || e}`, "error");
				});

			this.loading = false;
		},

		isRemoteAndValid() {
			const { remoteDistributionAllowed, target } = this.assistanceBody;

			if (remoteDistributionAllowed) {
				let allCriteriaHasValidCard = true;

				if (target === ASSISTANCE.TARGET.HOUSEHOLD) {
					allCriteriaHasValidCard = this.$refs.selectionCriteria.groups
						.every(({ data }) => data.some((
							{
								criteria,
								criteriaTarget,
								value,
							},
						) => criteria.code === ASSISTANCE.CRITERIA.HAS_VALID_SMART_CARD
								&& (value.code || value === true)
								&& criteriaTarget.code === ASSISTANCE.CRITERIA_TARGET.HEAD));

					this.unValidCardMessage = 'Please add "Head: Has valid card = true" criterion for each group';
				}

				if (target === ASSISTANCE.TARGET.INDIVIDUAL) {
					allCriteriaHasValidCard = this.$refs.selectionCriteria.groups
						.every(({ data }) => data.some((
							{
								criteria,
								criteriaTarget,
								value,
							},
						) => criteria.code === ASSISTANCE.CRITERIA.HAS_VALID_SMART_CARD
							&& (value.code || value === true)
							&& criteriaTarget.code === ASSISTANCE.CRITERIA_TARGET.BENEFICIARY));

					this.unValidCardMessage = 'Please add "Beneficiary: Has valid card = true" criterion for each group';
				}

				if (allCriteriaHasValidCard) {
					return true;
				}

				this.isUnValidCardModalOpen = true;

				return false;
			}

			return true;
		},

		// TODO Destructure this function in future for simplification and better readability
		async mapAssistance(assistance) {
			let round;
			const { eloNumber, activity, budgetLine } = assistance;

			if (assistance.round) {
				if (assistance.round < 99) {
					round = { code: assistance.round + 1, value: assistance.round + 1 };
				} else {
					round = { code: assistance.round, value: assistance.round };
				}
			}

			this.componentsData.dataBeforeDuplicated = {
				dateDistribution: assistance.dateDistribution,
				round: assistance.round,
			};

			this.componentsData.newAssistanceForm = {
				name: assistance.name,
				adm1: null,
				adm2: null,
				adm3: null,
				adm4: null,
				adm1Id: assistance.adm1?.id,
				adm2Id: assistance.adm2?.id,
				adm3Id: assistance.adm3?.id,
				adm4Id: assistance.adm4?.id,
				dateOfAssistance: new Date(assistance.dateDistribution),
				assistanceType: assistance.type,
				sector: assistance.sector,
				subsector: assistance.subsector,
				targetType: assistance.target,
				note: assistance.note,
				round,
				eloNumber,
				activity,
				budgetLine,
			};

			if (this.project.targets.length) {
				const selectableActivities = [];
				const selectableBudgetLines = [];
				const selectableModalityTypes = [];
				const matchedModalityType = this.project.targets.some(
					(target) => target.modalityType?.code === assistance.commodities[0]?.modalityType,
				);
				const isAllTargetsWithModality = this.project.targets.every(
					(target) => target.modalityType,
				);

				this.project.targets.forEach((target) => {
					if (target.activity) {
						if (!this.componentsData.newAssistanceForm.activity?.code) {
							this.componentsData.newAssistanceForm.activity = target.activity === activity
								? { code: activity, value: activity }
								: null;
						}
						selectableActivities.push(target.activity);
					}

					if (target.budgetLine) {
						if (!this.componentsData.newAssistanceForm.budgetLine?.code) {
							this.componentsData.newAssistanceForm.budgetLine = target.budgetLine === budgetLine
								? { code: budgetLine, value: budgetLine }
								: null;
						}
						selectableBudgetLines.push(target.budgetLine);
					}

					if (isAllTargetsWithModality && !matchedModalityType) {
						selectableModalityTypes.push(target.modalityType.value);
					}
				});

				if (activity && !this.componentsData.newAssistanceForm.activity) {
					this.validationMessages.activity = `${this.$t("Activity was removed because:")} ${activity}
						${this.$t("is not included in project targets. Allowed activities:")}
						${selectableActivities.join(", ")}`;
				}

				if (budgetLine && !this.componentsData.newAssistanceForm.budgetLine) {
					this.validationMessages.budgetLine = `${this.$t("Budget line was removed because:")} ${budgetLine}
						${this.$t("is not included in project targets. Allowed budget lines:")}
						${selectableBudgetLines.join(", ")}`;
				}

				if (!matchedModalityType && isAllTargetsWithModality) {
					this.validationMessages.modalityType = `${this.$t("Modality was removed because:")}
						${this.$t("modality type")} ${assistance.commodities[0]?.modalityType}
						${this.$t("is not included in project targets. Allowed modality types:")}
						${selectableModalityTypes.join(", ")}`;
				}
			}

			const scoringType = assistance.scoringBlueprint === null
				? AssistancesService.getDefaultScoringType()
				: this.scoringTypes.filter(({ enabled }) => enabled)
					.find(({ id }) => id === assistance.scoringBlueprint?.id);

			if (assistance.scoringBlueprint && !scoringType) {
				Notification(`${this.$t("Scoring type isn't available from duplicated assistance.")} ${this.$t("Select new one.")}`, "warning");
			}

			if (assistance.scoringBlueprint && scoringType) {
				this.$refs.selectionCriteria.scoringType = {
					...scoringType,
					identifier: `${scoringType.name} (ID: ${scoringType.id})`,
				};
				this.$refs.selectionCriteria.minimumSelectionScore = assistance.threshold;
			} else {
				this.$refs.selectionCriteria.scoringType = AssistancesService.getDefaultScoringType();
				this.$refs.selectionCriteria.minimumSelectionScore = null;
			}

			const commodities = await this.fetchAssistanceCommodities();
			const preparedCommodities = [];

			if (this.isDuplicated) {
				await this.fetchCustomFields();

				commodities.forEach((item, index) => {
					const commodity = item?.division?.customField?.key;
					const isCommodityFound = this.customFields.find((field) => field.key === commodity);

					if (commodity && !isCommodityFound) {
						Notification(`${this.$t("Custom field")} ${commodity} ${this.$t("has been removed, Commodity must be added again.")}`, "warning");
						commodities.splice(index, 1);
					}
				});
			}

			commodities.forEach((item) => {
				const modality = this.getModalityByType(item.modalityType);

				const {
					unit,
					quantity,
					value,
					currency,
					secondUnit,
					secondQuantity,
				} = item.fields;

				preparedCommodities.push({
					modalityType: item.modalityType,
					unit,
					quantity,
					value,
					currency,
					secondUnit,
					secondQuantity,
					description: item.description,
					dateExpiration: assistance.dateExpiration
						? this.$moment(assistance.dateExpiration).format("YYYY-MM-DD") : null,
					division: item.division,
					modality,
					remoteDistributionAllowed: assistance.remoteDistributionAllowed,
					allowedProductCategoryTypes: assistance.allowedProductCategoryTypes,
					cashbackLimit: assistance.cashbackLimit,
				});
			});

			if (this.validationMessages.modalityType?.length) {
				this.componentsData.distributedCommodity = null;
			} else {
				this.componentsData.distributedCommodity = preparedCommodities;
				await this.onGetDeliveredCommodityValue(preparedCommodities);
			}

			this.componentsData.activityDetails = {
				activityDescription: assistance.description || "",
				householdsTargeted: assistance.householdsTargeted || 0,
				individualsTargeted: assistance.individualsTargeted || 0,
			};

			this.targetType = assistance.target;
			this.assistanceBody.locationId = assistance.location?.locationId;
			this.assistanceBody.target = assistance.target;
			this.assistanceBody.type = assistance.type;
			this.assistanceBody.sector = assistance.sector;
			this.assistanceBody.subsector = assistance.subsector;
			this.assistanceBody.note = assistance.note;
			this.assistanceBody.round = this.componentsData.newAssistanceForm.round?.code || null;

			this.componentsData.selectionCriteria = await this.mapSelectionCriteria();
		},

		mapSelectionCriteria() {
			const preparedSelectionCriteria = [];

			this.assistanceSelectionCriteria.forEach((item) => {
				if (preparedSelectionCriteria[item.group]) {
					preparedSelectionCriteria[item.group].data.push({
						criteriaTarget: { value: item.target, code: item.target },
						target: item.target,
						criteria: { code: item.field },
						condition: { code: item.condition },
						value: item.value,
						scoreWeight: item.weight,
					});
				} else {
					preparedSelectionCriteria[item.group] = {};
					preparedSelectionCriteria[item.group].data = [];
					preparedSelectionCriteria[item.group].tableData = [];
					preparedSelectionCriteria[item.group].data.push({
						criteriaTarget: { value: item.target, code: item.target },
						target: item.target,
						criteria: { code: item.field },
						condition: { code: item.condition },
						value: item.value,
						scoreWeight: item.weight,
					});
				}
			});

			return preparedSelectionCriteria;
		},

		onTargetSelected(targetType) {
			this.targetType = targetType?.code;

			if (this.$refs.selectionCriteria) {
				this.$refs.selectionCriteria.clearComponent();
			}

			if (this.$refs.distributedCommodity) {
				this.$refs.distributedCommodity.clearComponent();
			}
			// TODO Reset all components in AddAssistance on targetSelected change
		},

		onShowComponent(components) {
			Object.keys(this.visibleComponents).forEach((item) => {
				this.visibleComponents[item] = components
					.find((component) => item === component);
			});
		},

		isDateValid(inputDate) {
			return inputDate instanceof Date && !Number.isNaN(inputDate)
				&& inputDate >= new Date(this.project.startDate)
				&& inputDate <= new Date(this.project.endDate);
		},

		fetchAssistanceCommodities() {
			return AssistancesService.getAssistanceCommodities(this.$route.query.duplicateAssistance)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Commodities")} ${e.message || e}`, "error");
				});
		},

		async fetchCustomFields() {
			try {
				const { data: { data } } = await CustomFieldsService.getListOfCustomFields(
					null,
					null,
					null,
					null,
				);

				this.customFields = data;
			} catch (e) {
				Notification(`${this.$t("Custom Fields")} ${e.message || e}`, "error");
			}
		},

		async onFetchNewAssistanceForm({ data, isFetchForced }) {
			const {
				name,
				assistanceType,
				dateOfAssistance,
				sector,
				subsector,
				targetType,
				note,
				round,
				isDateOfAssistanceValid,
				eloNumber,
				activity,
				budgetLine,
			} = data;

			this.createAssistanceButtonDisabled = !isDateOfAssistanceValid;

			this.assistanceBody = {
				...this.assistanceBody,
				name,
				dateDistribution: this.isDateValid(dateOfAssistance)
					? this.$moment(dateOfAssistance).format("YYYY-MM-DD")
					: this.project?.startDate,
				target: targetType?.code,
				type: assistanceType?.code,
				sector: sector?.code,
				subsector: subsector?.code,
				locationId: this.$refs.newAssistanceForm.getLocationId(),
				note,
				round: round?.code,
				eloNumber,
				activity: activity?.value || activity,
				budgetLine: budgetLine?.value || budgetLine,
			};

			if (this.assistanceBody.target) {
				if (!sector?.code || !subsector?.code) {
					this.validationMessages.modalityType = "";
				}

				if (isFetchForced) {
					await this.$refs.selectionCriteria.fetchCriteriaInfo({ changeScoreInterval: true });
				}
			}
		},

		onFetchSelectionCriteria(
			selectionCriteria,
			minimumSelectionScore,
			vulnerabilityScoreTouched,
			scoringType,
		) {
			this.createAssistanceButtonDisabled = vulnerabilityScoreTouched;

			this.assistanceBody = {
				...this.assistanceBody,
				selectionCriteria,
				scoringBlueprintId: scoringType?.id || null,
				threshold: minimumSelectionScore,
			};
		},

		onFetchDistributedCommodity(commodities) {
			const dateExpiration = new Date(commodities?.[0]?.dateExpiration);
			const date = this.isDateValid(dateExpiration)
				? dateExpiration
				: new Date(this.project.endDate);

			this.assistanceBody = {
				...this.assistanceBody,
				commodities,
				dateExpiration: this.$moment(date).format("YYYY-MM-DD"),
				remoteDistributionAllowed: this.remoteAllowed(commodities[0]),
				allowedProductCategoryTypes: commodities[0]?.allowedProductCategoryTypes || [],
				cashbackLimit: commodities[0]?.allowedProductCategoryTypes?.includes("Cashback") ? Number(commodities[0]?.cashbackLimit) : 0,
			};
		},

		remoteAllowed(commodity) {
			let result = null;

			if (commodity?.modalityType === ASSISTANCE.COMMODITY.SMARTCARD) {
				result = !!commodity?.remoteDistributionAllowed;
			} else {
				result = null;
			}

			return result;
		},

		onFetchActivityDetails(data) {
			const {
				activityDescription: description,
				householdsTargeted,
				individualsTargeted,
			} = data;

			this.assistanceBody = {
				...this.assistanceBody,
				description,
				householdsTargeted,
				individualsTargeted,
			};
		},

		getValidSelectionCriteria(criteria = []) {
			const validCriteria = criteria.filter(({ deprecated }) => !deprecated);

			if (criteria.length !== validCriteria.length) {
				Notification(
					this.$t("Some selection criteria are outdated and have not been duplicated."),
					"warning",
				);
			}

			return validCriteria;
		},

		onFetchTargetType(data) {
			const { communities, institutions } = data;

			this.assistanceBody = {
				...this.assistanceBody,
				communities,
				institutions,
			};
		},

		getModalityByType(code) {
			switch (code) {
				case ASSISTANCE.COMMODITY.CASH:
				case ASSISTANCE.COMMODITY.SMARTCARD:
				case ASSISTANCE.COMMODITY.MOBILE_MONEY:
					return "Cash";
				case ASSISTANCE.COMMODITY.FOOD_RATIONS:
				case ASSISTANCE.COMMODITY.READY_TO_EAT_RATIONS:
				case ASSISTANCE.COMMODITY.BREAD:
				case ASSISTANCE.COMMODITY.AGRICULTURAL_KIT:
				case ASSISTANCE.COMMODITY.WASH_KIT:
				case ASSISTANCE.COMMODITY.SHELTER_TOOL_KIT:
				case ASSISTANCE.COMMODITY.HYGIENE_KIT:
				case ASSISTANCE.COMMODITY.DIGNITY_KIT:
				case ASSISTANCE.COMMODITY.NFI_KIT:
				case ASSISTANCE.COMMODITY.WINTERIZATION_KIT:
					return "In Kind";
				case ASSISTANCE.COMMODITY.LOAN:
				case ASSISTANCE.COMMODITY.BUSINESS_GRANT:
					return "Other";
				case ASSISTANCE.COMMODITY.QR_CODE_VOUCHER:
				case ASSISTANCE.COMMODITY.PAPER_VOUCHER:
					return "Other";
				default:
					return "";
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.new-assistance-title {
	display: flex;

	.title {
		margin-bottom: 1.5rem;
	}

	.integrity-issues {
		font-weight: bold;
		margin: 0 auto;
	}
}

.new-assistance {
	@media (max-width: 940px) {
		flex-direction: column;

		> .v-col {
			max-width: 77rem;
		}
	}
}
</style>
