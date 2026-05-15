export const useNavigation = () => {
    const { user } = useAuth();

    const links = computed(() => {
        const role = user.value?.role;
        
        if (role === 'ADMIN') {
            return [
                { label: 'Gerenciar Usuários', icon: 'i-heroicons-users', to: '/admin/usuarios' },
                { label: 'Gerenciar Cursos', icon: 'i-heroicons-academic-cap', to: '/admin/cursos' },
                { label: 'Gerenciar Alunos', icon: 'i-heroicons-user-group', to: '/admin/alunos' },
                { label: 'Gerenciar Empresas', icon: 'i-heroicons-building-office-2', to: '/admin/empresas' },
                { label: 'Gerenciar Turmas', icon: 'i-heroicons-rectangle-stack', to: '/admin/turmas' }
            ]
        }
        
        if (role === 'PROFESSOR') {
            return [
                { label: 'Minhas Turmas', icon: 'i-heroicons-academic-cap', to: '/dashboard' }
            ]
        }

        return []
    })

    return { links }
}