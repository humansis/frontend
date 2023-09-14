<template>
	<div>
		<section class="box">
			<h3 class="title is-4">{{ pageTitle }}</h3>
			<div class="columns">
				<div class="column">
					<b-field
						:label="$t('Project Name')"
						:type="validateType('name')"
						:message="validateMsg('name')"
					>
						<b-input
							v-model="formModel.name"
							:disabled="formDisabled"
							@blur="validate('name')"
						/>
					</b-field>

					<b-field>
						<template #label>
							{{ $t('Internal ID') }}
							<span class="optional-text has-text-weight-normal is-italic">
								- {{ $t('Optional') }}
							</span>
						</template>
						<b-input
							v-model="formModel.internalId"
							:disabled="formDisabled"
						/>
					</b-field>

					<b-field
						:label="$t('Sectors')"
						:type="validateType('selectedSectors')"
						:message="validateMsg('selectedSectors')"
					>
						<MultiSelect
							v-model="formModel.selectedSectors"
							searchable
							label="code"
							track-by="value"
							multiple
							:placeholder="$t('Click to select')"
							:select-label="$t('Press enter to select')"
							:selected-label="$t('Selected')"
							:deselect-label="$t('Press enter to remove')"
							:disabled="formDisabled"
							:options="options.sectors"
							:loading="sectorsLoading"
							:class="validateMultiselect('selectedSectors')"
							@input="selectorsSelect"
						>
							<span slot="noOptions">{{ $t("List is empty")}}</span>
							<template #option="props">
								<div class="option__desc">
									<span class="option__title">
										{{ normalizeSelectorValue(props.option.value) }}
									</span>
								</div>
							</template>
							<template #tag="props">
								<MultiSelectTag
									:props="props"
									:items="formModel.selectedSectors"
									:is-data-with-underscore="false"
									@optionRemoved="selectorsSelect"
								/>
							</template>
						</MultiSelect>
					</b-field>

					<b-field type="is-danger" :message="missingSubSectors">
						<template #label>
							{{ $t('Subsectors') }}
							<span class="optional-text has-text-weight-normal is-italic">
								- {{ $t('Optional') }}
							</span>
						</template>

						<MultiSelect
							v-model="formModel.selectedSubSectors"
							searchable
							label="value"
							track-by="code"
							multiple
							:placeholder="$t('Click to select')"
							:select-label="$t('Press enter to select')"
							:selected-label="$t('Selected')"
							:deselect-label="$t('Press enter to remove')"
							:disabled="formDisabled"
							:options="options.subSectors"
							:loading="subSectorsLoading"
							@input="subSectorSelect"
						>
							<span slot="noOptions">{{ $t("List is empty")}}</span>
							<template #option="props">
								<div class="option__desc">
									<span class="option__title">
										{{ normalizeSelectorValue(props.option.value) }}
									</span>
								</div>
							</template>
							<template #tag="props">
								<MultiSelectTag
									:props="props"
									:items="formModel.selectedSubSectors"
									:is-data-with-underscore="false"
									@optionRemoved="subSectorSelect"
								/>
							</template>
						</MultiSelect>
					</b-field>

					<b-field
						:label="$t('Start Date')"
						:type="validateType('startDate')"
						:message="validateMsg('startDate')"
					>
						<b-datepicker
							v-model="formModel.startDate"
							show-week-number
							icon="calendar-day"
							trap-focus
							locale="en-CA"
							:month-names="months()"
							:placeholder="$t('Click to select')"
							:disabled="formDisabled"
							@input="validate('startDate')"
						/>
					</b-field>

					<b-field
						:label="$t('End Date')"
						:type="validateType('endDate')"
						:message="validateMsg(
							'endDate',
							$t('Required and must be greater than Start Date')
						)"
					>
						<b-datepicker
							v-model="formModel.endDate"
							show-week-number
							icon="calendar-day"
							trap-focus
							locale="en-CA"
							:month-names="months()"
							:placeholder="$t('Click to select')"
							:disabled="formDisabled"
							@input="validate('endDate')"
						/>
					</b-field>

					<b-field>
						<template #label>
							{{ $t('Donors') }}
							<span class="optional-text has-text-weight-normal is-italic">
								- {{ $t('Optional') }}
							</span>
						</template>
						<MultiSelect
							v-model="formModel.selectedDonors"
							searchable
							label="fullname"
							track-by="id"
							multiple
							:select-label="$t('Press enter to select')"
							:selected-label="$t('Selected')"
							:deselect-label="$t('Press enter to remove')"
							:placeholder="$t('Click to select')"
							:disabled="formDisabled"
							:options="options.donors"
							:loading="donorsLoading"
						>
							<span slot="noOptions">{{ $t("List is empty")}}</span>
							<template #singleLabel v-slot:default="option">
								{{ option.shortname }}
							</template>
						</MultiSelect>
					</b-field>

				</div>

				<div class="column">
					<b-field>
						<template #label>
							{{ $t('Local Invoice Address') }}
							<span class="optional-text has-text-weight-normal is-italic">
								- {{ $t('Optional') }}
							</span>
						</template>
						<b-input
							v-model="formModel.projectInvoiceAddressLocal"
							:disabled="formDisabled"
						/>
					</b-field>

					<b-field>
						<template #label>
							{{ $t('English Invoice Address') }}
							<span class="optional-text has-text-weight-normal is-italic">
								- {{ $t('Optional') }}
							</span>
						</template>
						<b-input
							v-model="formModel.projectInvoiceAddressEnglish"
							:disabled="formDisabled"
						/>
					</b-field>

					<b-field
						:label="$t('Allowed Product Category Types')"
						:type="validateType('allowedProductCategoryTypes')"
						:message="validateMsg('allowedProductCategoryTypes',
							$t('Required. At least 1 category')
						)"
						:addons="false"
					>
						<div
							v-for="productCategoryType of options.allowedProductCategoryTypes"
							class="mb-3"
							:key="`product-category-type-${productCategoryType}`"
						>
							<b-checkbox
								v-model="formModel.allowedProductCategoryTypes"
								:native-value="productCategoryType"
								:disabled="formDisabled"
								@blur="validate('allowedProductCategoryTypes')"
							>
								<div class="is-flex is-align-items-center">
									{{ $t(productCategoryType) }}
									<SvgIcon
										class="ml-2"
										:items="getCodeAndValueObject(productCategoryType)"
									/>
								</div>
							</b-checkbox>
						</div>
					</b-field>

					<b-field>
						<template #label>
							{{ $t('Notes') }}
							<span class="optional-text has-text-weight-normal is-italic">
								- {{ $t('Optional') }}
							</span>
						</template>
						<b-input
							v-model="formModel.notes"
							type="textarea"
							:disabled="formDisabled"
						/>
					</b-field>
				</div>
			</div>

			<b-field>
				<template #label>
					{{ $t('Target') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<EditableTable
					content-name="Target"
					new-row-button-name="Add new target"
					no-openable-modal-message="Please add some Sector for using Target"
					:columns="editableTableColumns"
					:is-modal-openable="isProjectWithSectors"
					:table-action="projectAction"
					:table-data="formModel.targets"
					:is-user-allowed-use-table-action="userCan.projectTargets"
					@tableChanged="tableChanged"
					@modalInputChanged="newTargetModalChanged"
					@rowRemoved="validateTarget"
					@editModalOpened="editModalOpened"
					@modalOpened="targetModalOpened"
				/>
			</b-field>

			<p
				v-for="message in targetTableValidateMessages"
				:key="message"
				class="help is-danger"
			>
				{{ message }}
			</p>
		</section>

		<div v-if="isProjectDataLoading">
			<b-loading :is-full-page="false" :active="true" />
		</div>

		<div class="buttons flex-end mt-5">
			<b-button @click="goBack">{{ $t('Cancel') }}</b-button>

			<b-button
				v-if="!projectAction.isDetail"
				type="is-primary"
				:disabled="!isTargetTableValid"
				@click="validateNewProject"
			>
				{{ buttonName }}
			</b-button>
		</div>
	</div>
</template>

<script>
import { mapState } from "vuex";
import EditableTable from "@/components/Inputs/EditableTable";
import MultiSelectTag from "@/components/MultiSelectTag";
import SvgIcon from "@/components/SvgIcon";
import { required } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";
import permissions from "@/mixins/permissions";
import calendarHelper from "@/mixins/calendarHelper";
import AssistancesService from "@/services/AssistancesService";
import ProjectService from "@/services/ProjectService";
import SectorsService from "@/services/SectorsService";
import DonorService from "@/services/DonorService";
import { getArrayOfCodeListByKey, getArrayOfIdsByParam, getCodeAndValueObject } from "@/utils/codeList";
import { Notification, Toast } from "@/utils/UI";
import { normalizeText, normalizeSelectorValue } from "@/utils/datagrid";
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
		MultiSelectTag,
		SvgIcon,
	},

	mixins: [Validation, calendarHelper, permissions],

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
				donorIds: [],
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
					key: "adm1",
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.LOCATION,
					propertyName: "name",
				},
				{
					key: "adm2",
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.LOCATION,
					propertyName: "name",
				},
				{
					key: "adm3",
					type: GENERAL.EDITABLE_TABLE.COLUMN_TYPE.LOCATION,
					propertyName: "name",
				},
				{
					key: "adm4",
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

	validations: {
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

	methods: {
		async fetchSectors() {
			try {
				this.sectorsLoading = true;
				const { data } = await SectorsService.getListOfSectors();

				this.options.sectors = data;
			} catch (e) {
				if (e.message) Notification(`${this.$t("Sectors")} ${e}`, "is-danger");
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
				if (e.message) Notification(`${this.$t("SubSectors")} ${e}`, "is-danger");
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
				if (e.message) Notification(`${this.$t("Donors")} ${e}`, "is-danger");
			} finally {
				this.donorsLoading = false;
			}
		},

		async fetchTargets() {
			try {
				const { data } = await AssistancesService.getTargetTypes();

				this.options.targetTypes = data;
			} catch (e) {
				if (e.message) Notification(`${this.$t("Target Types")} ${e}`, "is-danger");
			}
		},

		async fetchProject() {
			try {
				const { data } = await ProjectService.getDetailOfProject(this.$route.params.projectId);

				this.mapToFormModel(data);
			} catch (e) {
				if (e.message) Notification(`${this.$t("Project Detail")} ${e}`, "is-danger");
			}
		},

		async createProject(projectBody) {
			try {
				const { status, message } = await ProjectService.createProject(projectBody);

				if (status === 200) {
					Toast(this.$t("Project Successfully Created"), "is-success");
					await this.$router.push({ name: "Projects" });
				} else {
					Notification(message, "is-danger");
				}
			} catch (e) {
				if (e.message) Notification(`${this.$t("Project")} ${e}`, "is-danger");
			}
		},

		async updateProject(id, projectBody) {
			await ProjectService.updateProject(id, projectBody).then((response) => {
				if (response.status === 200) {
					Toast(this.$t("Project Successfully Updated"), "is-success");
					this.$router.push({ name: "Projects" });
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Project")} ${e}`, "is-danger");
			});
		},

		async fetchModalityTypes() {
			try {
				const { data } = await AssistancesService.getListOfAllModalityTypes();

				this.editableTableColumns[OPTIONS_FOR_COLUMN_INDEX.MODALITY_TYPE].options = data;
			} catch (e) {
				if (e.message) Notification(`${this.$t("Modality Types")}${e}`, "is-danger");
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

		goBack() {
			this.$router.push({ name: "Projects" });
		},

		tableChanged(tableRow) {
			if (!tableRow.isCreate) {
				this.formModel.targets[tableRow.index] = tableRow.data;
			} else {
				this.formModel.targets.push(tableRow.data);
			}
			this.validateTarget();
		},

		validateNewProject() {
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.submitProjectForm(this.formModel);
			this.$v.$reset();
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
				donorIds,
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
				donorIds,
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
				selectedDonors: getArrayOfCodeListByKey(donorIds, this.options.donors, "id", true),
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

		selectorsSelect($event) {
			this.$nextTick(() => {
				this.formModel.selectedSectors = $event;
				this.validate("selectedSectors");
				this.filterSubSectors();
				this.getSectorsWithoutSelectedSubSector();

				this.editableTableColumns[OPTIONS_FOR_COLUMN_INDEX.SECTOR]
					.options = this.formModel.selectedSectors;
				this.formModel.selectedSubSectors = this.formModel.selectedSectors.length
					? this.formModel.selectedSubSectors.filter((selectedSubSector) => this.options.subSectors
						.find((subSector) => subSector.code === selectedSubSector.code))
					: [];
				this.validateTarget();

				if (!this.formModel.selectedSectors.length) {
					this.options.subSectors = [];
				}
			});
		},

		subSectorSelect($event) {
			this.formModel.selectedSubSectors = $event;
			this.getSectorsWithoutSelectedSubSector();
			this.validateTarget();
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

			subSectors.forEach((subSector) => optionsSubSectorsMap.set(
				subSector.code, subSector,
			));

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

		editModalOpened(rowData) {
			this.getFilteredSubSectorForTargets(rowData.sector.code);
			this.changeSubSectorForTargetModal(this.filteredSubSectorsForTargets);
		},

		async targetModalOpened() {
			this.changeSubSectorForTargetModal([]);
			if (!this.editableTableColumns[OPTIONS_FOR_COLUMN_INDEX.MODALITY_TYPE].options?.length) {
				await this.fetchModalityTypes();
			}
		},

		async newTargetModalChanged({ formInput, data }) {
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

		validateTarget() {
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
