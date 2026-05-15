<script setup lang="ts">
const { user } = useAuth()

// Redirecionamento imediato
if (user.value) {
    if (user.value.role === 'ADMIN') {
        navigateTo('/admin/usuarios')
    } else {
        navigateTo('/dashboard')
    }
} else {
    navigateTo('/auth/login')
}
</script>

<template>
  <div />
</template>
