<template>
	<section class="section">
		<div class="columns">
			<div class="column is-half is-offset-one-quarter">
				<section class="modal-card-body">
					<p class="is-size-4 my-5">{{ $t('User Information') }}</p>
					<b-field :label="$t('Email')">
						<b-input v-model="userForm.email" disabled />
					</b-field>
					<form @submit.prevent="submitPasswordForm">
						<p class="is-size-4 my-5">{{ $t('Change Password') }}</p>
						<section>
							<b-field
								:label="$t('Old Password')"
								:type="validateType('password.oldPassword', true)"
								:message="validateMsg('password.oldPassword')"
							>
								<b-input
									v-model="password.oldPassword"
									type="password"
									@blur="validate('password.oldPassword')"
								/>
							</b-field>

							<b-field
								:label="$t('New Password')"
								:type="validateType('password.newPassword', true)"
								:message="newPasswordMessage()"
							>
								<b-input
									v-model="password.newPassword"
									type="password"
									@input="validate('password.newPassword')"
								/>
							</b-field>

							<b-field
								:label="$t('Re-Enter New Password')"
								:type="validateType('password.reenteredPassword', true)"
								:message="reenterPasswordMessage()"
							>
								<b-input
									v-model="password.reenteredPassword"
									type="password"
									@input="validate('password.reenteredPassword')"
								/>
							</b-field>

							<div class="level-right mt-5">
								<b-button
									type="is-primary"
									slot="trigger"
									native-type="submit"
									:loading="changePasswordLoading"
								>
									{{ $t('Save') }}
								</b-button>
							</div>
						</section>
					</form>
					<form @submit.prevent="submitTelephoneForm">
						<p class="is-size-4 my-5">{{ $t('Change Phone Number') }}</p>
						<b-field grouped>
							<b-field
								:label="$t('Phone Ext')"
								:type="validateType('phone.prefix', true)"
								:message="validateMsg('phone.prefix')"
							>
								<MultiSelect
									v-model="phone.prefix"
									searchable
									label="value"
									track-by="code"
									:options="options.phonePrefixes"
									:placeholder="$t('Click to select')"
									:class="validateMultiselect('phone.prefix', true)"
									@select="validate('phone.prefix')"
								/>
							</b-field>
							<b-field
								expanded
								:label="$t('Phone Number')"
								:type="validateType('phone.number', true)"
								:message="validateMsg('phone.number')"
							>
								<b-input
									v-model="phone.number"
									@blur="validate('phone.number')"
								/>
							</b-field>
						</b-field>
						<div class="level-right mt-5">
							<b-button type="is-primary" native-type="submit" :loading="changePhoneLoading">
								{{ $t('Save') }}
							</b-button>
						</div>
					</form>
					<!-- Disabled part with 2FA
					<section>
						<p class="is-size-4 my-5">{{ $t('Two Factor Authentication') }}</p>
						<div class="has-text-centered">
							{{ $t(`Two-factor authentication adds an additional layer of security
							to your account by requiring more than a password to log in`) }}
						</div>
						<br>
						<div class="has-text-centered">
							<strong>
								{{ $t('Two Factor Authentication') }}
								{{ twoFactorEnabled ? $t('Enabled') : $t('Disabled') }}
							</strong>
						</div>
						<div class="level-right mt-5">
							<b-button
								type="is-primary"
								native-type="submit"
								:disabled="canEnableTwoFA"
								:loading="twoFactorLoading"
								@click="enableTwoFactor"
							>
								{{ twoFactorEnabled ? $t('Disable') : $t('Enable') }}
							</b-button>
						</div>
					</section>
					-->
				</section>
			</div>
		</div>
	</section>
</template>

<script>
import { mapState } from "vuex";
import { requiredIf, sameAs } from "vuelidate/lib/validators";
import PhoneCodes from "@/utils/phoneCodes";
import UsersService from "@/services/UsersService";
import { Notification, Toast } from "@/utils/UI";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import LoginService from "@/services/LoginService";

const passwordRegexp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/);

const passwordValidation = (value) => (value ? passwordRegexp.test(value) : true);

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
				phonePrefixes: PhoneCodes,
			},
			changePasswordLoading: false,
			changePhoneLoading: false,
			twoFactorLoading: false,
		};
	},

	validations: {
		password: {
			// eslint-disable-next-line func-names
			oldPassword: { required: requiredIf(function () {
				return this.password.newPassword
					|| this.password.reenteredPassword;
			}) },
			newPassword: {
				// eslint-disable-next-line func-names
				required: requiredIf(function () {
					return this.password.oldPassword
						|| this.password.reenteredPassword;
				}),
				passwordValidation,
			},
			reenteredPassword: {
				// eslint-disable-next-line func-names
				required: requiredIf(function () {
					return this.password.oldPassword
						|| this.password.newPassword;
				}),
				sameAsPassword: sameAs("newPassword"),
			},
		},
		phone: {
			// eslint-disable-next-line func-names
			prefix: { required: requiredIf(function () { return this.phone.number; }) },
			// eslint-disable-next-line func-names
			number: { required: requiredIf(function () { return this.phone.prefix; }) },
		},
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
			this.phone.prefix = getArrayOfCodeListByKey([data.phonePrefix], PhoneCodes, "code");
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
