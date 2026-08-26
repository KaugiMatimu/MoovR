export const BaseURL =
	import.meta.env.VITE_API_URL ||
	(import.meta.env.PROD ? "https://api.moovr.taxi/api/v1" : "http://localhost:5000/api/v1");

// export const BaseURL = 'https://moovr-api.vercel.app/api/v1';
