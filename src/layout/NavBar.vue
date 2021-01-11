<template>
	<b-navbar>
		<template slot="start">
			<b-navbar-item>
				<Breadcrumbs />
			</b-navbar-item>
		</template>
		<template slot="end">
			<b-navbar-item>
				<b-icon
					icon="question"
					size="is-medium"
				/>
			</b-navbar-item>
			<b-dropdown
				v-model="country.iso3"
				position="is-bottom-left"
				append-to-body
				aria-role="menu"
			>
				<a
					class="navbar-item"
					slot="trigger"
					role="button"
				>
					<b-icon icon="globe-africa" size="is-medium" />
				</a>
				<b-dropdown-item
					v-for="country in countries"
					:key="country.name"
					:value="country.iso3"
					@click="handleChangeCountry(country)"
				>
					<b-icon class="mr-1" icon="globe" />
					{{ country.iso3 }}
				</b-dropdown-item>
			</b-dropdown>

			<b-dropdown
				v-model="country.iso3"
				position="is-bottom-left"
				append-to-body
				aria-role="menu"
			>
				<a
					class="navbar-item"
					slot="trigger"
					role="button"
				>
					<b-icon icon="language" size="is-medium" />
				</a>
				<b-dropdown-item
					v-for="language in languages"
					:key="language.name"
					:value="language.name"
					@click="handleChangeLanguage(language)"
				>
					<b-icon class="mr-1" icon="language" />
					{{ language.name }}
				</b-dropdown-item>
			</b-dropdown>

			<b-dropdown
				position="is-bottom-left"
				append-to-body
				aria-role="menu"
			>
				<a
					class="navbar-item"
					slot="trigger"
					role="button"
				>
					<b-icon icon="user" size="is-medium" />
				</a>
				<router-link to="/profile">
					<b-dropdown-item value="profile">
						<b-icon class="mr-1" icon="user" />
						Profile
					</b-dropdown-item>
				</router-link>
				<b-dropdown-item value="logout">
					<b-icon class="mr-1" icon="sign-out-alt" />
					Log out
				</b-dropdown-item>
			</b-dropdown>
		</template>
	</b-navbar>
</template>

<script>
import { mapActions, mapState } from "vuex";
import LocationsService from "@/services/LocationsService";
import { Toast } from "@/utils/UI";

export default {
	name: "NavBar",

	data() {
		return {
			countries: [],
			languages: [],
		};
	},

	methods: {
		...mapActions(["updateCountry", "updateLanguage"]),

		handleChangeCountry(country) {
			localStorage.setItem("country", country.iso3);
			this.$router.go();
		},

		handleChangeLanguage(language) {
			localStorage.setItem("language", language.name);
			this.$router.go();
		},

		fetchCountries() {
			LocationsService.getListOfCountries()
				.then((response) => {
					this.countries = response.data;
					this.updateCountry(this.countries);
				}).catch((e) => {
					Toast(`(Countries) ${e}`, "is-danger");
				});
		},

		fetchLanguages() {
			// TODO Get languages
			this.languages = [
				{ name: "EN" },
				{ name: "CZ" },
			];
			this.updateLanguage(this.languages);
		},
	},

	created() {
		this.fetchCountries();
		this.fetchLanguages();
	},

	computed: {
		...mapState(["country", "language"]),
	},

};
</script>

<style lang="scss" scoped>
.dropdown-item {
	display: flex;
	align-items: center;
}
</style>
