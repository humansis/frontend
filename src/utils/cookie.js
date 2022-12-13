export const setCookie = (name, value, secondsToExpire) => {
	const d = new Date();
	d.setTime(d.getTime() + (secondsToExpire * 1000));
	const expires = `expires=${d.toGMTString()}`;
	document.cookie = `${name}=${value};${expires};path=/`;
};

export const getCookie = (name) => {
	const cookieName = `${name}=`;
	const ca = document.cookie.split(";");

	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === " ") {
			c = c.substring(1);
		}
		if (c.indexOf(cookieName) === 0) {
			return c.substring(cookieName.length, c.length);
		}
	}
	return "";
};

export const removeCookie = (name) => {
	document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};
