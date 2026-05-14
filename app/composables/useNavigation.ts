export const useNavigation = () =>{
    const {data:user} = useAuth();

    const links = computed(()=>{
        const role = user.value?.role;
        const commonLinks = [
            {label: 'Dashboard', icon: 'i-heroicons-home', to: '/'}
        ]        
        const adminLinks = [
            {label: 'Dashboard', icon: 'i-heroicons-home', to:"/admin/dashboard"},
            {label: 'Vincular Turmas', icon: 'i-heroicons-link', to:"/admin/turmas"},
            {label: 'Usuarios', icon: 'i-heroicons-user', to:"/admin/usuarios"}
        ]
        const professorLinks = [
            {label: 'Minhas Turmas', icon: 'i-heroicons-academic-cap', to: '/professor/turmas'},
            { label: 'Frequencias', icon: 'i-heroicons-clipboard-document-check', to:'/professor/frequencia' }
        ]
        if (role === 'ADMIN') return [...commonLinks, ...adminLinks]
        if (role === 'PROFESSOR') return [...commonLinks, ...professorLinks]

    })
    return {links}
}