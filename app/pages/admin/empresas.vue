<script setup lang="ts">

definePageMeta({
    middleware: ['auth', 'admin'],
    layout: 'sidebar'
})

const { data: empresas, refresh } = await useFetch('/api/empresas')

const colunas = [
    { id: 'nome', header: 'Nome da Empresa' },
    { id: 'cnpj', header: 'CNPJ' },
    { id: 'alunos', header: 'Alunos' },
    { id: 'acoes', header: 'Ações' }
] as any

const isOpen = ref(false)
const empresaEditando = ref<any>(null)
const novaEmpresa = ref({
    nome: '',
    cnpj: ''
})

const carregando = ref(false)
const toast = useToast()

function abrirModal(empresa: any = null) {
    if (empresa) {
        empresaEditando.value = empresa
        novaEmpresa.value = { 
            nome: empresa.nome,
            cnpj: empresa.cnpj || ''
        }
    } else {
        empresaEditando.value = null
        novaEmpresa.value = { nome: '', cnpj: '' }
    }
    isOpen.value = true
}

async function salvarEmpresa() {
    if (!novaEmpresa.value.nome) {
        toast.add({ title: 'Atenção', description: 'Preencha o nome da empresa', color: 'warning' })
        return
    }

    carregando.value = true
    try {
        if (empresaEditando.value) {
            await $fetch(`/api/empresas/${empresaEditando.value.id}`, {
                method: 'PATCH',
                body: novaEmpresa.value
            })
            toast.add({ title: 'Sucesso', description: 'Empresa atualizada', color: 'success' })
        } else {
            await $fetch('/api/empresas', {
                method: 'POST',
                body: novaEmpresa.value
            })
            toast.add({ title: 'Sucesso', description: 'Empresa criada', color: 'success' })
        }
        isOpen.value = false
        await refresh()
    } catch (err: any) {
        toast.add({ title: 'Erro', description: err.data?.statusMessage || 'Erro ao salvar empresa', color: 'error' })
    } finally {
        carregando.value = false
    }
}

async function excluirEmpresa(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return
    
    try {
        await $fetch(`/api/empresas/${id}`, { method: 'DELETE' })
        await refresh()
        toast.add({ title: 'Sucesso', description: 'Empresa removida', color: 'success' })
    } catch (err: any) {
        toast.add({ title: 'Erro', description: err.data?.statusMessage || 'Erro ao remover empresa', color: 'error' })
    }
}

watch(() => novaEmpresa.value.cnpj, (newVal) => {
    if (newVal) {
        novaEmpresa.value.cnpj = formatCNPJ(newVal)
    }
})
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Empresas</h1>
                <p class="text-gray-500 dark:text-gray-400">Administre as empresas parceiras vinculadas aos alunos.</p>
            </div>
            <UButton icon="i-heroicons-plus" color="error" @click="abrirModal()">
                Nova Empresa
            </UButton>
        </div>

        <UCard>
            <UTable :columns="colunas" :data="empresas || []">
                <template #nome-cell="{ row }">
                    <span class="font-medium text-gray-900 dark:text-white">{{ row.original.nome }}</span>
                </template>

                <template #cnpj-cell="{ row }">
                    <span class="text-gray-500">{{ row.original.cnpj || '---' }}</span>
                </template>

                <template #alunos-cell="{ row }">
                    <UBadge color="neutral" variant="soft">
                        {{ row.original._count?.alunos || 0 }} alunos
                    </UBadge>
                </template>

                <template #acoes-cell="{ row }">
                    <div class="flex gap-2">
                        <UButton
                            icon="i-heroicons-pencil-square"
                            color="neutral"
                            variant="ghost"
                            size="xs"
                            @click="abrirModal(row.original)"
                        />
                        <UButton
                            icon="i-heroicons-trash"
                            color="error"
                            variant="ghost"
                            size="xs"
                            @click="excluirEmpresa(row.original.id)"
                        />
                    </div>
                </template>
            </UTable>
        </UCard>

        <!-- Modal Empresa -->
        <UModal v-model:open="isOpen" :title="empresaEditando ? 'Editar Empresa' : 'Nova Empresa'">
            <template #body>
                <div class="space-y-4">
                    <UFormField label="Nome da Empresa" name="nome">
                        <UInput v-model="novaEmpresa.nome" placeholder="Ex: SENAI SP" class="w-full" maxlength="100" />
                    </UFormField>

                    <UFormField label="CNPJ (Opcional)" name="cnpj">
                        <UInput v-model="novaEmpresa.cnpj" placeholder="00.000.000/0000-00" class="w-full" maxlength="18" />
                    </UFormField>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton color="neutral" variant="ghost" @click="isOpen = false">Cancelar</UButton>
                    <UButton color="error" :loading="carregando" @click="salvarEmpresa">Salvar</UButton>
                </div>
            </template>
        </UModal>
    </div>
</template>
