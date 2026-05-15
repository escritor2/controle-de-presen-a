<script setup lang="ts">
definePageMeta({
    middleware: ['auth'],
    layout: 'sidebar'
})

const { data: turmas, pending } = await useFetch<any[]>('/api/professor/turmas')
const { user } = useAuth()
</script>

<template>
    <div class="space-y-8">
        <div class="flex justify-between items-end">
            <div>
                <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Suas Turmas</h1>
                <p class="text-gray-500 dark:text-gray-400 mt-1">Bem-vindo, Professor. Selecione uma turma para gerenciar a frequência.</p>
            </div>
            <div class="hidden md:block">
                <UBadge color="primary" variant="soft" size="lg" class="px-4 py-2">
                    <UIcon name="i-heroicons-calendar" class="mr-2" />
                    {{ new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) }}
                </UBadge>
            </div>
        </div>

        <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UCard v-for="i in 3" :key="i" class="animate-pulse">
                <div class="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4"></div>
                <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
            </UCard>
        </div>

        <div v-else-if="turmas?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UCard
                v-for="turma in turmas"
                :key="turma.id"
                class="hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group border-transparent hover:border-primary-500"
                @click="navigateTo(`/dashboard/turma/${turma.id}`)"
            >
                <div class="flex flex-col h-full">
                    <div class="flex items-start justify-between mb-4">
                        <UBadge color="error" variant="subtle" class="font-bold tracking-wider">
                            {{ turma.curso.nome }}
                        </UBadge>
                        <UIcon name="i-heroicons-chevron-right" class="text-gray-300 group-hover:text-primary-500 transition-colors" />
                    </div>
                    
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">
                        {{ turma.nome }}
                    </h3>
                    <p class="text-sm text-gray-500 flex items-center gap-1">
                        <UIcon name="i-heroicons-hashtag" />
                        {{ turma.codigo }} • {{ turma.periodo }}
                    </p>

                    <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div class="flex items-center gap-2 text-xs text-gray-400">
                            <UIcon name="i-heroicons-clock" />
                            <span>Aulas hoje</span>
                        </div>
                        <UButton variant="ghost" color="primary" size="xs" trailing-icon="i-heroicons-arrow-right">
                            Abrir Chamada
                        </UButton>
                    </div>
                </div>
            </UCard>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <div class="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <UIcon name="i-heroicons-folder-open" class="text-4xl text-gray-300" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhuma turma encontrada</h3>
            <p class="text-gray-500 text-center max-w-xs">
                Você não possui turmas vinculadas ao seu perfil no momento. Entre em contato com a secretaria.
            </p>
        </div>
    </div>
</template>
