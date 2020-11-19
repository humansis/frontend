<template>
	<div>
		<h2 class="title">Communities</h2>
		<Modal
			can-cancel
			:active="communityModal.isOpened"
			:header="modalHeader"
			@close="closeCommunityModal"
		>
			<CommunityForm
				close-button
				:formModel="communityModel"
				:submit-button-label="communityModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="communityModal.isDetail"
				@formSubmitted="submitCommunityForm"
				@formClosed="closeCommunityModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewCommunity"
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
						@click.native="editCommunity(props.row.id)"
					/>
					<SafeDelete
						:id="props.row.id"
						icon="trash"
						entity="Community"
						@submitted="onCommunityDelete"
					/>
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import CommunitiesService from "@/services/CommunitiesService";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import { Toast } from "@/utils/UI";
import CommunityForm from "@/components/Beneficiaries/CommunityForm";
import Modal from "@/components/Modal";

export default {
	name: "CommunitiesList",

	components: {
		Modal,
		CommunityForm,
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
						key: "contactGivenName",
						label: "Contact Name",
					},
					{
						key: "contactFamilyName",
						label: "Contact Family Name",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			communityModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
			},
			communityModel: {
				id: null,
				longitude: "",
				latitude: "",
				name: "",
				contactGivenName: "",
				contactFamilyName: "",
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
			if (this.communityModal.isDetail) {
				result = "Detail of Community";
			} else if (this.communityModal.isEditing) {
				result = "Edit Community";
			} else {
				result = "Create new Community";
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

				await CommunitiesService.getListOfCommunities(
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

		editCommunity(id) {
			this.communityModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
			};

			this.mapToFormModel(this.table.data.find((item) => item.id === id));
		},

		addNewCommunity() {
			this.communityModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
			};

			this.communityModel = {
				...this.communityModel,
				id: null,
				longitude: "",
				latitude: "",
				name: "",
				contactGivenName: "",
				contactFamilyName: "",
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

		submitCommunityForm(communityForm) {
			const {
				id,
				longitude,
				latitude,
				contactGivenName,
				contactFamilyName,
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
			} = communityForm;

			const communityBody = {
				longitude,
				latitude,
				contactGivenName,
				contactFamilyName,
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

			if (this.communityModal.isEditing && id) {
				this.updateCommunity(id, communityBody);
			} else {
				this.createCommunity(communityBody);
			}

			this.closeCommunityModal();
		},

		async createCommunity(communityBody) {
			await CommunitiesService.createCommunity(communityBody).then((response) => {
				if (response.status === 200) {
					Toast("Community Successfully Created", "is-success");
					this.fetchData();
				}
			});
		},

		async updateCommunity(id, communityBody) {
			await CommunitiesService.updateCommunity(id, communityBody).then((response) => {
				if (response.status === 200) {
					Toast("Community Successfully Updated", "is-success");
					this.fetchData();
				}
			});
		},

		async onCommunityDelete(id) {
			await CommunitiesService.deleteCommunity(id)
				.then((response) => {
					if (response.status === 204) {
						Toast("Community Successfully Deleted", "is-success");
						this.fetchData();
					}
				});
		},

		closeCommunityModal() {
			this.communityModal.isOpened = false;
		},

		showDetailWithId(id) {
			const community = this.table.data.find((item) => item.id === id);
			this.showDetail(community);
		},

		showDetail(community) {
			this.mapToFormModel(community);
			this.communityModal = {
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
			this.communityModel = {
				...this.communityModel,
				id,
				longitude,
				latitude,
				name,
				contactGivenName,
				contactFamilyName,
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
