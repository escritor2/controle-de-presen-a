<script setup lang="ts">
definePageMeta({
    middleware: ['auth', 'admin'],
    layout: 'sidebar'
})

// Redireciona automaticamente para a página de usuários
await navigateTo('/admin/usuarios')
</script>

<template>
    <div>
        <p>Redirecionando...</p>
    </div>
</template>
