<template>
	<v-container fluid>
		<v-card class="mx-auto mt-5">
			<v-card-title
				:data-cy="identifierBuilder(`${pageTitle}-text`)"
				class="text-h5 font-weight-bold"
			>
				{{ $t(pageTitle) }}
			</v-card-title>

			<v-card-text>
				<v-row class="mt-1">
					<v-col>
						<DataInput
							v-model="formModel.name"
							:disabled="formDisabled"
							:error-messages="validationMsg('name')"
							:data-cy="prepareComponentIdentifier()"
							label="Project name"
							name="project-name"
							class="mb-4"
							@blur="onValidate('name')"
						/>

						<DataInput
							v-model="formModel.internalId"
							:disabled="formDisabled"
							:data-cy="prepareComponentIdentifier()"
							label="Internal ID"
							name="internal-id"
							class="mb-4"
							optional
						/>

						<DataSelect
							v-model="formModel.selectedSectors"
							:items="options.sectors"
							:disabled="formDisabled"
							:clearable="!formDisabled"
							:error-messages="validationMsg('selectedSectors')"
							:data-cy="prepareComponentIdentifier()"
							label="Sectors"
							name="sectors"
							multiple
							class="mb-4"
							@blur="onValidate('selectedSectors')"
							@update:modelValue="onSelectorsSelect"
						/>

						<DataSelect
							v-model="formModel.selectedSubSectors"
							:items="options.subSectors"
							:hint="missingSubSectors"
							:disabled="formDisabled"
							:data-cy="prepareComponentIdentifier()"
							label="Subsectors"
							name="sub-sectors"
							class="has-warning-message mb-4"
							persistent-hint
							multiple
							optional
							@update:modelValue="onSubSectorSelect"
						/>

						<DatePicker
							v-model="formModel.startDate"
							:error-messages="validationMsg('startDate')"
							:disabled="formDisabled"
							:data-cy="prepareComponentIdentifier()"
							label="Start Date"
							name="start-date"
							class="mb-4"
							@blur="onValidate('startDate')"
						/>

						<DatePicker
							v-model="formModel.endDate"
							:error-messages="validationMsg('endDate')"
							:disabled="formDisabled"
							:data-cy="prepareComponentIdentifier()"
							label="End Date"
							name="end-date"
							class="mb-4"
							@blur="onValidate('endDate')"
						/>

						<DataSelect
							v-model="formModel.selectedDonors"
							:items="options.donors"
							:data-cy="prepareComponentIdentifier()"
							label="Donors"
							name="donors"
							item-title="fullname"
							item-value="id"
							class="mb-4"
							optional
							multiple
							:disabled="formDisabled"
						/>
					</v-col>

					<v-col>
						<DataInput
							v-model="formModel.projectInvoiceAddressLocal"
							:disabled="formDisabled"
							:data-cy="prepareComponentIdentifier()"
							label="Local Invoice Address"
							name="local-invoice-address"
							class="mb-4"
							optional
						/>

						<DataInput
							v-model="formModel.projectInvoiceAddressEnglish"
							:disabled="formDisabled"
							:data-cy="prepareComponentIdentifier()"
							label="English Invoice Address"
							name="english-invoice-address"
							class="mb-4"
							optional
						/>

						<h4>{{ $t('Allowed Product Category Types') }}</h4>

						<div
							v-for="(productCategoryType, index) of options.allowedProductCategoryTypes"
							:key="`product-category-type-${productCategoryType}`"
							:class="['category-types', { 'last-type': index === (options.allowedProductCategoryTypes.length - 1) }] "
						>
							<v-checkbox
								v-model="formModel.allowedProductCategoryTypes"
								:label="productCategoryType"
								:value="productCategoryType"
								:error-messages="errorMessageForCategory(index)"
								:disabled="formDisabled"
								:name="`product-category-${index}`"
								:data-cy="identifierBuilder(`${productCategoryType}-checkbox`)"
								hide-details="auto"
								@blur="onValidate('allowedProductCategoryTypes')"
							>
								<template v-slot:label>
									{{ $t(productCategoryType) }}

									<SvgIcon
										:items="getCodeAndValueObject(productCategoryType)"
										class="ml-2"
									/>
								</template>
							</v-checkbox>
						</div>

						<DataTextarea
							v-model="formModel.notes"
							:disabled="formDisabled"
							:data-cy="prepareComponentIdentifier()"
							label="Notes"
							name="notes"
							class="mt-4"
							is-optional
							auto-grow
						/>
					</v-col>
				</v-row>

				<h4 class="mb-1">Target
					<span class="font-weight-light font-italic">- Optional</span>
				</h4>

				<EditableTable
					:columns="editableTableColumns"
					:is-modal-openable="isProjectWithSectors"
					:table-action="projectAction"
					:table-data="formModel.targets"
					:is-user-allowed-use-table-action="userCan.projectTargets"
					content-name="Target"
					new-row-button-name="Add new target"
					no-openable-modal-message="Please add some Sector for using Target"
					@tableChanged="onTableChanged"
					@modalInputChanged="onNewTargetModalChanged"
					@rowRemoved="onValidateTarget"
					@editModalOpened="onEditModalOpened"
					@modalOpened="onTargetModalOpened"
				/>

				<p
					v-for="message in targetTableValidateMessages"
					:key="message"
					class="text-caption text-red"
				>
					{{ message }}
				</p>
			</v-card-text>
		</v-card>

		<v-row class="mt-5">
			<v-col class="d-flex justify-end">
				<v-btn
					:to="{ name: 'Projects' }"
					:data-cy="identifierBuilder('cancel-button')"
					color="blue-grey-lighten-4"
					variant="elevated"
					class="text-none"
				>
					{{ $t('Cancel') }}
				</v-btn>

				<v-btn
					v-if="!projectAction.isDetail"
					:disabled="!isTargetTableValid"
					:data-cy="identifierBuilder(`${buttonName}-button`)"
					color="primary"
					class="text-none ml-3"
					@click="onValidateNewProject"
				>
					{{ buttonName }}
				</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import { mapState } from "vuex";
import { required } from "@vuelidate/validators";
import AssistancesService from "@/services/AssistancesService";
import DonorService from "@/services/DonorService";
import ProjectService from "@/services/ProjectService";
import SectorsService from "@/services/SectorsService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DataTextarea from "@/components/Inputs/DataTextarea";
import DatePicker from "@/components/Inputs/DatePicker";
import EditableTable from "@/components/Inputs/EditableTable";
import SvgIcon from "@/components/SvgIcon";
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";
import validation from "@/mixins/validation";
import { getArrayOfCodeListByKey, getArrayOfIdsByParam, getCodeAndValueObject } from "@/utils/codeList";
import { normalizeSelectorValue, normalizeText } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { GENERAL } from "@/consts";

const minDate = (endDate, formModel) => new Date(endDate) > new Date(formModel.startDate);
const todayDate = new Date();
const OPTIONS_FOR_COLUMN_INDEX = {
	SECTOR: 0,
	SUB_SECTOR: 1,
	MODALITY_TYPE: 2,
	FIRST_TARGET_TYPE: 8,
	SECOND_TARGET_TYPE: 10,
};
const LABEL_FOR_ADM_COLUMN = {
	ADM1: { code: "adm1", index: 4 },
	ADM2: { code: "adm2", index: 5 },
	ADM3: { code: "adm3", index: 6 },
	ADM4: { code: "adm4", index: 7 },
};

export default {
	name: "ProjectForm",

	components: {
		EditableTable,
		SvgIcon,
		DatePicker,
		DataTextarea,
		DataSelect,
		DataInput,
	},

	mixins: [validation, permissions, identifierBuilder],

	validations() {
		return {
			formModel: {
				name: { required },
				selectedSectors: { required },
				startDate: { required },
				endDate: {
					required,
					minValue: minDate,
				},
				allowedProductCategoryTypes: { required },
			},
		};
	},

	data() {
		return {
			projectAction: {
				isCreate: false,
				isEdit: false,
				isDetail: false,
			},
			pageTitle: "",
			formDisabled: false,
			sectorsLoading: false,
			subSectorsLoading: false,
			donorsLoading: false,
			isProjectDataLoading: false,
			sectorsWithoutSelectedSubSectors: [],
			isTargetTableValid: true,
			targetTableValidateMessages: [],
			filteredSubSectorsForTargets: [],
			dataCy: "form",
			formModel: {
				id: null,
				iso3: "",
				name: "",
				internalId: "",
				sectors: [],
				subSectors: [],
				selectedSectors: [],
				selectedSubSectors: [],
				startDate: new Date(),
				endDate: new Date(todayDate.setMonth(todayDate.getMonth() + 3)),
				targets: [],
				selectedDonors: [],
				projectInvoiceAddressLocal: "",
				projectInvoiceAddressEnglish: "",
				allowedProductCategoryTypes: [],
				notes: "",
			},
			options: {
				sectors: [],
				subSectors: [],
				donors: [],
				targetTypes: [],
				allowedProductCategoryTypes: ["Food", "Non-Food", "Cashback"],
			},
			editableTableColumns: [
				{
					key: "sector",
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.SINGLE_SELECT,
					options: [],
					propertyName: "value",
					clearValueAfterChange: "subSector",
					validations: {
						required: true,
					},
				},
				{
					key: "subSector",
					label: "Subsector",
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.SINGLE_SELECT,
					options: [],
					isDataLoading: this.sectorsLoading,
					propertyName: "value",
				},
				{
					key: "modalityType",
					label: "Modality type",
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.SINGLE_SELECT,
					options: [],
					isDataLoading: this.sectorsLoading,
					propertyName: "value",
				},
				{
					key: "activity",
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.TEXT_INPUT,
					options: [],
					isDataLoading: this.sectorsLoading,
					propertyName: "value",
				},
				{
					key: GENERAL.EDITABLE_TABLE.ADM_TYPE.ADM1,
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.LOCATION,
					propertyName: "name",
				},
				{
					key: GENERAL.EDITABLE_TABLE.ADM_TYPE.ADM2,
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.LOCATION,
					propertyName: "name",
				},
				{
					key: GENERAL.EDITABLE_TABLE.ADM_TYPE.ADM3,
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.LOCATION,
					propertyName: "name",
				},
				{
					key: GENERAL.EDITABLE_TABLE.ADM_TYPE.ADM4,
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.LOCATION,
					propertyName: "name",
				},
				{
					key: "firstTargetType",
					label: "Target type",
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.SINGLE_SELECT,
					options: [],
					isDataLoading: this.sectorsLoading,
					propertyName: "value",
					validations: {
						required: true,
					},
				},
				{
					key: "firstTarget",
					label: "Target (unique BNFs)",
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.NUMBER_INPUT,
					isDataLoading: this.sectorsLoading,
					validations: {
						required: true,
						minValue: 1,
						maxValue: 100000000000,
					},
				},
				{
					key: "secondTargetType",
					label: "Target type 2 (recalculation)",
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.SINGLE_SELECT,
					options: [],
					isDataLoading: this.sectorsLoading,
					propertyName: "value",
					validations: {
						requiredIf: "secondTarget",
					},
				},
				{
					key: "secondTarget",
					label: "Target 2 (recalculation)",
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.NUMBER_INPUT,
					isDataLoading: this.sectorsLoading,
					validations: {
						minValue: 1,
						maxValue: 100000000000,
						requiredIf: "secondTargetType",
					},
				},
				{
					key: "budgetLine",
					label: "Budget line",
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.TEXT_INPUT,
				},
				{
					key: "note",
					label: "Note",
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.TEXT_AREA,
				},
			],
		};
	},

	computed: {
		missingSubSectors() {
			return this.sectorsWithoutSelectedSubSectors.length
			&& this.formModel.selectedSubSectors.length
				? `${this.$t("Some sectors have NO selected sub-sector")}
						: ${this.sectorsWithoutSelectedSubSectors.join(", ")}`
				: "";
		},

		isProjectWithSectors() {
			return !!this.formModel.selectedSectors.length;
		},

		buttonName() {
			return this.$t(this.projectAction.isCreate ? "Create" : "Update");
		},

		...mapState(["country", "admNames"]),
	},

	async mounted() {
		this.isProjectDataLoading = true;
		this.getProjectAction();
		this.setAdmsLabel();

		await Promise.all([
			this.fetchSectors(),
			this.fetchSubSectors(),
			this.fetchDonors(),
			this.fetchTargets(),
		]);

		if (this.projectAction.isDetail || this.projectAction.isEdit) {
			await this.fetchProject();
		}

		if (this.projectAction.isEdit) {
			if (this.formModel.targets.length) {
				await this.fetchModalityTypes();
			}
			this.filterSubSectors();
			this.getSectorsWithoutSelectedSubSector();
		}

		this.addDataForEditableTable();
		this.isProjectDataLoading = false;
	},

	methods: {
		async fetchSectors() {
			try {
				this.sectorsLoading = true;
				const { data } = await SectorsService.getListOfSectors();

				this.options.sectors = data;
			} catch (e) {
				Notification(`${this.$t("Sectors")} ${e.message || e}`, "error");
			} finally {
				this.sectorsLoading = false;
			}
		},

		async fetchSubSectors() {
			try {
				this.subSectorsLoading = true;
				const { data: { data } } = await SectorsService.getFilteredListOfSubSectors();

				this.options.allSubSectors = data;
				this.filterSubSectors();
				this.getSectorsWithoutSelectedSubSector();
			} catch (e) {
				Notification(`${this.$t("SubSectors")} ${e.message || e}`, "error");
			} finally {
				this.subSectorsLoading = false;
			}
		},

		async fetchDonors() {
			try {
				this.donorsLoading = true;
				const { data } = await DonorService.getListOfDonors();

				this.options.donors = data;
			} catch (e) {
				Notification(`${this.$t("Donors")} ${e.message || e}`, "error");
			} finally {
				this.donorsLoading = false;
			}
		},

		async fetchTargets() {
			try {
				const { data } = await AssistancesService.getTargetTypes();

				this.options.targetTypes = data;
			} catch (e) {
				Notification(`${this.$t("Target Types")} ${e.message || e}`, "error");
			}
		},

		async fetchProject() {
			try {
				const { data } = await ProjectService.getDetailOfProject(this.$route.params.projectId);

				this.mapToFormModel(data);
			} catch (e) {
				Notification(`${this.$t("Project Detail")} ${e.message || e}`, "error");
			}
		},

		async createProject(projectBody) {
			try {
				const { status, message } = await ProjectService.createProject(projectBody);

				if (status === 200) {
					Notification(this.$t("Project Successfully Created"), "success");
					await this.$router.push({ name: "Projects" });
				} else {
					Notification(message, "error");
				}
			} catch (e) {
				Notification(`${this.$t("Project")} ${e.message || e}`, "error");
			}
		},

		async updateProject(id, projectBody) {
			try {
				const { status, message } = await ProjectService.updateProject(id, projectBody);

				checkResponseStatus(status, message);

				Notification(this.$t("Project Successfully Updated"), "success");
				this.$router.push({ name: "Projects" });
			} catch (e) {
				Notification(`${this.$t("Project:")} ${e.message || e}`, "error");
			}
		},

		async fetchModalityTypes() {
			try {
				const { data } = await AssistancesService.getListOfAllModalityTypes();

				this.editableTableColumns[OPTIONS_FOR_COLUMN_INDEX.MODALITY_TYPE].options = data;
			} catch (e) {
				Notification(`${this.$t("Modality Types")} ${e.message || e}`, "error");
			}
		},

		normalizeText(value) {
			return normalizeText(value);
		},

		normalizeSelectorValue(value) {
			return normalizeSelectorValue(value);
		},

		getCodeAndValueObject(value) {
			return getCodeAndValueObject(value);
		},

		onTableChanged(tableRow) {
			if (!tableRow.isCreate) {
				this.formModel.targets[tableRow.index] = tableRow.data;
			} else {
				this.formModel.targets.push(tableRow.data);
			}
			this.onValidateTarget();
		},

		errorMessageForCategory(index) {
			return index === (this.options.allowedProductCategoryTypes.length - 1)
				? this.validationMsg("allowedProductCategoryTypes")
				: "";
		},

		onValidateNewProject() {
			this.v$.formModel.$touch();

			if (this.v$.formModel.$invalid) {
				return;
			}

			this.submitProjectForm(this.formModel);
			this.v$.formModel.$reset();
		},

		submitProjectForm(projectForm) {
			const {
				id,
				iso3,
				name,
				internalId,
				selectedSectors,
				selectedSubSectors,
				startDate,
				endDate,
				selectedDonors,
				targets,
				projectInvoiceAddressLocal,
				projectInvoiceAddressEnglish,
				allowedProductCategoryTypes,
				notes,
			} = projectForm;

			const mappedTargets = targets.map((target) => ({
				sector: target.sector.code,
				subSector: target.subSector?.code,
				modalityType: target.modalityType?.code,
				activity: target.activity,
				locationId: target.locationId,
				firstTargetType: target.firstTargetType.code,
				firstTarget: target.firstTarget,
				secondTargetType: target.secondTargetType?.code,
				secondTarget: target.secondTarget,
				budgetLine: target.budgetLine,
				note: target.note,
			}));

			const projectBody = {
				iso3: iso3 || this.country.iso3,
				name,
				internalId,
				projectInvoiceAddressLocal,
				projectInvoiceAddressEnglish,
				allowedProductCategoryTypes,
				notes,
				numberOfHouseholds: 0,
				targets: mappedTargets,
				startDate: this.$moment(startDate).format("YYYY-MM-DD"),
				endDate: this.$moment(endDate).format("YYYY-MM-DD"),
				sectors: getArrayOfIdsByParam(selectedSectors, "code"),
				subSectors: getArrayOfIdsByParam(selectedSubSectors, "code"),
				donorIds: getArrayOfIdsByParam(selectedDonors, "id"),
			};

			if (this.projectAction.isEdit && id) {
				this.updateProject(id, projectBody);
			} else {
				this.createProject(projectBody);
			}
		},

		mapToFormModel(
			{
				id,
				iso3,
				internalId,
				name,
				sectors,
				subSectors,
				donors,
				notes,
				targets,
				projectInvoiceAddressLocal,
				projectInvoiceAddressEnglish,
				allowedProductCategoryTypes,
				startDate,
				endDate,
			},
		) {
			const mappedTargets = [];

			targets.forEach((target) => {
				const {
					sector,
					subSector,
					modalityType,
					activity,
					adm1,
					adm2,
					adm3,
					adm4,
					firstTargetType,
					secondTargetType,
					firstTarget,
					secondTarget,
					budgetLine,
					note,
				} = target;

				mappedTargets.push({
					sector: getArrayOfCodeListByKey([sector], this.options.sectors, "code"),
					subSector: getArrayOfCodeListByKey(
						[subSector],
						Object.values(this.options.allSubSectors).flat(),
						"code",
					),
					modalityType,
					activity,
					adm1,
					adm2,
					adm3,
					adm4,
					adm1Id: adm1?.id,
					adm2Id: adm2?.id,
					adm3Id: adm3?.id,
					adm4Id: adm4?.id,
					firstTargetType,
					secondTargetType,
					firstTarget,
					secondTarget,
					budgetLine,
					note,
				});
			});

			this.formModel = {
				...this.formModel,
				id,
				iso3,
				name,
				sectors,
				subSectors,
				internalId,
				startDate: new Date(startDate),
				endDate: new Date(endDate),
				targets: mappedTargets,
				selectedSectors: getArrayOfCodeListByKey(sectors, this.options.sectors, "code", true),
				selectedSubSectors: getArrayOfCodeListByKey(
					subSectors,
					Object.values(this.options.allSubSectors).flat(),
					"code",
					true,
				),
				selectedDonors: donors,
				projectInvoiceAddressLocal,
				projectInvoiceAddressEnglish,
				allowedProductCategoryTypes,
				notes,
			};
		},

		getProjectAction() {
			switch (this.$route.name) {
				case "ProjectDetail":
					this.projectAction = {
						isCreate: false,
						isEdit: false,
						isDetail: true,
					};
					this.pageTitle = this.$t("Detail of Project");
					this.formDisabled = true;
					break;
				case "ProjectEdit":
					this.projectAction = {
						isCreate: false,
						isEdit: true,
						isDetail: false,
					};
					this.pageTitle = this.$t("Project Edit");
					this.formDisabled = false;
					break;
				default:
					this.projectAction = {
						isCreate: true,
						isEdit: false,
						isDetail: false,
					};
					this.pageTitle = this.$t("Create New Project");
					this.formDisabled = false;
			}
		},

		onSelectorsSelect($event) {
			this.$nextTick(() => {
				this.formModel.selectedSectors = $event;
				this.onValidate("selectedSectors");
				this.filterSubSectors();
				this.getSectorsWithoutSelectedSubSector();

				this.editableTableColumns[OPTIONS_FOR_COLUMN_INDEX.SECTOR]
					.options = this.formModel.selectedSectors;
				this.formModel.selectedSubSectors = this.formModel.selectedSectors.length
					? this.formModel.selectedSubSectors.filter((selectedSubSector) => this.options.subSectors
						.find((subSector) => subSector.code === selectedSubSector.code))
					: [];
				this.onValidateTarget();

				if (!this.formModel.selectedSectors.length) {
					this.options.subSectors = [];
				}
			});
		},

		onSubSectorSelect($event) {
			this.formModel.selectedSubSectors = $event;
			this.getSectorsWithoutSelectedSubSector();
			this.onValidateTarget();
		},

		filterSubSectors() {
			this.options.subSectors = [];

			this.formModel.selectedSectors.forEach(({ code }) => {
				const subSector = this.options.allSubSectors[code];

				if (subSector) {
					this.options.subSectors.push(...subSector);
				}
			});
		},

		addDataForEditableTable() {
			this.editableTableColumns[OPTIONS_FOR_COLUMN_INDEX.FIRST_TARGET_TYPE]
				.options = this.options.targetTypes;
			this.editableTableColumns[OPTIONS_FOR_COLUMN_INDEX.SECOND_TARGET_TYPE]
				.options = this.options.targetTypes;

			if (this.projectAction.isEdit) {
				this.editableTableColumns[OPTIONS_FOR_COLUMN_INDEX.SECTOR]
					.options = this.formModel.selectedSectors;
				this.editableTableColumns[OPTIONS_FOR_COLUMN_INDEX.SUB_SECTOR]
					.options = this.formModel.selectedSubSectors;
			}
		},

		setAdmsLabel() {
			Object.values(LABEL_FOR_ADM_COLUMN).forEach((adm) => {
				this.editableTableColumns[adm.index].label = this.admNames[adm.code];
			});
		},

		getSectorsWithoutSelectedSubSector() {
			this.sectorsWithoutSelectedSubSectors = [];

			this.formModel.selectedSectors.forEach((selectedSector) => {
				const { value } = selectedSector;

				if (value in this.options.allSubSectors && this.formModel.selectedSubSectors?.length) {
					const containSelectedSubSector = this.options.allSubSectors[value]
						.some((selectedSubSector) => this.formModel.selectedSubSectors
							.some(({ code }) => code === selectedSubSector.code));

					if (!containSelectedSubSector) {
						this.sectorsWithoutSelectedSubSectors.push(value);
					}
				}
			});
		},

		changeSubSectorForTargetModal(subSectors) {
			this.editableTableColumns[OPTIONS_FOR_COLUMN_INDEX.SUB_SECTOR].options = subSectors;
		},

		getFilteredSubSectorForTargets(sectorCode) {
			if (!sectorCode) return;
			const subSectors = this.options.allSubSectors[sectorCode];

			if (!subSectors) return;
			let filteredSubSectors = [];
			const optionsSubSectorsMap = new Map();

			subSectors.forEach((subSector) => optionsSubSectorsMap.set(subSector.code, subSector));

			if (this.formModel.selectedSubSectors.length) {
				this.formModel.selectedSubSectors.forEach((subSector) => {
					const matchedSubSector = optionsSubSectorsMap.get(subSector.code);

					if (!matchedSubSector) return;
					filteredSubSectors.push(matchedSubSector);
				});
			} else {
				filteredSubSectors = subSectors;
			}
			this.filteredSubSectorsForTargets = filteredSubSectors;
		},

		onEditModalOpened(rowData) {
			this.getFilteredSubSectorForTargets(rowData.sector.code);
			this.changeSubSectorForTargetModal(this.filteredSubSectorsForTargets);
		},

		async onTargetModalOpened() {
			this.changeSubSectorForTargetModal([]);
			if (!this.editableTableColumns[OPTIONS_FOR_COLUMN_INDEX.MODALITY_TYPE].options?.length) {
				await this.fetchModalityTypes();
			}
		},

		async onNewTargetModalChanged({ formInput, data }) {
			if (formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.SINGLE_SELECT && formInput.key === "sector") {
				const sectorCode = data[formInput.key]?.code;

				this.getFilteredSubSectorForTargets(sectorCode);
				this.changeSubSectorForTargetModal(this.filteredSubSectorsForTargets);
			}
		},

		targetInValidateMessage(position, sector, type) {
			const sectorMessage = sector
				? `${this.$t("Add this")} ${sector} ${this.$t(`${type} or edit this target.`)}`
				: this.$t("Remove subsectors or edit this target");

			this.isTargetTableValid = false;
			this.targetTableValidateMessages.push(`${this.$t(`${type[0].toUpperCase() + type.slice(1)} on row`)}
			 ${position + 1} ${this.$t(`doesn't match any selected ${type} for project.`)} ${sectorMessage}`);
		},

		onValidateTarget() {
			this.targetTableValidateMessages = [];
			this.isTargetTableValid = true;

			if (!this.formModel.targets.length) return;

			this.formModel.targets.forEach((target, index) => {
				const isTargetSectorValid = this.formModel.selectedSectors.some(
					(projectSectors) => projectSectors.code === target.sector?.code,
				);

				if (!isTargetSectorValid) {
					this.targetInValidateMessage(index, target.sector?.value, "sector");
				}

				if (!this.formModel.selectedSubSectors.length) return;
				const isTargetSubSectorValid = this.formModel.selectedSubSectors.some(
					(projectSubSectors) => projectSubSectors.code === target.subSector?.code,
				);

				if (isTargetSubSectorValid) return;
				this.targetInValidateMessage(index, target.subSector?.value, "subSector");
			});
		},
	},
};
</script>
