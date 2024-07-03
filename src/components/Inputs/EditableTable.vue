<template>
	<div class="table-container">
		<table class="editable-table">
			<thead>
				<tr>
					<th v-for="column in preparedColumns" :key="column.key">
						{{ $t(column.label) }}
						<span
							v-if="!column.required && !column.isHidden"
							class="font-weight-light font-italic"
						>
							- {{ $t("Optional") }}
						</span>
					</th>

					<th />
				</tr>
			</thead>

			<tbody>
				<tr v-for="(cellData, index) in table.data" :key="index">
					<td
						v-for="column in preparedColumns"
						:key="column.key"
						:class="tableCellClass(column.key)"
					>
						{{ prepareDataToDisplay(cellData[column.key], column.propertyName) }}
					</td>

					<td class="table-actions">
						<ButtonAction
							v-if="tableAction.isDetail"
							icon="search"
							tooltip-text="Show Detail"
							@actionConfirmed="onShowDetailModal(index)"
						/>

						<ButtonAction
							v-if="tableAction.isEdit || tableAction.isCreate"
							:disabled="!isUserAllowedUseTableAction"
							icon="edit"
							tooltip-text="Edit"
							@actionConfirmed="onShowEditModal(index)"
						/>

						<ButtonAction
							v-if="tableAction.isEdit || tableAction.isCreate"
							:disabled="tableAction.isDetail"
							icon="trash"
							iconColor="red"
							tooltip-text="Delete"
							@actionConfirmed="onDeleteRow(index)"
						/>
					</td>
				</tr>
			</tbody>

			<tr class="last-row">
				<td :colspan="preparedColumns.length + 1">
					<v-btn
						:disabled="tableAction.isDetail || !isUserAllowedUseTableAction"
						class="text-none"
						@click="onAddNewRow"
					>
						<span>
							<v-icon :icon="newRowButtonIcon" />
							<span class="new-row-title">{{ $t(newRowButtonName) }}</span>
						</span>
					</v-btn>
				</td>
			</tr>
		</table>

		<EditableTableModal
			v-model="editableTableModal.isOpened"
			:header="editableTableModal.title"
			:form-inputs="preparedInputs"
			:modal-state="editableTableModal"
			:form-data="formData"
			create-button-label="Add Target"
			close-button
			@formClosed="closeProjectTargetModal"
			@rowConfirmed="rowConfirmed"
			@modalInputChanged="$emit('modalInputChanged', $event)"
		/>
	</div>
</template>

<script>
import ButtonAction from "@/components/ButtonAction";
import EditableTableModal from "@/components/Inputs/EditableTableModal";
import { normalizeText } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import { GENERAL } from "@/consts";

export default {
	name: "editableTable",

	components: {
		EditableTableModal,
		ButtonAction,
	},

	props: {
		columns: {
			type: Array,
			required: true,
		},

		newRowButtonIcon: {
			type: String,
			default: "plus",
		},

		newRowButtonName: {
			type: String,
			default: "Add new row",
		},

		isModalOpenable: {
			type: Boolean,
			default: true,
		},

		tableAction: {
			type: Object,
			required: true,
		},

		contentName: {
			type: String,
			default: "",
		},

		tableData: {
			type: Array,
			required: true,
		},

		isUserAllowedUseTableAction: {
			type: Boolean,
			default: true,
		},

		noOpenableModalMessage: {
			type: String,
			default: "",
		},
	},

	data() {
		return {
			GENERAL,
			preparedColumns: [],
			preparedInputs: [],
			formData: {},
			editableTableModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
				title: `Create New ${this.contentName}`,
			},
			table: {
				data: [],
				index: 0,
			},
		};
	},

	watch: {
		columns: {
			deep: true,
			handler() {
				this.preparedColumns = [];
				this.preparedInputs = [];
				this.prepareColumns();
			},
		},
		tableData: {
			deep: true,
			handler(value) {
				this.table.data = value;
			},
		},
	},

	created() {
		this.prepareColumns();
	},

	methods: {
		prepareColumns() {
			this.columns.forEach((column) => {
				this.preparedInputs.push({
					key: column.key,
					label: column.label
						? column.label
						: normalizeText(column.key),
					type: column.type,
					options: column.options,
					isDataLoading: column.isDataLoading,
					propertyName: column.propertyName,
					required: column.validations?.required,
					validations: column.validations,
					clearValueAfterChange: column.clearValueAfterChange,
					isHidden: column.isColumnHidden,
				});
			});
			this.preparedColumns = this.preparedInputs.filter((input) => !input.isHidden);
		},

		rowConfirmed(data) {
			this.$emit("tableChanged", { ...data, index: this.table.index });
			this.editableTableModal.isOpened = false;
		},

		prepareDataToDisplay(data, propertyName) {
			if (propertyName) {
				if (Array.isArray(data) && data.length) {
					return data[0][propertyName] || "";
				}

				if (data && typeof data === "object") {
					return data[propertyName] || "";
				}
			}
			return data;
		},

		onAddNewRow() {
			if (this.isModalOpenable) {
				this.$emit("modalOpened");
				this.showCreateModal();
				this.formData = {};
				this.editableTableModal.isOpened = true;
			} else {
				Notification(`${this.$t(this.noOpenableModalMessage)}`, "error");
			}
		},

		onDeleteRow(index) {
			this.table.data.splice(index, 1);
			this.$emit("rowRemoved");
		},

		closeProjectTargetModal() {
			this.editableTableModal.isOpened = false;
		},

		onShowDetailModal(index) {
			this.editableTableModal = {
				isOpened: true,
				isEditing: false,
				isDetail: true,
				title: `Detail of ${this.contentName}`,
			};

			this.formData = this.table.data[index];
		},

		showCreateModal() {
			this.editableTableModal = {
				isOpened: false,
				isEditing: false,
				isDetail: false,
				title: `Create New ${this.contentName}`,
			};
		},

		onShowEditModal(index) {
			this.editableTableModal = {
				isOpened: true,
				isEditing: true,
				isDetail: false,
				title: `Edit of ${this.contentName}`,
			};

			this.table.index = index;
			this.formData = this.table.data[index];
			this.$emit("editModalOpened", this.formData);
		},

		tableCellClass(columnKey) {
			return columnKey === "note" ? "note-cell" : "";
		},
	},
};
</script>

<style lang="scss">
.table-container {
	overflow: auto;

	table, th, tr, td {
		border: 1px solid #dbdbdb;
	}

	table {
		text-align: center;
		border-collapse: collapse;
		border-spacing: 0;

		th {
			background-color: #f4f5f7;
			text-align: center;
			vertical-align: middle;
			padding: .375rem .9375rem;
			width: fit-content;
			white-space: nowrap;
		}

		td {
			min-width: 9.375rem;
			text-align: center;
			vertical-align: middle;
			padding: .5rem;
		}
	}

	.note-cell {
		min-width: 9.375rem;
		max-width: 43.75rem;
		white-space: normal;
		word-break: break-word;
	}

	.last-row {
		> td {
			padding: 0;
		}

		.new-row-title {
			padding-left: .3125rem;
		}

		button {
			width: 100%;
			border: none;
			font-weight: bold;
			justify-content: flex-start;
			background-color: #f4f5f7;

			&:focus {
				box-shadow: none;
			}

			.v-btn__content {
				position: sticky;
				left: 1.25rem;

				> span {
					display: flex;
					align-items: center;
				}
			}

		}
	}
}
</style>
