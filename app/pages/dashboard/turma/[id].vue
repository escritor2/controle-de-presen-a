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

const { data: presenca, pending, error, refresh } = await useFetch<PresencaData>(`/api/turmas/${route.params.id}/frequencia`)
const { data: turma } = await useFetch(`/api/turmas/${route.params.id}`)

// Transformamos os headers em colunas seguras (trocando / por _)
const colunas = computed(() => {
    if (!presenca.value?.headers) return []
    return presenca.value.headers.map((h: string) => ({ 
        id: h.replace(/\//g, '_'), // ID seguro para slots
        header: h,                 // O UTable v4 usa 'header' para o texto da coluna
        originalHeader: h          // Guardamos o original para a API
    })) as any
})

const syncLoading = ref(false)
const toast = useToast()

const handleSync = async () => {
    syncLoading.value = true
    try {
        const res: any = await $fetch(`/api/turmas/${route.params.id}/sync`, { method: 'POST' })
        toast.add({ title: 'Sucesso', description: res.message || 'Banco de dados sincronizado!', color: 'success' })
        await refresh()
    } catch (err: any) {
        toast.add({ title: 'Erro', description: err.data?.statusMessage || 'Erro ao sincronizar', color: 'error' })
    } finally {
        syncLoading.value = false
    }
}

async function togglePresenca(row: any, originalHeader: string) {
    if (originalHeader === 'Nome' || originalHeader === 'Matricula') return

    const atual = row[originalHeader]
    
    // Converte para número, assumindo 0 se for vazio ou '-'
    let faltasNum = 0
    if (atual !== undefined && atual !== '-' && atual !== null) {
        faltasNum = Number(atual)
        if (isNaN(faltasNum)) faltasNum = 0
    }

    // Ciclo de faltas: 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 0
    const novoStatus = faltasNum >= 5 ? 0 : faltasNum + 1
    
    // Atualização otimista na UI
    row[originalHeader] = novoStatus

    try {
        await $fetch(`/api/turmas/${route.params.id}/frequencia`, {
            method: 'POST',
            body: {
                alunoId: row.id,
                data: originalHeader,
                faltas: novoStatus
            }
        })
        toast.add({ title: 'Atualizado', description: `Faltas de ${row.Nome} no dia alteradas para ${novoStatus}`, color: 'success', duration: 2000 })
    } catch (err: any) {
        row[originalHeader] = atual
        toast.add({ title: 'Erro', description: err.data?.statusMessage || err.data?.message || err.message || 'Não foi possível salvar a presença', color: 'error' })
        console.error("Erro ao salvar:", err.data)
    }
}
</script>

<template>
    <div>
        <div class="flex items-center gap-4 mb-8">
            <UButton icon="i-heroicons-arrow-left" color="neutral" variant="ghost" @click="navigateTo('/dashboard')" />
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ (turma as any)?.nome || 'Controle de Presença' }}</h1>
                <p class="text-gray-500">Gestão de frequência da turma.</p>
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
            title="Erro ao carregar dados"
            :description="error.data?.statusMessage || error.message || 'Verifique a conexão ou se a planilha está vinculada corretamente.'"
        />

        <UCard v-else>
            <div class="overflow-x-auto">
                <UTable
                    :loading="pending"
                    :columns="colunas"
                    :data="presenca?.data || []"
                >
                    <!-- Criamos slots dinâmicos usando os IDs seguros (com underline) -->
                    <template v-for="col in colunas" :key="col.id" #[`${col.id}-cell`]="{ row }">
                        <div 
                            v-if="col.originalHeader !== 'Nome' && col.originalHeader !== 'Matricula'"
                            class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded text-center transition-colors min-w-[50px]"
                            @click="togglePresenca(row.original, col.originalHeader)"
                        >
                            <span :class="{
                                'text-green-600 font-bold': row.original[col.originalHeader] === 0,
                                'text-amber-500 font-bold': row.original[col.originalHeader] > 0 && row.original[col.originalHeader] < 5,
                                'text-red-600 font-bold': row.original[col.originalHeader] === 5,
                                'text-gray-400 italic text-xs': row.original[col.originalHeader] === undefined || row.original[col.originalHeader] === null || row.original[col.originalHeader] === '-'
                            }">
                                {{ (row.original[col.originalHeader] !== undefined && row.original[col.originalHeader] !== null) ? row.original[col.originalHeader] : '-' }}
                            </span>
                        </div>
                        <div v-else class="p-2">
                            <span :class="{'font-medium': col.id === 'Nome'}">
                                {{ row.original[col.originalHeader] }}
                            </span>
                        </div>
                    </template>
                </UTable>
            </div>
        </UCard>
    </div>
</template>
