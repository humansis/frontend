<template>
	<div>
		<h2 class="title">Institutions</h2>
		<Modal
			:active="institutionModal.isOpened"
			:can-cancel="true"
			:header="institutionModal.isDetail ? 'Detail of Institution' :
				institutionModal.isEditing ? 'Edit institution' : 'Create new institution'"
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
				<b-table-column :key="column.id" v-bind="column">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>

			<b-table-column
				label="Actions"
				v-slot="props"
			>
				<div class="block">
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="editInstitution(props.row.id)"
					/>
					<ActionButton
						icon="search"
						type="is-link"
						@click.native="goToDetail(props.row.id)"
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
				isEditing: true,
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
				addressAdm1Id: "",
				addressAdm2Id: "",
				addressAdm3Id: "",
				addressAdm4Id: "",
			},
			detailOpened: false,
		};
	},

	watch: {
		$route: "fetchData",
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

			const {
				name,
				longitude,
				latitude,
				contactGivenName,
				contactFamilyName,
				type,
				phone,
				address,
				nationalIdCard,
			} = this.table.data.find((item) => item.id === id);

			this.institutionModel = {
				...this.institutionModel,
				id: null,
				longitude,
				latitude,
				name,
				contactGivenName,
				contactFamilyName,
				type,
				addressStreet: address.street,
				addressNumber: address.number,
				addressPostCode: address.postcode,
				nationalCardNumber: nationalIdCard.number,
				nationalCardType: nationalIdCard.type,
				phonePrefix: phone.prefix,
				phoneNumber: phone.number,
				addressAdm1Id: address.adm1Id,
				addressAdm2Id: address.adm2Id,
				addressAdm3Id: address.adm3Id,
				addressAdm4Id: address.adm4Id,
			};
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
				addressAdm1Id: "",
				addressAdm2Id: "",
				addressAdm3Id: "",
				addressAdm4Id: "",
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
				addressAdm1Id,
				addressAdm2Id,
				addressAdm3Id,
				addressAdm4Id,
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
					adm1Id: addressAdm1Id,
					adm2Id: addressAdm2Id,
					adm3Id: addressAdm3Id,
					adm4Id: addressAdm4Id,
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
				}
			});
		},

		async updateInstitution(id, institutionBody) {
			await InstitutionsService.updateInstitution(id, institutionBody).then((response) => {
				if (response.status === 200) {
					Toast("Institution Successfully Updated", "is-success");
				}
			});
		},

		async onInstitutionDelete(id) {
			await InstitutionsService.deleteInstitution(id).then((response) => {
				if (response.status === 204) {
					Toast("Institution Successfully Deleted", "is-success");
				}
			});
		},

		closeInstitutionModal() {
			this.institutionModal.isOpened = false;
		},

		goToDetail(id) {
			this.$router.push({ name: "Institution", params: { institutionId: id } });
		},

		showDetail(institution) {
			this.institutionModel = {
				...this.institutionModel,
				id: institution.id,
				longitude: institution.longitude,
				latitude: institution.latitude,
				name: institution.name,
				contactGivenName: institution.contactGivenName,
				contactFamilyName: institution.contactFamilyName,
				type: institution.type,
				addressStreet: institution.address.street,
				addressNumber: institution.address.number,
				addressPostCode: institution.address.postcode,
				nationalCardNumber: institution.nationalIdCard.number,
				nationalCardType: institution.nationalIdCard.type,
				phonePrefix: institution.phone.prefix,
				phoneNumber: institution.phone.number,
				addressAdm1Id: institution.address.adm1Id,
				addressAdm2Id: institution.address.adm2Id,
				addressAdm3Id: institution.address.adm3Id,
				addressAdm4Id: institution.address.adm4Id,
			};
			this.institutionModal.isDetail = true;
			this.institutionModal.isOpened = true;
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
