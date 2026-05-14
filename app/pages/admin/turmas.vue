<script setup lang="ts">
definePageMeta({
    middleware: ['auth', 'admin'],
    layout: 'sidebar'
})

const { data: turmas, refresh } = await useFetch<any[]>('/api/turmas')

const colunas = [
    { key: 'codigo', label: 'Código' },
    { key: 'nome', label: 'Nome' },
    { key: 'curso.nome', label: 'Curso' },
    { key: 'professor', label: 'Professor' },
    { key: 'spreadsheetId', label: 'Planilha ID' },
    { key: 'acoes', label: 'Ações' }
]

const isOpen = ref(false)
const turmaSelecionada = ref<any>(null)
const spreadsheetId = ref('')
const carregando = ref(false)
const toast = useToast()

function abrirEdicao(row: any) {
    turmaSelecionada.value = row
    spreadsheetId.value = row.spreadsheetId || ''
    isOpen.value = true
}

async function salvarPlanilha() {
    if (!turmaSelecionada.value) return

    carregando.value = true
    try {
        await $fetch(`/api/turmas/${turmaSelecionada.value.id}`, {
            method: 'PATCH',
            body: { spreadsheetId: spreadsheetId.value }
        })
        isOpen.value = false
        await refresh()
        toast.add({ title: 'Sucesso', description: 'Vínculo com planilha atualizado', color: 'success' })
    } catch (err) {
        toast.add({ title: 'Erro', description: 'Erro ao atualizar planilha', color: 'error' })
    } finally {
        carregando.value = false
    }
}

const getProfessorName = (turma: any) => {
    return turma.disciplinas?.[0]?.professor?.nome || 'Nenhum'
}
</script>

<template>
    <div>
        <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Turmas</h1>
            <p class="text-gray-500 dark:text-gray-400">Vincule as turmas às planilhas do Google Sheets.</p>
        </div>

        <UCard>
            <UTable :columns="colunas" :rows="turmas || []">
                <template #professor-data="{ row }">
                    {{ getProfessorName(row) }}
                </template>

                <template #spreadsheetId-data="{ row }">
                    <code v-if="row.spreadsheetId" class="text-xs bg-gray-100 p-1 rounded">{{ row.spreadsheetId }}</code>
                    <span v-else class="text-gray-400 italic">Não vinculado</span>
                </template>

                <template #acoes-data="{ row }">
                    <UButton
                        icon="i-heroicons-pencil-square"
                        color="neutral"
                        variant="ghost"
                        size="xs"
                        @click="abrirEdicao(row)"
                    />
                </template>
            </UTable>
        </UCard>

        <!-- Modal Editar Planilha -->
        <UModal v-model="isOpen">
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold">Vincular Planilha</h3>
                        <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isOpen = false" />
                    </div>
                </template>

                <div class="space-y-4">
                    <p class="text-sm text-gray-500">
                        Insira o ID da planilha do Google Sheets para a turma <strong>{{ turmaSelecionada?.nome }}</strong>.
                    </p>
                    <UFormField label="Google Sheet ID" name="spreadsheetId">
                        <UInput v-model="spreadsheetId" placeholder="ex: 1BxiMVs0XRA5nFMdKvBdBAngmUUq-j1991AAD96GvW-g" />
                    </UFormField>
                </div>

                <template #footer>
                    <div class="flex justify-end gap-2">
                        <UButton color="neutral" variant="ghost" @click="isOpen = false">Cancelar</UButton>
                        <UButton color="error" :loading="carregando" @click="salvarPlanilha">Salvar Vínculo</UButton>
                    </div>
                </template>
            </UCard>
        </UModal>
    </div>
</template>
