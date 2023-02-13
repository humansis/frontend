<template>
	<div>
		<h1 class="title">{{ $t('New Assistance') }}</h1>
		<div class="columns">
			<div v-if="isProjectReady" class="column">
				<NewAssistanceForm
					ref="newAssistanceForm"
					:project="project"
					:new-assistance-form="componentsData.newAssistanceForm"
					:data-before-duplicated="componentsData.dataBeforeDuplicated"
					:date-expiration="assistanceBody.dateExpiration"
					@updatedData="fetchNewAssistanceForm"
					@onTargetSelect="targetSelected"
					@showComponent="onShowComponent"
				/>
			</div>

			<div class="column is-three-fifths">
				<SelectionCriteria
					ref="selectionCriteria"
					v-show="visibleComponents.selectionCriteria"
					:target-type="targetType"
					:data="componentsData.selectionCriteria"
					:assistance-body="assistanceBody"
					@updatedData="fetchSelectionCriteria"
					@beneficiariesCounted="selectedBeneficiariesCount = $event"
					@onDeliveredCommodityValue="getDeliveredCommodityValue"
				/>
				<DistributedCommodity
					v-if="isProjectReady"
					ref="distributedCommodity"
					v-show="visibleComponents.distributedCommodity"
					:project="project"
					:commodity="componentsData.distributedCommodity"
					:selected-beneficiaries="selectedBeneficiariesCount"
					:calculated-commodity-value="calculatedCommodityValue"
					:is-assistance-duplicated="isDuplicated"
					:target-type="targetType"
					:date-of-assistance="assistanceBody.dateDistribution"
					@updatedData="fetchDistributedCommodity"
					@onDeliveredCommodityValue="getDeliveredCommodityValue"
				/>
				<ActivityDetails
					ref="activityDetails"
					v-show="visibleComponents.activityDescription
						|| visibleComponents.householdsTargeted
						|| visibleComponents.individualsTargeted"
					:visible="visibleActivityDetails"
					:data="componentsData.activityDetails"
					@updatedData="fetchActivityDetails"
				/>
				<TargetTypeSelect
					ref="targetTypeSelect"
					v-show="visibleComponents.communities || visibleComponents.institutions"
					:visible="targetTypeSelectVisible"
					@updatedData="fetchTargetType"
				/>
			</div>
		</div>

		<div class="buttons flex-end">
			<b-button @click="goBack">{{ $t('Cancel') }}</b-button>
			<b-button
				type="is-primary"
				:loading="loading"
				:disabled="createAssistanceButtonDisabled || isMoreDistributedCommodity"
				@click="validateNewAssistance"
			>
				{{ $t('Create') }}
			</b-button>
		</div>
	</div>
</template>

<script>
import SelectionCriteria from "@/components/AddAssistance/SelectionTypes/SelectionCriteria/SelectionCriteria";
import DistributedCommodity from "@/components/AddAssistance/SelectionTypes/DistributedCommodity/DistributedCommodity";
import NewAssistanceForm from "@/components/AddAssistance/NewAssistanceForm";
import AssistancesService from "@/services/AssistancesService";
import { Notification, Toast } from "@/utils/UI";
import ActivityDetails from "@/components/AddAssistance/SelectionTypes/ActivityDetails";
import TargetTypeSelect from "@/components/AddAssistance/SelectionTypes/TargetTypeSelect";
import consts from "@/utils/assistanceConst";
import ProjectService from "@/services/ProjectService";

export default {
	name: "AddAssistance",

	components: {
		TargetTypeSelect,
		ActivityDetails,
		NewAssistanceForm,
		SelectionCriteria,
		DistributedCommodity,
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
			scoringTypes: [],
			selectedBeneficiariesCount: 0,
			loading: false,
			isDuplicated: false,
			duplicateAssistance: null,
			assistanceSelectionCriteria: [],
			calculatedCommodityValue: [],
			createAssistanceButtonDisabled: false,
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

		isMoreDistributedCommodity() {
			return this.assistanceBody.commodities.length > 1;
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
					if (e.message) Notification(`${this.$t("Assistance Selection Criteria")} ${e}`, "is-danger");
				});

			await AssistancesService.getDetailOfAssistance(this.$route.query.duplicateAssistance)
				.then(async (data) => {
					this.duplicateAssistance = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Duplicate Assistance")} ${e}`, "is-danger");
				});

			await AssistancesService.getScoringTypes()
				.then(({ data }) => { this.scoringTypes = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Scoring Types")} ${e}`, "is-danger");
				}).finally(() => {
					this.scoringTypesLoading = false;
				});

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
						if (e.message) Notification(`${this.$t("Project")} ${e}`, "is-danger");
					});
			}
		},

		async getDeliveredCommodityValue(updatedCommodities = null) {
			await this.fetchDistributedCommodity(updatedCommodities || this.assistanceBody.commodities);
			const result = await AssistancesService.calculationCommodities(this.assistanceBody);

			if (result.status !== 200) return;

			this.calculatedCommodityValue = result.data.data;
		},

		validateNewAssistance() {
			if (this.$refs.newAssistanceForm.submit()) {
				const dateDistribution = this.$moment(this.assistanceBody.dateDistribution).format("YYYY-MM-DD");
				const today = this.$moment().format("YYYY-MM-DD");
				const isBeforeToday = this.$moment(dateDistribution).isBefore(today);

				if (isBeforeToday) {
					this.$buefy.dialog.confirm({
						title: this.$t("Date of Assistance"),
						message: this.$t("You picked date from the past. Is it ok?"),
						confirmText: this.$t("Yes and Continue"),
						cancelText: this.$t("Cancel"),
						type: "is-warning",
						hasIcon: true,
						onConfirm: () => {
							this.submitAddingAssistance();
						},
					});
				} else {
					this.submitAddingAssistance();
				}
			}
		},

		async submitAddingAssistance() {
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

			if (this.visibleComponents.distributedCommodity) {
				if (!this.$refs.distributedCommodity.submit()) return;
			}

			if (this.visibleComponents.selectionCriteria) {
				if (!this.$refs.selectionCriteria.submit()) return;
			}

			if (!this.isRemoteAndValid()) return;

			this.loading = true;

			await AssistancesService.createAssistance(this.assistanceBody)
				.then(({ status, data: { id }, message }) => {
					const success = status === 200;
					const badRequest = status === 400;

					if (success) {
						Toast(this.$t("Assistance Successfully Created"), "is-success");
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
						Notification(message || "Error code 400", "is-warning");
					}
				}).catch((e) => {
					Toast(`${this.$t("New Assistance")} ${e}`, "is-danger");
				});

			this.loading = false;
		},

		isRemoteAndValid() {
			const { remoteDistributionAllowed } = this.assistanceBody;

			if (remoteDistributionAllowed) {
				const allCriteriaHasValidCard = this.$refs.selectionCriteria.groups
					.every(({ data }) => data.some(({ criteria, value }) => criteria.code === "hasValidSmartcard"
						&& (value.code || value === true)));

				if (allCriteriaHasValidCard) {
					return true;
				}

				this.$buefy.dialog.alert({
					title: this.$t("Warning"),
					message: this.$t(`Please add "Has valid card = true" criterion for each group`),
					type: "is-warning",
					hasIcon: true,
				});

				return false;
			}

			return true;
		},

		async mapAssistance(assistance) {
			let round;

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
			};

			const scoringType = assistance.scoringBlueprint === null
				? AssistancesService.getDefaultScoringType()
				: this.scoringTypes.filter(({ archived }) => !archived)
					.find(({ id }) => id === assistance.scoringBlueprint?.id);

			if (assistance.scoringBlueprint && !scoringType) {
				Notification(`${this.$t("Scoring type isn't available from duplicated assistance.")} ${this.$t("Select new one.")}`, "is-warning");
			}

			this.$refs.selectionCriteria.scoringType = scoringType || null;
			this.$refs.selectionCriteria.minimumSelectionScore = assistance.threshold;

			const commodities = await this.fetchAssistanceCommodities();
			const preparedCommodities = [];
			commodities.forEach((item) => {
				const modality = this.getModalityByType(item.modalityType);

				preparedCommodities.push({
					modalityType: item.modalityType,
					value: item.value,
					unit: item.unit,
					description: item.description,
					dateExpiration: assistance.dateExpiration
						? new Date(assistance.dateExpiration) : null,
					division: item.division,
					modality,
					remoteDistributionAllowed: assistance.remoteDistributionAllowed,
					allowedProductCategoryTypes: assistance.allowedProductCategoryTypes,
					cashbackLimit: assistance.cashbackLimit,
				});
			});

			this.componentsData.distributedCommodity = preparedCommodities;

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

			await this.getDeliveredCommodityValue(preparedCommodities);
			await this.$refs.selectionCriteria.fetchCriteriaInfo({ changeScoreInterval: true });
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

		targetSelected(targetType) {
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

		goBack() {
			this.$router.push({ name: "Project",
				params: { projectId: this.$route.params.projectId },
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
					if (e.message) Notification(`${this.$t("Commodities")} ${e}`, "is-danger");
				});
		},

		fetchNewAssistanceForm(data) {
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
			};
		},

		fetchSelectionCriteria(
			selectionCriteria, minimumSelectionScore, vulnerabilityScoreTouched, scoringType,
		) {
			this.createAssistanceButtonDisabled = vulnerabilityScoreTouched;

			this.assistanceBody = {
				...this.assistanceBody,
				selectionCriteria,
				scoringBlueprintId: scoringType?.id || null,
				threshold: minimumSelectionScore,
			};
		},

		fetchDistributedCommodity(commodities) {
			const date = this.isDateValid(commodities?.[0]?.dateExpiration)
				? commodities[0].dateExpiration
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

			if (commodity?.modalityType === consts.COMMODITY.SMARTCARD) {
				result = !!commodity?.remoteDistributionAllowed;
			} else {
				result = null;
			}

			return result;
		},

		fetchActivityDetails(data) {
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
					"is-warning",
				);
			}

			return validCriteria;
		},

		fetchTargetType(data) {
			const { communities, institutions } = data;

			this.assistanceBody = {
				...this.assistanceBody,
				communities,
				institutions,
			};
		},

		getModalityByType(code) {
			switch (code) {
				case consts.COMMODITY.CASH:
				case consts.COMMODITY.SMARTCARD:
				case consts.COMMODITY.MOBILE_MONEY:
					return "Cash";
				case consts.COMMODITY.FOOD_RATIONS:
				case consts.COMMODITY.READY_TO_EAT_RATIONS:
				case consts.COMMODITY.BREAD:
				case consts.COMMODITY.AGRICULTURAL_KIT:
				case consts.COMMODITY.WASH_KIT:
				case consts.COMMODITY.SHELTER_TOOL_KIT:
				case consts.COMMODITY.HYGIENE_KIT:
				case consts.COMMODITY.DIGNITY_KIT:
				case consts.COMMODITY.NFI_KIT:
				case consts.COMMODITY.WINTERIZATION_KIT:
					return "In Kind";
				case consts.COMMODITY.LOAN:
				case consts.COMMODITY.BUSINESS_GRANT:
					return "Other";
				case consts.COMMODITY.QR_CODE_VOUCHER:
				case consts.COMMODITY.PAPER_VOUCHER:
					return "Other";
				default:
					return "";
			}
		},
	},
};
</script>
