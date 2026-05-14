<script setup lang="ts">
const { user } = useAuth()

onMounted(async () => {
    if (user.value) {
        if (user.value.role === 'ADMIN') {
            await navigateTo('/admin')
        } else {
            await navigateTo('/dashboard')
        }
    } else {
        await navigateTo('/auth/login')
    }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl text-red-600 mb-4" />
        <p class="text-gray-500">Carregando sistema...</p>
    </div>
  </div>
</template>
