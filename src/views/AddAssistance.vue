<template>
	<div>
		<div class="columns">
			<div class="column">
				<NewAssistanceForm
					ref="newAssistanceForm"
					@updatedData="fetchNewAssistanceForm"
					@onTargetSelect="targetSelected"
					@showComponent="onShowComponent"
				/>
			</div>

			<div class="column is-three-fifths">
				<SelectionCriteria
					ref="selectionCriteria"
					v-if="visibleComponents.selectionCriteria"
					:target-type="targetType"
					:assistance-body="assistanceBody"
					@updatedData="fetchSelectionCriteria"
					@beneficiariesCounted="selectedBeneficiariesCount = $event"
				/>
				<DistributedCommodity
					ref="distributedCommodity"
					v-if="visibleComponents.distributedCommodity"
					:selected-beneficiaries="selectedBeneficiariesCount"
					@updatedData="fetchDistributedCommodity"
				/>
				<ActivityDetails
					ref="activityDetails"
					v-if="visibleComponents.activityDescription
						|| visibleComponents.householdsTargeted
						|| visibleComponents.individualsTargeted"
					:visible="visibleActivityDetails"
					@updatedData="fetchActivityDetails"
				/>
				<TargetTypeSelect
					ref="targetTypeSelect"
					v-if="visibleComponents.communities || visibleComponents.institutions"
					:visible="targetTypeSelectVisible"
					@updatedData="fetchTargetType"
				/>
			</div>
		</div>

		<div class="buttons flex-end">
			<b-button @click="goBack">{{ $t('Cancel') }}</b-button>
			<b-button type="is-primary" :loading="loading" @click="submitAddingAssistance">
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
				description: "",
				householdsTargeted: null,
				individualsTargeted: null,
				projectId: Number(this.$route.params.projectId),
				target: "",
				type: "",
				sector: "",
				subsector: "",
				locationId: null,
				commodities: [],
				selectionCriteria: [],
				communities: [],
				institutions: [],
				threshold: 0,
				completed: false,
				validated: false,
				iso3: this.$store.state.country?.iso3,
			},
			selectedBeneficiariesCount: 0,
			loading: false,
			duplicate: false,
			duplicateAssistance: null,
			assistanceSelectionCriteria: [],
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
	},

	async mounted() {
		this.duplicate = !!this.$route.query.duplicateAssistance;
		if (this.duplicate) {
			await AssistancesService.getSelectionCriteria(this.$route.query.duplicateAssistance)
				.then(({ data }) => {
					this.assistanceSelectionCriteria = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Assistance Selection Criteria")} ${e}`, "is-danger");
				});
			await AssistancesService.getDetailOfAssistance(this.$route.query.duplicateAssistance)
				.then((data) => {
					this.duplicateAssistance = data;
					this.mapAssistance(data);
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Duplicate Assistance")} ${e}`, "is-danger");
					this.$router.push({ name: "NotFound" });
				});
		}
	},

	methods: {
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

			this.loading = true;
			await AssistancesService.createAssistance(this.assistanceBody).then(({ status }) => {
				if (status === 200) {
					Toast(this.$t("Assistance Successfully Created"), "is-success");
					this.$router.push({
						name: "Project",
						params: { projectId: this.$route.params.projectId },
					});
				}
			}).catch((e) => {
				Toast(`${this.$t("New Assistance")} ${e}`, "is-danger");
			});
			this.loading = false;
		},

		async mapAssistance(assistance) {
			this.$refs.newAssistanceForm.formModel = {
				adm1Id: assistance.adm1Id,
				adm2Id: assistance.adm2Id,
				adm3Id: assistance.adm3Id,
				adm4Id: assistance.adm4Id,
				dateOfAssistance: new Date(assistance.dateDistribution),
				assistanceType: assistance.type,
				sector: assistance.sector,
				subsector: assistance.subsector,
				targetType: assistance.target,
			};
			this.targetType = assistance.target;
			this.assistanceBody.locationId = assistance.locationId;
			const commodities = await this.fetchAssistanceCommodities();
			const preparedCommodities = [];
			commodities.forEach((item) => {
				const modality = this.getModalityByType(item.modalityType);
				preparedCommodities.push({
					type: item.modalityType,
					quantity: item.value,
					unit: item.unit,
					description: item.description,
					modality,
				});
			});
			if (this.$refs.distributedCommodity) {
				this.$refs.distributedCommodity.table.data.push(...preparedCommodities);
			}
			if (this.$refs.activityDetails) {
				this.$refs.activityDetails.formModel = {
					activityDescription: assistance.description || "",
					householdsTargeted: assistance.householdsTargeted || 0,
					individualsTargeted: assistance.individualsTargeted || 0,
				};
			}
			if (this.$refs.selectionCriteria) {
				this.$refs.selectionCriteria.groups = this.mapSelectionCriteria();
				this.$refs.selectionCriteria.getCountOfBeneficiaries({ totalCount: false });
				this.$refs.selectionCriteria.getCountOfBeneficiaries({ totalCount: true });
				this.$refs.selectionCriteria.groups.forEach((item, key) => {
					this.$refs.selectionCriteria.getCountOfBeneficiariesInGroup(key);
				});
			}
		},

		mapSelectionCriteria() {
			const preparedSelectionCriteria = [];
			this.assistanceSelectionCriteria.forEach((item) => {
				if (preparedSelectionCriteria[item.group]) {
					preparedSelectionCriteria[item.group].data.push({
						criteriaTarget: { value: item.target },
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

		fetchAssistanceCommodities() {
			return AssistancesService.getAssistanceCommodities(this.$route.query.duplicateAssistance)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Commodities")} ${e}`, "is-danger");
				});
		},

		fetchNewAssistanceForm(data) {
			const {
				assistanceType,
				dateOfAssistance,
				sector,
				subsector,
				targetType,
			} = data;

			this.assistanceBody = {
				...this.assistanceBody,
				dateDistribution: dateOfAssistance.toISOString(),
				target: targetType?.code,
				type: assistanceType?.code,
				sector: sector?.code,
				subsector: subsector?.code,
				locationId: this.$refs.newAssistanceForm.getLocationId(),
			};
		},

		fetchSelectionCriteria(selectionCriteria, minimumSelectionScore) {
			this.assistanceBody = {
				...this.assistanceBody,
				selectionCriteria,
				threshold: minimumSelectionScore,
			};
		},

		fetchDistributedCommodity(commodities) {
			this.assistanceBody = {
				...this.assistanceBody,
				commodities,
			};
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
