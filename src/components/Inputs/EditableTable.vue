<template>
	<div class="table-container">
		<table class="editable-table">
			<thead>
				<tr>
					<th v-for="column in preparedColumns" :key="column.key">
						{{ column.label }}
						<span
							v-if="!column.required && !column.isHidden"
							class="optional-text has-text-weight-normal is-italic"
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

					<td>
						<ActionButton
							v-if="tableAction.isDetail"
							icon="search"
							type="is-primary"
							class="mr-3"
							:tooltip="$t('Show Detail')"
							@click="showDetailModal(index)"
						/>
						<ActionButton
							v-if="tableAction.isEdit || tableAction.isCreate"
							icon="edit"
							class="mr-3"
							:tooltip="$t('Edit')"
							:disabled="!isUserAllowedUseTableAction"
							@click="showEditModal(index)"
						/>
						<ActionButton
							icon="trash"
							type="is-danger"
							:disabled="tableAction.isDetail"
							:tooltip="$t('Delete')"
							@click="deleteRow(index)"
						/>
					</td>
				</tr>
			</tbody>

			<tr class="last-row">
				<td :colspan="preparedColumns.length + 1">
					<b-button
						type="is-light"
						:disabled="tableAction.isDetail || !isUserAllowedUseTableAction"
						@click="addNewRow"
					>
						<span>
							<b-icon :icon="newRowButtonIcon" />
							<span>{{ $t(newRowButtonName) }}</span>
						</span>
					</b-button>
				</td>
			</tr>
		</table>

		<Modal
			can-cancel
			:header="editableTableModal.title"
			:active="editableTableModal.isOpened"
			@close="closeProjectTargetModal"
		>
			<EditableTableModal
				close-button
				class="modal-card"
				create-button-label="Add Target"
				:form-inputs="preparedInputs"
				:modal-state="editableTableModal"
				:form-data="formData"
				@formClosed="closeProjectTargetModal"
				@rowConfirmed="rowConfirmed"
				@modalInputChanged="$emit('modalInputChanged', $event)"
			/>
		</Modal>
	</div>
</template>

<script>
import EditableTableModal from "@/components/Inputs/EditableTableModal";
import Modal from "@/components/Modal";
import ActionButton from "@/components/ActionButton";
import { normalizeText } from "@/utils/datagrid";
import { Notification, Toast } from "@/utils/UI";
import { GENERAL } from "@/consts";

export default {
	name: "editableTable",

	components: {
		EditableTableModal,
		ActionButton,
		Modal,
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

	created() {
		this.prepareColumns();
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
		tableData(value) {
			this.table.data = value;
		},
	},

	methods: {
		prepareColumns() {
			this.columns.forEach((column) => {
				this.preparedInputs.push({
					key: column.key,
					label: column.label
						? this.$t(column.label)
						: this.$t(normalizeText(column.key)),
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
			Toast(
				this.$t(`${this.contentName} Successfully ${data.isCreate ? "Created" : "Edited"}`),
				"is-success",
			);
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

		addNewRow() {
			if (this.isModalOpenable) {
				this.$emit("modalOpened");
				this.showCreateModal();
				this.formData = {};
				this.editableTableModal.isOpened = true;
			} else {
				Notification(`${this.$t(this.noOpenableModalMessage)}`, "is-danger");
			}
		},

		deleteRow(index) {
			this.table.data.splice(index, 1);
			this.$emit("rowRemoved");
			Toast(this.$t(`${this.contentName} Successfully Deleted`), "is-success");
		},

		closeProjectTargetModal() {
			this.editableTableModal.isOpened = false;
		},

		showDetailModal(index) {
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

		showEditModal(index) {
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

<style lang="scss" scoped>
.table-container {
	table, th, tr, td {
		border: 1px solid #dbdbdb;
	}

	table {
		text-align: center;

		th {
			background-color: #f4f5f7;
			text-align: center;
			vertical-align: middle;
			padding: 6px 15px;
			width: fit-content;
			white-space: nowrap;
		}

		td {
			min-width: 150px;
			text-align: center;
			vertical-align: middle;
			padding: 8px;
		}

		.last-row > td {
			padding: 0;
		}
	}

	.note-cell {
		min-width: 150px;
		max-width: 700px;
		white-space: normal;
		word-break: break-word;
	}

	.last-row {
		button {
			width: 100%;
			border: none;
			font-weight: bold;
			justify-content: unset;

			&:focus {
				box-shadow: none;
			}

			&::v-deep {
				&:first-child > span {
					position: sticky;
					left: 16px;
				}
			}
		}
	}
}
</style>
