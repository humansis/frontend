<template>
	<v-layout class="rounded rounded-md">
		<SideMenu />

		<NavBar />

		<v-main>
			<!--
			<Modal
				:can-cancel="false"
				:header="$t('You need to change your password')"
				:active="forcePasswordModal.isOpened"
				:is-waiting="forcePasswordModal.isWaiting"
			>
				<UserPasswordForm
					class="modal-card"
					:formModel="userModel"
					:submit-button-label="$t('Update')"
					@formSubmitted="changeForcedPassword"
				/>
			</Modal>
			-->
			<router-view />
		</v-main>
	</v-layout>
</template>

<script>
import { mapActions, mapState } from "vuex";
import UsersService from "@/services/UsersService";
// import UserPasswordForm from "@/components/AdministrativeSettings/UserPasswordForm";
// import Modal from "@/components/Modal";
// import validation from "@/mixins/validation";
// import { Notification, Toast } from "@/utils/UI";
import NavBar from "@/layout/NavBar";
import SideMenu from "@/layout/SideMenu";

export default {
	name: "MainContainer",

	components: {
		SideMenu,
		NavBar,
		// Modal,
		// UserPasswordForm,
	},

	// mixins: [validation],

	data() {
		return {
			forcePasswordModal: {
				isOpened: false,
				isWaiting: false,
			},
			userModel: {
				password: "", // TODO add validation
			},
		};
	},

	computed: {
		...mapState([
			"isAsideVisible",
			"isNavBarVisible",
			"translations",
			"language",
			"user",
		]),
	},

	created() {
		this.changeTextDirection(this.language.direction);
		this.setLocales();

		if (this.user?.changePassword) {
			this.forcePasswordModal.isOpened = true;
		}

		if (!this.isAsideVisible && !this.isNavBarVisible) {
			this.$store.commit("fullPage", false);
		}
	},

	methods: {
		...mapActions(["storeUser"]),

		setLocales() {
			this.$i18n.locale = this.language.key;
			this.$i18n.fallbackLocale = this.language.key;
			this.$root.$i18n.setLocaleMessage(this.language.key, this.translations);
		},

		changeTextDirection(direction) {
			const htmlElement = document.getElementsByTagName("html").item(0);
			htmlElement.dir = direction || "ltr";
			if (direction === "ltr") {
				htmlElement.classList.remove("is-rtl");
			} else if (direction === "rtl") {
				htmlElement.classList.add("is-rtl");
			}
		},

		async changeForcedPassword({ password }) {
			this.forcePasswordModal.isWaiting = true;

			const { data: { salt } } = await UsersService.requestSalt(this.user.username);

			await UsersService.patchUser(this.user.userId, {
				password: UsersService.saltPassword(salt, password),
			}).then(({ status }) => {
				if (status === 200) {
					this.storeUser({ ...this.user, changePassword: false });

          // FIXME
					// Toast(`${this.$t("Password Updated")}`, "is-success");
				}
			}).catch((e) => {
        // FIXME
				// Notification(`${this.$t("Password Update")} ${e}`, "is-danger");
			}).finally(() => {
				this.forcePasswordModal.isWaiting = false;
				this.forcePasswordModal.isOpened = false;
			});
		},
	},
};
</script>

<style>
html, body, .main-container, .section {
	height: 100%; /* TODO remove? */
}
</style>
