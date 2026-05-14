<script setup lang="ts">
definePageMeta({
    middleware: ['auth'],
    layout: 'sidebar'
})

const route = useRoute()

interface PresencaData {
    headers: string[]
    data: any[]
}

const { data: presenca, pending, error, refresh } = await useFetch<PresencaData>(`/api/turma/${route.params.id}/frequencia`, {
    // Atualiza a cada 30 segundos para "tempo real"
    refreshInterval: 30000
})

const { data: turma } = await useFetch(`/api/turmas/${route.params.id}`) // Precisaria de uma rota GET /api/turmas/[id]

const colunas = computed(() => {
    if (!presenca.value?.headers) return []
    return presenca.value.headers.map(h => ({ key: h, label: h }))
})

const handleRefresh = async () => {
    await refresh()
}
</script>

<template>
    <div>
        <div class="flex items-center gap-4 mb-8">
            <UButton icon="i-heroicons-arrow-left" color="neutral" variant="ghost" @click="navigateTo('/dashboard')" />
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Controle de Presença</h1>
                <p class="text-gray-500">Visualizando dados da planilha em tempo real.</p>
            </div>
            <div class="ml-auto">
                <UButton icon="i-heroicons-arrow-path" :loading="pending" color="neutral" variant="ghost" @click="handleRefresh">
                    Atualizar agora
                </UButton>
            </div>
        </div>

        <UAlert
            v-if="error"
            color="error"
            variant="soft"
            icon="i-heroicons-exclamation-triangle"
            title="Erro ao sincronizar"
            description="Não foi possível obter os dados da planilha. Verifique se ela está pública ou se o ID está correto."
        />

        <UCard v-else>
            <div class="overflow-x-auto">
                <UTable
                    :loading="pending"
                    :columns="colunas"
                    :rows="presenca?.data || []"
                >
                    <template v-for="header in presenca?.headers" :key="header" #[`${header}-data`]="{ row }">
                        <span :class="{
                            'text-green-600 font-bold': (row as any)[header] === 'P',
                            'text-red-600 font-bold': (row as any)[header] === 'F'
                        }">
                            {{ (row as any)[header] }}
                        </span>
                    </template>
                </UTable>
            </div>
        </UCard>
    </div>
</template>
