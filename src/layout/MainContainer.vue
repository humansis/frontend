<template>
	<div class="main-container">
		<NavBar />
		<SideMenu />
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
		<section class="section">
			<router-view />
		</section>
	</div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import SideMenu from "@/layout/SideMenu";
import NavBar from "@/layout/NavBar";
import Modal from "@/components/Modal";
import Validation from "@/mixins/validation";
import UserPasswordForm from "@/components/AdministrativeSettings/UserPasswordForm";
import UsersService from "@/services/UsersService";
import { Notification, Toast } from "@/utils/UI";

export default {
	name: "MainContainer",

	mixins: [Validation],

	components: {
		SideMenu,
		NavBar,
		Modal,
		UserPasswordForm,
	},

	data() {
		return {
			forcePasswordModal: {
				isOpened: false,
				isWaiting: false,
			},
			userModel: {
				password: "",
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
		...mapActions(["updateStoredUser"]),

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
					this.updateStoredUser({
						attribute: "changePassword",
						value: false,
					});
					Toast(
						`${this.$t("Password Updated")}`,
						"is-success",
					);
				}
			}).catch((e) => {
				Notification(`${this.$t("Password Update")} ${e}`, "is-danger");
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
	height: 100%;
}
</style>
