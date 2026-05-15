<script setup lang="ts">
definePageMeta({
    middleware: ['auth'],
    layout: 'sidebar'
})

const { data: turmas } = await useFetch('/api/professor/turmas')
</script>

<template>
    <div>
        <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Minhas Turmas</h1>
            <p class="text-gray-500 dark:text-gray-400">Selecione uma turma para visualizar a presença em tempo real.</p>
        </div>

        <div v-if="turmas?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UCard
                v-for="turma in turmas"
                :key="turma.id"
                class="hover:shadow-lg transition-shadow cursor-pointer"
                @click="navigateTo(`/dashboard/turma/${turma.id}`)"
            >
                <div class="flex items-start justify-between">
                    <div>
                        <UBadge color="error" variant="subtle" class="mb-2">{{ turma.curso.nome }}</UBadge>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ turma.nome }}</h3>
                        <p class="text-sm text-gray-500">{{ turma.codigo }} - {{ turma.periodo }}</p>
                    </div>
                    <UIcon name="i-heroicons-chevron-right" class="text-gray-400" />
                </div>
                
                <template #footer>
                    <div class="flex items-center gap-2 text-xs text-gray-400">
                        <UIcon name="i-heroicons-table-cells" />
                        <span>Sincronizado com Google Sheets</span>
                    </div>
                </template>
            </UCard>
        </div>

        <div v-else class="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300">
            <UIcon name="i-heroicons-folder-open" class="text-4xl text-gray-300 mb-4" />
            <p class="text-gray-500">Nenhuma turma vinculada ao seu perfil.</p>
        </div>
    </div>
</template>
