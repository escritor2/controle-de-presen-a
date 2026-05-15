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

const { data: presenca, pending, error, refresh } = await useFetch<PresencaData>(`/api/turma/${route.params.id}/frequencia`)

const { data: turma } = await useFetch(`/api/turmas/${route.params.id}`)

const colunas = computed(() => {
    if (!presenca.value?.headers) return []
    return presenca.value.headers.map((h: string) => ({ id: h, header: h })) as any
})

const syncLoading = ref(false)
const toast = useToast()

const handleRefresh = async () => {
    await refresh()
}

const handleSync = async () => {
    syncLoading.value = true
    try {
        await $fetch(`/api/turma/${route.params.id}/sync`, { method: 'POST' })
        toast.add({ title: 'Sucesso', description: 'Banco de dados sincronizado!', color: 'success' })
        await refresh()
    } catch (err: any) {
        toast.add({ title: 'Erro', description: err.data?.statusMessage || 'Erro ao sincronizar', color: 'error' })
    } finally {
        syncLoading.value = false
    }
}
</script>

<template>
    <div>
        <div class="flex items-center gap-4 mb-8">
            <UButton icon="i-heroicons-arrow-left" color="neutral" variant="ghost" @click="navigateTo('/dashboard')" />
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ (turma as any)?.nome || 'Controle de Presença' }}</h1>
                <p class="text-gray-500">Dados da planilha em tempo real.</p>
            </div>
            <div class="ml-auto flex gap-2">
                <UButton 
                    icon="i-heroicons-arrow-path-rounded-square" 
                    :loading="syncLoading" 
                    color="error" 
                    @click="handleSync"
                >
                    Sincronizar SQL
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
                    :data="presenca?.data || []"
                >
                    <template v-for="header in presenca?.headers" :key="header" #[`${header}-cell`]="{ row }">
                        <span :class="{
                            'text-green-600 font-bold': row.original[header] === 'P',
                            'text-red-600 font-bold': row.original[header] === 'F'
                        }">
                            {{ row.original[header] }}
                        </span>
                    </template>
                </UTable>
            </div>
        </UCard>
    </div>
</template>
