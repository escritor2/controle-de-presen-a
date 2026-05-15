export default defineNuxtPlugin(async (nuxtApp) => {
    const { user } = useAuth()
    const token = useCookie('auth_token')

    if (token.value && !user.value) {
        try {
            // No servidor, precisamos do fetch com contexto de requisição
            let fetcher: any
            if (import.meta.server) {
                fetcher = useRequestFetch()
            } else {
                fetcher = $fetch
            }

            const data = await fetcher('/api/auth/me')
            user.value = data as any
        } catch (error) {
            token.value = null
            user.value = null
        }
    }
})
