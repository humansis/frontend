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

			<span v-if="isHouseholdWithoutHead" class="integrity-issues">
				<v-icon icon="exclamation-triangle" class="pr-4" />

				{{ $t('Some of households in project have integrity issues') }}:

				<span class="pl-3">
					<v-tooltip
						:text="$t('No household head')"
						location="top"
						content-class="tooltip-top"
					>
						<template v-slot:activator="{ props }">
							<v-icon v-bind="props" icon="users" />
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
				<div v-if="visibleComponents.selectionCriteria">
					<SelectionCriteria
						ref="selectionCriteria"
						:target-type="targetType"
						:data="componentsData.selectionCriteria"
						:assistance-body="assistanceBody"
						:is-assistance-duplicated="isAssistanceDuplicated"
						:is-commodities-created="!!assistanceBody.commodities?.length"
						:is-calculated-data-loading="isCalculatedDataLoading"
						:calculated-beneficiaries="calculatedBeneficiaries"
						:scoring="componentsData.scoring"
						:custom-fields="customFields"
						@updatedData="onFetchSelectionCriteria"
						@beneficiariesCounted="selectedBeneficiariesCount = $event"
						@calculatedCommodities="calculatedCommodityValue = $event"
						@updateDataLoadingState="isCalculatedDataLoading = $event"
					/>
				</div>

				<div v-if="visibleComponents.institutions">
					<TargetTypeSelect
						ref="targetTypeSelect"
						:project-id="assistanceBody.projectId"
						:visible="targetTypeSelectVisible"
						:is-assistance-duplicated="isAssistanceDuplicated"
						@updatedData="onFetchTargetType"
					/>
				</div>

				<div v-if="visibleComponents.distributedCommodity">
					<DistributedCommodity
						v-if="isProjectReady"
						ref="distributedCommodity"
						:project="project"
						:commodity="componentsData.distributedCommodity"
						:calculated-commodity-value="calculatedCommodityValue"
						:is-assistance-duplicated="isAssistanceDuplicated"
						:is-calculated-data-loading="isCalculatedDataLoading"
						:target-type="targetType"
						:date-of-assistance="assistanceBody.dateDistribution"
						:validation-messages="validationMessages"
						@updatedData="onFetchDistributedCommodity"
					/>
				</div>

				<div v-if="isActivityDetailsVisible">
					<ActivityDetails
						ref="activityDetails"
						:visible="visibleActivityDetails"
						:duplicatedData="componentsData.activityDetails"
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
				:disabled="isAssistanceCreateButtonDisabled"
				:loading="isAssistanceCreateLoading"
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
import assistanceHelper from "@/mixins/assistanceHelper";
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

	mixins: [assistanceHelper],

	data() {
		return {
			componentsData: {
				newAssistanceForm: null,
				dataBeforeDuplicated: {},
				distributedCommodity: null,
				activityDetails: null,
				selectionCriteria: null,
				scoring: {},
			},
			project: {},
			calculatedBeneficiaries: {},
			isProjectReady: false,
			isConfirmModalOpen: false,
			isCalculatedDataLoading: false,
			isUnValidCardModalOpen: false,
			isCalculatedDataFetched: false,
			visibleComponents: {
				selectionCriteria: false,
				distributedCommodity: false,
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
			isAssistanceCreateLoading: false,
			duplicateAssistance: null,
			assistanceSelectionCriteria: [],
			calculatedCommodityValue: [],
			isAssistanceCreateButtonDisabled: false,
			unValidCardMessage: "",
		};
	},

	computed: {
		visibleActivityDetails() {
			return {
				isActivityDescription: this.visibleComponents.activityDescription,
				isHouseholdsTargeted: this.visibleComponents.householdsTargeted,
				isIndividualsTargeted: this.visibleComponents.individualsTargeted,
			};
		},

		isActivityDetailsVisible() {
			return this.visibleComponents.activityDescription
				|| this.visibleComponents.householdsTargeted
				|| this.visibleComponents.individualsTargeted;
		},

		targetTypeSelectVisible() {
			return {
				isInstitutions: this.visibleComponents.institutions,
			};
		},

		isHouseholdWithoutHead() {
			return this.project.householdIntegrityIssues?.find(
				(issue) => issue === ASSISTANCE.INTEGRITY_ISSUES.HOUSEHOLD_WITHOUT_HEAD,
			);
		},
	},

	watch: {
		assistanceBody: {
			deep: true,
			async handler(value) {
				if (this.checkDataInAssistanceBody(value) && !this.isCalculatedDataFetched) {
					this.isCalculatedDataFetched = true;
					await this.fetchCommoditiesValue();
				}
			},
		},
	},

	async created() {
		await this.fetchProject();

		if (!this.isAssistanceDuplicated) return;

		await Promise.all([
			this.fetchSelectionCriteria(),
			this.fetchDetailOfAssistance(),
			this.fetchScoringTypes(),
		]);

		await this.mapAssistance(this.duplicateAssistance);
	},

	methods: {
		async fetchProject() {
			this.isProjectReady = false;
			const { projectId } = this.$route.params;

			if (!projectId) return;

			try {
				const {
					data,
					status,
					message,
				} = await ProjectService.getDetailOfProject(projectId);

				checkResponseStatus(status, message);

				this.project = data;
			} catch (e) {
				Notification(`${this.$t("Project")}: ${e.message || e}`, "error");
			} finally {
				this.isProjectReady = true;
			}
		},

		async fetchSelectionCriteria() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getSelectionCriteria(this.duplicatedAssistanceId);

				checkResponseStatus(status, message);

				this.assistanceSelectionCriteria = this.getValidSelectionCriteria(data);
			} catch (e) {
				Notification(`${this.$t("Assistance Selection Criteria")}: ${e.message || e}`, "error");
			}
		},

		async fetchDetailOfAssistance() {
			try {
				const {
					data,
					status,
					message,
				} = await AssistancesService.getDetailOfAssistance(this.duplicatedAssistanceId);

				checkResponseStatus(status, message);

				this.duplicateAssistance = data;
			} catch (e) {
				Notification(`${this.$t("Duplicate Assistance")}: ${e.message || e}`, "error");
			}
		},

		async fetchScoringTypes() {
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
		},

		async fetchCommoditiesValue() {
			try {
				this.isCalculatedDataLoading = true;

				const {
					data: { commodities, selectedCount, totalCount },
					status,
					message,
				} = await AssistancesService.assistancePrecalculate(this.assistanceBody);

				checkResponseStatus(status, message);

				this.calculatedCommodityValue = commodities;
				this.calculatedBeneficiaries = {
					selectedCount,
					totalCount,
				};
			} catch (e) {
				Notification(`${this.$t("Commodities")}: ${e.message || e}`, "error");
			} finally {
				this.isCalculatedDataLoading = false;
			}
		},

		async fetchNewAssistance() {
			this.isAssistanceCreateLoading = true;

			const { dateExpiration, ...assistanceBody } = this.assistanceBody;

			try {
				const {
					data: { id },
					status,
					message,
				} = await AssistancesService.createAssistance(assistanceBody);

				checkResponseStatus(status, message);

				Notification(this.$t("Assistance Successfully Created"), "success");

				if (id) {
					this.$router.push({
						name: "AssistanceCreationProgress",
						params: {
							projectId: this.$route.params.projectId,
							assistanceId: id,
						},
					});
				} else {
					this.$router.push({
						name: "Project",
						params: { projectId: this.$route.params.projectId },
					});
				}
			} catch (e) {
				Notification(`${this.$t("New Assistance")}: ${e.message || e}`, "error");
			}

			this.isAssistanceCreateLoading = false;
		},

		onValidateNewAssistance() {
			if (this.$refs.newAssistanceForm.isFormValid()) {
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
			if (!this.$refs.newAssistanceForm.isFormValid()) return;

			this.assistanceBody.locationId = this.$refs.newAssistanceForm.getLocationId();

			if (this.visibleComponents.institutions) {
				if (!this.$refs.targetTypeSelect.isFormValid()) return;
			}

			if (this.visibleComponents.activityDescription
				|| this.visibleComponents.householdsTargeted
				|| this.visibleComponents.individualsTargeted
			) {
				if (!this.$refs.activityDetails.isFormValid()) return;
			}

			if (this.visibleComponents.selectionCriteria) {
				if (!this.$refs.selectionCriteria.isSelectionCriteriaDataAvailable()) {
					Notification(`${this.$t("Assistance cannot be created with no criteria.")}`, "warning");
					return;
				}
			}

			if (this.visibleComponents.distributedCommodity) {
				if (!this.$refs.distributedCommodity.isCommodityDataAvailable()) {
					Notification(`${this.$t("Assistance cannot be created with no commodity.")}`, "warning");
					return;
				}
			}

			if (!this.isRemoteAndValid()) return;

			await this.fetchNewAssistance();
		},

		isRemoteAndValid() {
			const { remoteDistributionAllowed, target } = this.assistanceBody;

			if (!remoteDistributionAllowed) return true;
			if (this.validateHasValidSmartCardCriterion(target)) return true;

			this.isUnValidCardModalOpen = true;

			return false;
		},

		async mapAssistance(assistance) {
			const {
				eloNumber,
				activity,
				budgetLine,
				round,
				dateDistribution,
				name,
				adm1,
				adm2,
				adm3,
				adm4,
				type,
				sector,
				subsector,
				target,
				note,
				commodities,
			} = assistance;

			this.componentsData.dataBeforeDuplicated = {
				dateDistribution,
				round,
			};

			this.componentsData.newAssistanceForm = {
				name,
				adm1: null,
				adm2: null,
				adm3: null,
				adm4: null,
				adm1Id: adm1?.id,
				adm2Id: adm2?.id,
				adm3Id: adm3?.id,
				adm4Id: adm4?.id,
				dateOfAssistance: new Date(dateDistribution),
				assistanceType: type,
				sector,
				subsector,
				targetType: target,
				note,
				round: this.prepareAssistanceRound(round),
				eloNumber,
				activity,
				budgetLine,
			};

			this.validateSomeBasicPropertiesInputs(assistance);
			this.prepareScoring(assistance);

			const preparedCommodities = await this.prepareCommodities(assistance, commodities);

			if (this.validationMessages.modalityType?.length) {
				this.componentsData.distributedCommodity = null;
			} else {
				this.componentsData.distributedCommodity = preparedCommodities;
			}

			this.componentsData.activityDetails = {
				activityDescription: assistance.description || "",
				householdsTargeted: assistance.householdsTargeted || 0,
				individualsTargeted: assistance.individualsTargeted || 0,
			};

			this.targetType = target;

			this.assistanceBody = {
				...this.assistanceBody,
				locationId: assistance.location?.locationId,
				target,
				sector,
				subsector,
				note,
				round: this.componentsData.newAssistanceForm.round?.code || null,
			};

			this.componentsData.selectionCriteria = this.mapSelectionCriteria();
		},

		mapSelectionCriteria() {
			const preparedSelectionCriteria = [];

			this.assistanceSelectionCriteria.forEach((item) => {
				const {
					target,
					field,
					condition,
					value,
					weight,
					group,
				} = item;
				const selectionCriteria = {
					criteriaTarget: { value: target, code: target },
					target,
					criteria: { code: field, value: this.prepareCriteriaName(field) },
					condition: { code: condition },
					value,
					scoreWeight: weight,
				};

				if (!preparedSelectionCriteria[group]) {
					preparedSelectionCriteria[group] = {};
					preparedSelectionCriteria[group].data = [];
					preparedSelectionCriteria[group].tableData = [];
				}

				preparedSelectionCriteria[group].data.push(selectionCriteria);
			});

			return preparedSelectionCriteria;
		},

		prepareCriteriaName(field) {
			return field === ASSISTANCE.CRITERIA.HAS_VALID_SMART_CARD
				? "Has valid card"
				: field;
		},

		onTargetSelected(targetType) {
			this.targetType = targetType?.code;

			if (this.$refs.selectionCriteria) {
				this.$refs.selectionCriteria.clearComponent();
			}

			if (this.$refs.distributedCommodity) {
				this.$refs.distributedCommodity.clearComponent();
			}

			this.calculatedBeneficiaries = {};
			this.calculatedCommodityValue = {};
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

		async fetchCustomFields() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await CustomFieldsService.getListOfCustomFields({});

				checkResponseStatus(status, message);

				this.customFields = data;
			} catch (e) {
				Notification(`${this.$t("Custom Fields")} ${e.message || e}`, "error");
			}
		},

		async onFetchNewAssistanceForm(data) {
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

			this.isAssistanceCreateButtonDisabled = !isDateOfAssistanceValid;

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
			}
		},

		onFetchSelectionCriteria(
			selectionCriteria,
			minimumSelectionScore,
			vulnerabilityScoreTouched,
			scoringType,
		) {
			this.isAssistanceCreateButtonDisabled = vulnerabilityScoreTouched;

			this.assistanceBody = {
				...this.assistanceBody,
				selectionCriteria,
				scoringBlueprintId: scoringType?.id || null,
				threshold: minimumSelectionScore,
			};
		},

		async onFetchDistributedCommodity(commodities) {
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
				cashbackLimit: commodities[0]?.allowedProductCategoryTypes?.includes(
					ASSISTANCE.COMMODITY.CASHBACK,
				)
					? Number(commodities[0]?.cashbackLimit)
					: 0,
			};

			if ((this.isCalculatedDataFetched && this.isAssistanceDuplicated)
				|| !this.isAssistanceDuplicated) {
				await this.fetchCommoditiesValue();
			}
		},

		remoteAllowed(commodity) {
			if (commodity?.modalityType === ASSISTANCE.COMMODITY.SMARTCARD) {
				return !!commodity?.remoteDistributionAllowed;
			}

			return null;
		},

		checkDataInAssistanceBody(data) {
			return ((data.insitutions?.length && data.commodities?.length)
				|| (data.commodities?.length && data.selectionCriteria?.length)
				|| (data.selectionCriteria?.length && data.description?.length));
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

		validateHasValidSmartCardCriterion(target) {
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

			return allCriteriaHasValidCard;
		},

		validateSomeBasicPropertiesInputs(assistance) {
			if (this.project.targets.length) {
				const { activity, budgetLine } = assistance;
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
					this.validationMessages.activity = `${this.$t("Activity was removed because: {activity} is not included in project targets. Allowed activities:", { activity })}
						${selectableActivities.join(", ")}`;
				}

				if (budgetLine && !this.componentsData.newAssistanceForm.budgetLine) {
					this.validationMessages.budgetLine = `${this.$t("Budget line was removed because: {budgetLine} is not included in project targets. Allowed budget lines:", { budgetLine })}
						${selectableBudgetLines.join(", ")}`;
				}

				if (!matchedModalityType && isAllTargetsWithModality) {
					this.validationMessages.modalityType = `${this.$t("Modality was removed because: modality type {modalityType} is not included in project targets. Allowed modality types:", { modalityType: assistance.commodities[0]?.modalityType })}
						${selectableModalityTypes.join(", ")}`;
				}
			}
		},

		prepareScoring(assistance) {
			const { scoringBlueprint, threshold } = assistance;
			const scoringType = scoringBlueprint === null
				? AssistancesService.getDefaultScoringType()
				: this.scoringTypes.filter(({ enabled }) => enabled)
					.find(({ id }) => id === scoringBlueprint?.id);

			if (scoringBlueprint && !scoringType) {
				Notification(
					`${this.$t("Scoring type isn't available from duplicated assistance.")} ${this.$t("Select new one.")}`,
					"warning",
				);
			}

			if (scoringBlueprint && scoringType) {
				this.componentsData.scoring = {
					scoringType: {
						...scoringType,
						identifier: `${scoringType.name} (ID: ${scoringType.id})`,
					},
					minimumSelectionScore: threshold,
				};
			} else {
				this.componentsData.scoring = {
					scoringType: AssistancesService.getDefaultScoringType(),
					minimumSelectionScore: null,
				};
			}
		},

		async prepareCommodities(assistance, commodities) {
			const preparedCommodities = [];
			const {
				description,
				remoteDistributionAllowed,
				allowedProductCategoryTypes,
				cashbackLimit,
			} = assistance;

			await this.fetchCustomFields();

			commodities.forEach((item, index) => {
				const commodity = item?.division?.customField?.key;
				const isCommodityFound = this.customFields.find((field) => field.key === commodity);

				if (commodity && !isCommodityFound) {
					Notification(
						`${this.$t("Custom field {commodity} has been removed, Commodity must be added again.", { commodity })}`,
						"warning",
					);
					commodities.splice(index, 1);
				}
			});

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
					description,
					dateExpiration: assistance.dateExpiration
						? this.$moment(assistance.dateExpiration).format("YYYY-MM-DD") : null,
					division: item.division,
					modality,
					remoteDistributionAllowed,
					allowedProductCategoryTypes,
					cashbackLimit,
				});
			});

			return preparedCommodities;
		},

		prepareAssistanceRound(round) {
			if (!round) return null;

			return round < 99
				? { code: round + 1, value: round + 1 }
				: { code: round, value: round };
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

		async onFetchTargetType(data) {
			const { institutions } = data;

			this.assistanceBody = {
				...this.assistanceBody,
				institutions,
			};

			await this.fetchCommoditiesValue();
		},

		getModalityByType(code) {
			switch (code) {
				case ASSISTANCE.COMMODITY.CASH:
				case ASSISTANCE.COMMODITY.SMARTCARD:
				case ASSISTANCE.COMMODITY.MOBILE_MONEY:
					return ASSISTANCE.MODALITY.CASH;
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
					return ASSISTANCE.MODALITY.IN_KIND;
				case ASSISTANCE.COMMODITY.LOAN:
				case ASSISTANCE.COMMODITY.BUSINESS_GRANT:
					return ASSISTANCE.MODALITY.OTHER;
				case ASSISTANCE.COMMODITY.QR_CODE_VOUCHER:
				case ASSISTANCE.COMMODITY.PAPER_VOUCHER:
					return ASSISTANCE.MODALITY.OTHER;
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
	align-items: center;

	.title {
		margin-bottom: 1.5rem;
	}

	.integrity-issues {
		display: flex;
		align-items: center;
		font-weight: bold;
		margin: 0 auto;
	}
}

.new-assistance-title {
	@media (max-width: 940px) {
		flex-direction: column;
		align-items: start;

		> .integrity-issues {
			margin: .75rem .5rem;
		}
	}

	@media (max-width: 600px) {
		> .integrity-issues {
			flex-direction: column;
			margin: .75rem 0;

			> i, span {
				padding: 0 !important;
			}
		}
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
