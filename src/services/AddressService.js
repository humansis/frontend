import { fetcher } from "@/utils/fetcher";
// TODO fix after BE resolve naming in addresses
export default {

	async getCampAddress(id) {
		const response = await fetcher({ uri: `beneficiaries/addresses/camps/${id}` });
		const data = {
			id: response.data.id,
			type: response.data.type,
			locationGroup: response.data.locationGroup,
			tentNumber: response.data.tentNumber,
			name: response.data.name,
			adm1Id: response.data.adm1,
			adm2Id: response.data.adm2,
			adm3Id: response.data.adm3,
			adm4Id: response.data.adm4,
		};
		return data;
	},

	async getResidenceAddress(id) {
		const response = await fetcher({ uri: `beneficiaries/addresses/residencies/${id}` });
		const data = {
			id: response.data.id,
			type: response.data.type,
			locationGroup: response.data.locationGroup,
			number: response.data.number,
			street: response.data.street,
			postcode: response.data.postcode,
			adm1Id: response.data.adm1,
			adm2Id: response.data.adm2,
			adm3Id: response.data.adm3,
			adm4Id: response.data.adm4,
		};
		return data;
	},

	async getTemporarySettlementAddress(id) {
		const response = await fetcher({ uri: `beneficiaries/addresses/temporary-settlement/${id}` });
		const data = {
			id: response.data.id,
			type: response.data.type,
			locationGroup: response.data.locationGroup,
			number: response.data.number,
			street: response.data.street,
			postcode: response.data.postcode,
			adm1Id: response.data.adm1,
			adm2Id: response.data.adm2,
			adm3Id: response.data.adm3,
			adm4Id: response.data.adm4,
		};
		return data;
	},
};
