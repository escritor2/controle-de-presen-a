export const useAuth = () =>{
    const user = useState('user', () => null);
    const login = async (credentials: {email : string, senha: string}) => {
        try {
            const data = await $fetch('/api/auth/login', {
                method: 'POST',
                body: credentials
            })
            user.value = data

            await navigateTo('/')
        }catch (error: any){
            throw error
        }
    }
    const logout = async () => {
        try {
            await $fetch('/api/auth/logout', {method: 'POST'})
        }catch (err: any){
            throw err
        }finally{
            user.value = null
            const cookie = useCookie('auth_token')
            cookie.value = null

            await navigateTo('/auth/login')
        }

    }
    return {
        user, 
        login,
        logout,
        isAuthenticated: computed(()=> !!user.value)
    }
}

