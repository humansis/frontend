// import { fetcher } from "@/utils/fetcher";

export default {
	async logUserIn(body) {
		console.log(body);
		// TODO uncomment this after BE repair
		// const { data, status } = await fetcher({ uri: "login", method: "POST", body });
		return { data: {}, status: 200 };
	},
};
