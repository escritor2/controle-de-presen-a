export default defineNuxtPlugin(async (nuxtApp) => {
    const { user } = useAuth()
    const token = useCookie('auth_token')

    if (token.value && !user.value) {
        try {
            // No servidor, precisamos do fetch com contexto de requisição
            const fetcher = import.meta.server ? useRequestFetch() : $fetch
            const data = await fetcher('/api/auth/me')
            user.value = data as any
        } catch (error) {
            token.value = null
            user.value = null
        }
    }
})
