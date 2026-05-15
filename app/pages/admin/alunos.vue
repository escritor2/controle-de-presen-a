<script setup lang="ts">

definePageMeta({
    middleware: ['auth', 'admin'],
    layout: 'sidebar'
})

const busca = ref('')
const { data: alunos, refresh, pending } = await useFetch('/api/alunos', {
    query: { search: busca }
})
const { data: empresas } = await useFetch('/api/empresas')
const { data: turmasDisponiveis } = await useFetch<any[]>('/api/turmas')

const colunas = [
    { id: 'nome', header: 'Nome' },
    { id: 'matricula', header: 'Matrícula/RM' },
    { id: 'empresa', header: 'Empresa' },
    { id: 'turmas', header: 'Turmas' },
    { id: 'acoes', header: 'Ações' }
] as any

const isOpen = ref(false)
const alunoEditando = ref<any>(null)
const novoAluno = ref({
    nome: '',
    matricula: '',
    empresaId: null as string | null
})

// Gerenciamento de Turmas no Modal
const turmasSelecionadas = ref<any[]>([])
const turmaParaAdicionar = ref<string | null>(null)
const subturmaParaAdicionar = ref('GERAL')

const carregando = ref(false)
const toast = useToast()

function abrirModal(aluno: any = null) {
    if (aluno) {
        alunoEditando.value = aluno
        novoAluno.value = { 
            nome: aluno.nome,
            matricula: aluno.matricula,
            empresaId: aluno.empresaId
        }
        // Carrega turmas já vinculadas
        turmasSelecionadas.value = (aluno.turmas || []).map((t: any) => ({
            turmaId: t.turmaId,
            nome: t.turma.nome,
            codigo: t.turma.codigo,
            subturma: t.subturma
        }))
    } else {
        alunoEditando.value = null
        novoAluno.value = { nome: '', matricula: '', empresaId: null }
        turmasSelecionadas.value = []
    }
    turmaParaAdicionar.value = null
    subturmaParaAdicionar.value = 'GERAL'
    isOpen.value = true
}

function adicionarTurma() {
    if (!turmaParaAdicionar.value) return
    
    const jaExiste = turmasSelecionadas.value.find(t => t.turmaId === turmaParaAdicionar.value)
    if (jaExiste) {
        toast.add({ title: 'Atenção', description: 'Este aluno já está vinculado a esta turma', color: 'warning' })
        return
    }

    const turma = turmasDisponiveis.value?.find(t => t.id === turmaParaAdicionar.value)
    if (turma) {
        turmasSelecionadas.value.push({
            turmaId: turma.id,
            nome: turma.nome,
            codigo: turma.codigo,
            subturma: subturmaParaAdicionar.value
        })
    }
    turmaParaAdicionar.value = null
}

function removerTurma(turmaId: string) {
    turmasSelecionadas.value = turmasSelecionadas.value.filter(t => t.turmaId !== turmaId)
}

async function salvarAluno() {
    if (!novoAluno.value.nome || !novoAluno.value.matricula) {
        toast.add({ title: 'Atenção', description: 'Nome e Matrícula são obrigatórios', color: 'warning' })
        return
    }

    carregando.value = true
    const payload = {
        ...novoAluno.value,
        turmas: turmasSelecionadas.value.map(t => ({
            turmaId: t.turmaId,
            subturma: t.subturma
        }))
    }

    try {
        if (alunoEditando.value) {
            await $fetch(`/api/alunos/${alunoEditando.value.id}`, {
                method: 'PATCH',
                body: payload
            })
            toast.add({ title: 'Sucesso', description: 'Aluno atualizado', color: 'success' })
        } else {
            await $fetch('/api/alunos', {
                method: 'POST',
                body: payload
            })
            toast.add({ title: 'Sucesso', description: 'Aluno criado', color: 'success' })
        }
        isOpen.value = false
        await refresh()
    } catch (err: any) {
        toast.add({ title: 'Erro', description: err.data?.statusMessage || 'Erro ao salvar aluno', color: 'error' })
    } finally {
        carregando.value = false
    }
}

async function excluirAluno(id: string) {
    if (!confirm('Tem certeza que deseja excluir este aluno? Todos os registros de frequência serão perdidos.')) return
    
    try {
        await $fetch(`/api/alunos/${id}`, { method: 'DELETE' })
        await refresh()
        toast.add({ title: 'Sucesso', description: 'Aluno removido', color: 'success' })
    } catch (err: any) {
        toast.add({ title: 'Erro', description: err.data?.statusMessage || 'Erro ao remover aluno', color: 'error' })
    }
}

watch(() => novoAluno.value.matricula, (val) => {
    if (val) novoAluno.value.matricula = val.replace(/\D/g, '')
})

const listaEmpresas = computed(() => {
    const items = (empresas.value || []).map((e: any) => ({ label: e.nome, value: e.id }))
    return [{ label: 'Nenhuma', value: null }, ...items]
})

const listaTurmasItems = computed(() => {
    return (turmasDisponiveis.value || []).map((t: any) => ({ label: `${t.codigo} - ${t.nome}`, value: t.id }))
})
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Alunos</h1>
                <p class="text-gray-500 dark:text-gray-400">Cadastro central de alunos do sistema.</p>
            </div>
            <UButton icon="i-heroicons-plus" color="error" @click="abrirModal()">
                Novo Aluno
            </UButton>
        </div>

        <div class="mb-6">
            <UInput
                v-model="busca"
                icon="i-heroicons-magnifying-glass"
                placeholder="Buscar por nome ou matrícula..."
                class="max-w-md"
            />
        </div>

        <UCard>
            <UTable :columns="colunas" :data="alunos || []" :loading="pending">
                <template #nome-cell="{ row }">
                    <div class="flex flex-col">
                        <span class="font-medium text-gray-900 dark:text-white">{{ row.original.nome }}</span>
                        <span class="text-xs text-gray-500 md:hidden">{{ row.original.matricula }}</span>
                    </div>
                </template>

                <template #matricula-cell="{ row }">
                    <span class="text-gray-600 font-mono text-sm">{{ row.original.matricula }}</span>
                </template>

                <template #empresa-cell="{ row }">
                    <span v-if="row.original.empresa" class="text-primary-600 font-medium">
                        {{ row.original.empresa.nome }}
                    </span>
                    <span v-else class="text-gray-400 italic text-xs">Sem empresa</span>
                </template>

                <template #turmas-cell="{ row }">
                    <div class="flex flex-wrap gap-1">
                        <UBadge v-for="t in row.original.turmas" :key="t.turma.id" size="xs" variant="soft" color="neutral">
                            {{ t.turma.codigo }} {{ t.subturma !== 'GERAL' ? `(${t.subturma})` : '' }}
                        </UBadge>
                        <span v-if="!row.original.turmas?.length" class="text-gray-400 text-xs">Nenhuma</span>
                    </div>
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
                            @click="excluirAluno(row.original.id)"
                        />
                    </div>
                </template>
            </UTable>
        </UCard>

        <!-- Modal Aluno -->
        <UModal v-model:open="isOpen" :title="alunoEditando ? 'Editar Aluno' : 'Novo Aluno'" :ui="{ content: 'sm:max-w-lg' }">
            <template #body>
                <div class="space-y-6">
                    <!-- Dados Básicos -->
                    <div class="grid grid-cols-1 gap-4">
                        <UFormField label="Nome Completo" name="nome">
                            <UInput v-model="novoAluno.nome" placeholder="Nome do Aluno" class="w-full" maxlength="100" />
                        </UFormField>

                        <div class="grid grid-cols-2 gap-4">
                            <UFormField label="Matrícula / RM" name="matricula" :description="alunoEditando ? 'Não editável após cadastro.' : ''">
                                <UInput v-model="novoAluno.matricula" :disabled="!!alunoEditando" placeholder="Ex: 2024001" class="w-full" maxlength="20" />
                            </UFormField>

                            <UFormField label="Empresa Vinculada" name="empresa">
                                <USelect
                                    v-model="novoAluno.empresaId"
                                    :items="listaEmpresas"
                                    class="w-full"
                                />
                            </UFormField>
                        </div>
                    </div>

                    <UDivider label="Vínculo com Turmas" />

                    <!-- Gerenciamento de Turmas -->
                    <div class="space-y-3">
                        <div class="flex gap-2 items-end">
                            <div class="flex-1">
                                <UFormField label="Selecionar Turma" name="add-turma">
                                    <USelect
                                        v-model="turmaParaAdicionar"
                                        :items="listaTurmasItems"
                                        placeholder="Selecione uma turma"
                                        class="w-full"
                                    />
                                </UFormField>
                            </div>
                            <div class="w-24">
                                <UFormField label="Subturma" name="add-subturma">
                                    <USelect
                                        v-model="subturmaParaAdicionar"
                                        :items="['GERAL', 'A', 'B']"
                                        class="w-full"
                                    />
                                </UFormField>
                            </div>
                            <UButton icon="i-heroicons-plus" color="primary" @click="adicionarTurma" />
                        </div>

                        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 min-h-[60px] border border-gray-100 dark:border-gray-700">
                            <div v-if="turmasSelecionadas.length === 0" class="text-gray-400 text-xs text-center py-4 italic">
                                Nenhuma turma vinculada ainda.
                            </div>
                            <div v-else class="space-y-2">
                                <div v-for="t in turmasSelecionadas" :key="t.turmaId" class="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                                    <div class="flex items-center gap-2">
                                        <UBadge color="neutral" variant="soft" size="xs">{{ t.codigo }}</UBadge>
                                        <span class="text-sm font-medium">{{ t.nome }}</span>
                                        <UBadge v-if="t.subturma !== 'GERAL'" color="primary" variant="outline" size="xs">Sub {{ t.subturma }}</UBadge>
                                    </div>
                                    <UButton
                                        icon="i-heroicons-x-mark"
                                        color="error"
                                        variant="ghost"
                                        size="xs"
                                        @click="removerTurma(t.turmaId)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton color="neutral" variant="ghost" @click="isOpen = false">Cancelar</UButton>
                    <UButton color="error" :loading="carregando" @click="salvarAluno">Salvar Aluno</UButton>
                </div>
            </template>
        </UModal>
    </div>
</template>
