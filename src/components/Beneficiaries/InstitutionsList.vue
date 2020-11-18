<template>
	<div>
		<h2 class="title">Institutions</h2>
		<Modal
			can-cancel
			:active="institutionModal.isOpened"
			:header="modalHeader"
			@close="closeInstitutionModal"
		>
			<InstitutionsForm
				close-button
				:formModel="institutionModel"
				:submit-button-label="institutionModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="institutionModal.isDetail"
				@formSubmitted="submitInstitutionForm"
				@formClosed="closeInstitutionModal"
			/>
		</Modal>

		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewInstitution"
		>
			Add
		</b-button>
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input placeholder="Search..."
						type="search"
						icon="search"
					/>
				</b-field>
			</div>
		</div>

		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>

			<b-table-column
				v-slot="props"
				label="Actions"
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-link"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="editInstitution(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Institute"
						:id="props.row.id"
						@submitted="onInstitutionDelete"
					/>
					<ActionButton icon="print" type="is-dark" />
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import InstitutionsService from "@/services/InstitutionsService";
import Table from "@/components/Table";
import ActionButton from "@/components/ActionButton";
import { Toast } from "@/utils/UI";
import SafeDelete from "@/components/SafeDelete";
import InstitutionsForm from "@/components/Beneficiaries/InstitutionsForm";
import Modal from "@/components/Modal";

export default {
	name: "InstitutionsList",

	components: {
		Modal,
		InstitutionsForm,
		SafeDelete,
		Table,
		ActionButton,
	},

	data() {
		return {
			fetch: {
				error: null,
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "name",
						label: "Name",
					},
					{
						key: "longitude",
						label: "Longitude",
					},
					{
						key: "latitude",
						label: "Latitude",
					},
					{
						key: "type",
						label: "Type",
					},
					{
						key: "contactGivenName",
						label: "Contact Given Name",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			institutionModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
			},
			institutionModel: {
				id: null,
				longitude: "",
				latitude: "",
				name: "",
				contactGivenName: "",
				contactFamilyName: "",
				type: "",
				addressStreet: "",
				addressNumber: "",
				addressPostCode: "",
				nationalCardNumber: "",
				nationalCardType: "",
				phonePrefix: "",
				phoneNumber: "",
				adm1Id: "",
				adm2Id: "",
				adm3Id: "",
				adm4Id: "",
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.institutionModal.isDetail) {
				result = "Detail of Institution";
			} else if (this.institutionModal.isEditing) {
				result = "Edit Institution";
			} else {
				result = "Create new Institution";
			}
			return result;
		},
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open();

				await InstitutionsService.getListOfInstitutions(
					this.table.currentPage,
					this.table.perPage,
					"desc",
				).then((response) => {
					this.table.data = response.data;
					this.table.total = response.totalCount;
					this.table.columns = generateColumns(
						this.table.visibleColumns,
					);
				});

				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
		},

		editInstitution(id) {
			this.institutionModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
			};

			this.mapToFormModel(this.table.data.find((item) => item.id === id));
		},

		addNewInstitution() {
			this.institutionModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
			};

			this.institutionModel = {
				...this.institutionModel,
				id: null,
				longitude: "",
				latitude: "",
				name: "",
				contactGivenName: "",
				contactFamilyName: "",
				type: "",
				addressStreet: "",
				addressNumber: "",
				addressPostCode: "",
				nationalCardNumber: "",
				nationalCardType: "",
				phonePrefix: "",
				phoneNumber: "",
				adm1Id: "",
				adm2Id: "",
				adm3Id: "",
				adm4Id: "",
			};
		},

		submitInstitutionForm(institutionForm) {
			const {
				id,
				longitude,
				latitude,
				name,
				contactGivenName,
				contactFamilyName,
				type,
				addressStreet,
				addressNumber,
				addressPostCode,
				nationalCardNumber,
				nationalCardType,
				phonePrefix,
				phoneNumber,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
			} = institutionForm;

			const institutionBody = {
				name,
				longitude,
				latitude,
				contactGivenName,
				contactFamilyName,
				type,
				address: {
					street: addressStreet,
					number: addressNumber,
					postCode: addressPostCode,
					adm1Id,
					adm2Id,
					adm3Id,
					adm4Id,
				},
				nationalCard: {
					idNumber: nationalCardNumber,
					idType: nationalCardType,
				},
				phone: {
					prefix: phonePrefix,
					number: phoneNumber,
				},
			};
			if (this.institutionModal.isEditing && id) {
				this.updateInstitution(id, institutionBody);
			} else {
				this.createInstitution(institutionBody);
			}

			this.closeInstitutionModal();
		},

		async createInstitution(institutionBody) {
			await InstitutionsService.createInstitution(institutionBody).then((response) => {
				if (response.status === 200) {
					Toast("Institution Successfully Created", "is-success");
					this.fetchData();
				}
			});
		},

		async updateInstitution(id, institutionBody) {
			await InstitutionsService.updateInstitution(id, institutionBody).then((response) => {
				if (response.status === 200) {
					Toast("Institution Successfully Updated", "is-success");
					this.fetchData();
				}
			});
		},

		async onInstitutionDelete(id) {
			await InstitutionsService.deleteInstitution(id).then((response) => {
				if (response.status === 204) {
					Toast("Institution Successfully Deleted", "is-success");
					this.fetchData();
				}
			});
		},

		closeInstitutionModal() {
			this.institutionModal.isOpened = false;
		},

		showDetailWithId(id) {
			const institution = this.table.data.find((item) => item.id === id);
			this.showDetail(institution);
		},

		showDetail(institution) {
			this.mapToFormModel(institution);
			this.institutionModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
			};
		},

		mapToFormModel(
			{
				id,
				name,
				longitude,
				latitude,
				contactGivenName,
				contactFamilyName,
				type,
				phone: {
					prefix: phonePrefix,
					number: phoneNumber,
				},
				address: {
					street: addressStreet,
					number: addressNumber,
					postcode: addressPostCode,
					adm1Id,
					adm2Id,
					adm3Id,
					adm4Id,
				},
				nationalIdCard: {
					number: nationalCardNumber,
					type: nationalCardType,
				},
			},
		) {
			this.institutionModel = {
				...this.institutionModel,
				id,
				longitude,
				latitude,
				name,
				contactGivenName,
				contactFamilyName,
				type,
				addressStreet,
				addressNumber,
				addressPostCode,
				nationalCardNumber,
				nationalCardType,
				phonePrefix,
				phoneNumber,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
			};
		},

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},
	},
};
</script>
