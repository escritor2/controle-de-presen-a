<script setup lang="ts">
definePageMeta({
    middleware: ['auth', 'admin'],
    layout: 'sidebar'
})

const { data: stats, pending } = await useFetch('/api/admin/stats')

const cards = computed(() => [
    { label: 'Total de Alunos', value: stats.value?.totalAlunos || 0, icon: 'i-heroicons-user-group', color: 'primary' as const, trend: '+5% este mês' },
    { label: 'Turmas Ativas', value: stats.value?.totalTurmas || 0, icon: 'i-heroicons-rectangle-stack', color: 'error' as const, trend: 'Estável' },
    { label: 'Corpo Docente', value: stats.value?.totalProfessores || 0, icon: 'i-heroicons-academic-cap', color: 'success' as const, trend: '2 novos' },
    { label: 'Empresas Parceiras', value: stats.value?.totalEmpresas || 0, icon: 'i-heroicons-building-office-2', color: 'warning' as const, trend: '+1 este mês' }
])

const shortcuts = [
    { label: 'Cadastrar Aluno', to: '/admin/alunos', icon: 'i-heroicons-user-plus', color: 'primary' as const },
    { label: 'Criar Nova Turma', to: '/admin/turmas', icon: 'i-heroicons-plus-circle', color: 'error' as const },
    { label: 'Gerenciar Cursos', to: '/admin/cursos', icon: 'i-heroicons-book-open', color: 'neutral' as const }
]
</script>

<template>
    <div class="space-y-8">
        <div>
            <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Painel de Controle</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Bem-vindo de volta! Aqui está o resumo do sistema.</p>
        </div>

        <!-- Estatísticas Rápidas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UCard v-for="card in cards" :key="card.label" class="overflow-hidden relative group hover:ring-2 hover:ring-primary-500 transition-all">
                <div class="flex items-center gap-4">
                    <div :class="[`p-3 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-950 text-${card.color}-600 dark:text-${card.color}-400 group-hover:scale-110 transition-transform`]">
                        <UIcon :name="card.icon" class="text-2xl" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ card.label }}</p>
                        <p class="text-2xl font-bold text-gray-900 dark:text-white">
                            <USkeleton v-if="pending" class="h-8 w-16" />
                            <span v-else>{{ card.value }}</span>
                        </p>
                    </div>
                </div>
                <div class="mt-4 flex items-center text-xs">
                    <span class="text-green-500 font-medium mr-1">{{ card.trend }}</span>
                </div>
                <!-- Efeito Visual de Fundo -->
                <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <UIcon :name="card.icon" class="text-8xl" />
                </div>
            </UCard>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Turmas Populares -->
            <UCard class="lg:col-span-2">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="font-bold text-gray-900 dark:text-white">Turmas com Mais Alunos</h3>
                        <UButton to="/admin/turmas" variant="link" size="xs" color="neutral">Ver todas</UButton>
                    </div>
                </template>

                <div class="space-y-4">
                    <div v-for="turma in stats?.turmasPopulares" :key="turma.id" class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 font-bold">
                                {{ turma.codigo.substring(0, 2) }}
                            </div>
                            <div>
                                <p class="font-bold text-gray-900 dark:text-white text-sm">{{ turma.nome }}</p>
                                <p class="text-xs text-gray-500">{{ turma.curso.nome }}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-gray-900 dark:text-white">{{ turma._count.alunos }}</p>
                            <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Alunos</p>
                        </div>
                    </div>
                    <div v-if="!stats?.turmasPopulares?.length && !pending" class="text-center py-8 text-gray-400 italic">
                        Nenhuma turma encontrada.
                    </div>
                </div>
            </UCard>

            <!-- Acessos Rápidos -->
            <UCard>
                <template #header>
                    <h3 class="font-bold text-gray-900 dark:text-white">Ações Frequentes</h3>
                </template>
                <div class="grid grid-cols-1 gap-3">
                    <UButton
                        v-for="item in shortcuts"
                        :key="item.label"
                        :to="item.to"
                        :icon="item.icon"
                        :color="item.color"
                        variant="soft"
                        class="justify-start py-3"
                    >
                        {{ item.label }}
                    </UButton>
                </div>
            </UCard>
        </div>
    </div>
</template>