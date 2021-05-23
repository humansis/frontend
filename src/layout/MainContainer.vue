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
import { mapState } from "vuex";
import SideMenu from "@/layout/SideMenu";
import NavBar from "@/layout/NavBar";
import Modal from "@/components/Modal";
import Validation from "@/mixins/validation";
import UserPasswordForm from "@/components/AdministrativeSettings/UserPasswordForm";
import UsersService from "@/services/UsersService";
import { Toast } from "@/utils/UI";

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

			await UsersService.changeUsersAttribute(this.user.userId, "password", password)
				.then((response) => {
					if (response.status === 200) {
						Toast(this.$t("Password Successfully Updated"), "is-success");

						this.forcePasswordModal.isOpened = false;
					}
				}).catch((e) => {
					Toast(`${this.$t("Password Was Not Updated")} ${e}`, "is-danger");
				});

			this.forcePasswordModal.isWaiting = false;
		},
	},
};
</script>

<style>
html, body, .main-container, .section {
	height: 100%;
}
</style>
