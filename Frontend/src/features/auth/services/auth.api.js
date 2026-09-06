import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})

export async function register({ username, email, password }) {

    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })

        return response.data

    } catch (err) {
        console.log(err)
    }
}

export async function login({ email, password }) {
    try {

        const response = await api.post("/api/auth/login", {
            email, password
        })

        return response.data

    } catch (err) {
        console.log(err)
    }
}

export async function logout() {
    try {

        const response = await api.get("/api/auth/logout")

        return response.data

    } catch (err) {
        console.log(err)
    }
}

// export async function getMe() {
//     try {

//         const response = await api.get("/api/auth/get-me")

//         return response.data

//     } catch (err) {
//         console.log(err)
//     }
// }
// Inside your auth.api.js file
export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me");
        return response.data;
    } catch (err) {
        // Remove or keep console.log based on debugging preference
        console.error("Auth verification failed:", err.response?.data?.message || err.message);
        throw err; // 👈 CRUCIAL: Throw the error so the useAuth catch block triggers!
    }
}
