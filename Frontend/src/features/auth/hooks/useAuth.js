import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            setUser(null)
        } catch (error) {

        } finally {
            setLoading(false)
        }
    }

    // useEffect(() => {
    //     const getAndSetUser = async () => {
    //         try {
    //             const data = await getMe()
    //             setUser(data.user)
    //         } catch (err) { } finally {
    //             setLoading(false)
    //         }
    //     }
    //     getAndSetUser()
    // }, [])
    // Inside useAuth.js
useEffect(() => {
    const getAndSetUser = async () => {
        try {
            const data = await getMe();
            if (data && data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            // Explicitly set user to null if 401 Unauthorized hits
            setUser(null); 
        } finally {
            setLoading(false);
        }
    };
    
    getAndSetUser();
}, [setUser, setLoading]); // Added standard context setter dependencies



    return { user, loading, handleRegister, handleLogin, handleLogout }
}