<template>
	<v-container fluid>
		<v-card class="mx-auto mt-16" max-width="900">
			<v-card-text>
				<p class="text-h6">{{ $t('User Information') }}</p>

				<v-text-field
					v-model="userForm.email"
					variant="outlined"
					density="compact"
					hide-details="auto"
					class="mt-4 mb-4"
					disabled
				>
					<template v-slot:label>
						<span>{{ $t('Email') }}</span>
					</template>
				</v-text-field>

				<p class="text-h6"> {{ $t('Change Password') }}</p>

				<v-text-field
					v-model="test"
					variant="outlined"
					density="compact"
					hide-details="auto"
					class="mt-4 mb-4"
				>
					<template v-slot:label>
						<span>{{ $t('Old Password') }}</span>
					</template>
				</v-text-field>

				<v-text-field
					v-model="test"
					variant="outlined"
					density="compact"
					hide-details="auto"
					class="mt-4 mb-4"
				>
					<template v-slot:label>
						<span>{{ $t('New Password') }}</span>
					</template>
				</v-text-field>

				<v-text-field
					v-model="test"
					variant="outlined"
					density="compact"
					hide-details="auto"
					class="mt-4 mb-4"
				>
					<template v-slot:label>
						<span>{{ $t('Re-Enter New Password') }}</span>
					</template>
				</v-text-field>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
import { mapState } from "vuex";
import LoginService from "@/services/LoginService";
import UsersService from "@/services/UsersService";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { Notification } from "@/utils/UI";
import { PHONE } from "@/consts";

export default {
	name: "Profile",

	data() {
		return {
			userProfile: null,
			password: {
				oldPassword: "",
				newPassword: "",
				reenteredPassword: "",
			},
			phone: {
				prefix: null,
				number: "",
			},
			userForm: {
				email: "",
			},
			twoFactorEnabled: false,
			options: {
				phonePrefixes: PHONE.CODES,
			},
			changePasswordLoading: false,
			changePhoneLoading: false,
			twoFactorLoading: false,
		};
	},

	computed: {
		...mapState(["user"]),

		canEnableTwoFA() {
			return !this.userProfile?.phonePrefix || !this.userProfile?.phoneNumber;
		},
	},

	created() {
		this.fetchUser();
	},

	methods: {
		async submitPasswordForm() {
			this.$v.password.$touch();
			if (this.$v.password.$invalid) return;
			this.changePasswordLoading = true;

			const { id } = this.userProfile;
			const { data: { salt } } = await UsersService.requestSalt(this.userProfile.username);
			await LoginService.tryLogin({
				username: this.userProfile.username,
				password: this.password.oldPassword,
				// TODO uncomment after BE implement login with salted password
				// password: UsersService.saltPassword(salt, this.password.oldPassword),
			}).then(async () => {
				await UsersService.patchUser(id, {
					password: UsersService.saltPassword(salt, this.password.newPassword),
				}).then(({ data }) => {
					this.mapUser(data);
					Toast(
						`${this.$t("Password Updated")}`,
						"is-success",
					);
				}).catch((e) => {
					Notification(`${this.$t("Password Update")} ${e}`, "is-danger");
				});
			}).catch(() => {
				Notification(`${this.$t("Invalid Password")}`, "is-danger");
			});
			this.$v.password.$reset();

			this.changePasswordLoading = false;
		},

		async submitTelephoneForm() {
			this.$v.phone.$touch();
			if (this.$v.phone.$invalid) return;
			this.changePhoneLoading = true;
			this.phone.number = this.phone.number.replace(/\s+/g, "");

			const { id } = this.userProfile;

			await UsersService.patchUser(id, {
				phoneNumber: this.phone.number || null,
				phonePrefix: this.phone.prefix?.code || null,
			}).then(({ data }) => {
				this.mapUser(data);
				Toast(
					`${this.$t("Phone Updated")}`,
					"is-success",
				);
				this.fetchUser();
			}).catch((e) => {
				Notification(`${this.$t("Phone Update")} ${e}`, "is-danger");
			});
			this.$v.phone.$reset();

			this.changePhoneLoading = false;
		},

		async enableTwoFactor() {
			this.twoFactorLoading = true;

			const { id } = this.userProfile;

			await UsersService.patchUser(id, {
				"2fa": !this.twoFactorEnabled,
			}).then(({ data }) => {
				this.mapUser(data);
				Toast(
					`${this.$t(`Two Factor ${data["2fa"] ? "Enabled" : "Disabled"}`)}`,
					"is-success",
				);
			}).catch((e) => {
				Notification(`${this.$t("Two Factor Update")} ${e}`, "is-danger");
			});

			this.twoFactorLoading = false;
		},

		async fetchUser() {
			const { userId } = this.user;

			await UsersService.getDetailOfUser(userId)
				.then(({ data }) => {
					this.mapUser(data);
				})
				.catch((e) => {
					Notification(`${this.$t("User")} ${e}`, "is-danger");
				});
		},

		mapUser(data) {
			this.userProfile = data;
			this.userForm.email = data.email;
			this.phone.prefix = getArrayOfCodeListByKey([data.phonePrefix], PHONE.CODES, "code");
			this.phone.number = data.phoneNumber;
			this.twoFactorEnabled = data["2fa"];
		},

		newPasswordMessage() {
			if (!this.$v.password.newPassword.required) {
				return this.$t("Required");
			}
			if (!this.$v.password.newPassword.passwordValidation) {
				return this.$t("The Password Is Not Strong Enough... Minimum Required = 8 Characters, 1 Lowercase, 1 Uppercase, 1 Numeric");
			}
			return "";
		},

		reenterPasswordMessage() {
			if (!this.$v.password.reenteredPassword.required) {
				return this.$t("Required");
			}
			if (!this.$v.password.reenteredPassword.sameAsPassword) {
				return this.$t("Passwords must be same");
			}
			return "";
		},

		validationPropertyLevel(fields) {
			let result;
			const fieldsLevel = fields.split(".");
			switch (fieldsLevel.length) {
				case 1:
					result = this.$v[fieldsLevel[0]];
					break;
				case 2:
					result = this.$v[fieldsLevel[0]][fieldsLevel[1]];
					break;
				case 3:
					result = this.$v[fieldsLevel[0]][fieldsLevel[1]][fieldsLevel[2]];
					break;
				default:
			}
			return result;
		},

		validate(fieldName) {
			const validation = this.validationPropertyLevel(fieldName);
			validation.$touch();
		},

		validateMsg(fieldName, message = "Required") {
			const validation = this.validationPropertyLevel(fieldName);
			return validation.$error ? this.$t(message) : "";
		},

		validateType(fieldName, errorOrNothing = false) {
			const validation = this.validationPropertyLevel(fieldName);

			let result = "";
			if (validation.$dirty) {
				if (errorOrNothing) {
					result = validation.$error ? "is-danger" : "";
				} else {
					result = validation.$error ? "is-danger" : "is-success";
				}
			}

			return result;
		},

		validateMultiselect(fieldName, errorOrNothing = false) {
			const validation = this.validationPropertyLevel(fieldName);

			let result = "";
			if (validation.$dirty) {
				if (errorOrNothing) {
					result = validation.$error ? "vue-multiselect-error" : "";
				} else {
					result = validation.$error ? "vue-multiselect-error" : "vue-multiselect-success";
				}
			}
			return result;
		},

	},
};
</script>

<style lang="scss">
.v-label {
	opacity: 1;
	font-size: 20px;

	> span {
		font-size: 14px;
		font-weight: bold;
	}
}

.v-field--disabled {
	opacity: .8;
	background-color: #f5f5f5;
}

.v-field--disabled, .v-input--disabled {
	pointer-events: unset;

	input {
		cursor: not-allowed !important;
	}
}

</style>
