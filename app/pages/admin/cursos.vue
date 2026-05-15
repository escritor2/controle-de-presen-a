<script setup lang="ts">

definePageMeta({
    middleware: ['auth', 'admin'],
    layout: 'sidebar'
})

const { data: cursos, refresh } = await useFetch('/api/cursos')

const colunas = [
    { id: 'nome', header: 'Nome do Curso' },
    { id: 'acoes', header: 'Ações' }
] as any

const isOpen = ref(false)
const cursoEditando = ref<any>(null)
const novoCurso = ref({
    nome: ''
})

const carregando = ref(false)
const toast = useToast()

function abrirModal(curso: any = null) {
    if (curso) {
        cursoEditando.value = curso
        novoCurso.value = { nome: curso.nome }
    } else {
        cursoEditando.value = null
        novoCurso.value = { nome: '' }
    }
    isOpen.value = true
}

async function salvarCurso() {
    if (!novoCurso.value.nome) {
        toast.add({ title: 'Atenção', description: 'Preencha o nome do curso', color: 'warning' })
        return
    }

    carregando.value = true
    try {
        if (cursoEditando.value) {
            await $fetch(`/api/cursos/${cursoEditando.value.id}`, {
                method: 'PATCH',
                body: novoCurso.value
            })
            toast.add({ title: 'Sucesso', description: 'Curso atualizado', color: 'success' })
        } else {
            await $fetch('/api/cursos', {
                method: 'POST',
                body: novoCurso.value
            })
            toast.add({ title: 'Sucesso', description: 'Curso criado', color: 'success' })
        }
        isOpen.value = false
        await refresh()
    } catch (err: any) {
        toast.add({ title: 'Erro', description: err.data?.statusMessage || 'Erro ao salvar curso', color: 'error' })
    } finally {
        carregando.value = false
    }
}

async function excluirCurso(id: string) {
    if (!confirm('Tem certeza que deseja excluir este curso? Todas as turmas vinculadas podem ser afetadas.')) return
    
    try {
        await $fetch(`/api/cursos/${id}`, { method: 'DELETE' })
        await refresh()
        toast.add({ title: 'Sucesso', description: 'Curso removido', color: 'success' })
    } catch (err: any) {
        toast.add({ title: 'Erro', description: err.data?.statusMessage || 'Erro ao remover curso', color: 'error' })
    }
}
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Cursos</h1>
                <p class="text-gray-500 dark:text-gray-400">Cadastre e organize os cursos da instituição.</p>
            </div>
            <UButton icon="i-heroicons-plus" color="error" @click="abrirModal()">
                Novo Curso
            </UButton>
        </div>

        <UCard>
            <UTable :columns="colunas" :data="cursos || []">
                <template #nome-cell="{ row }">
                    <span class="font-medium text-gray-900 dark:text-white">{{ row.original.nome }}</span>
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
                            @click="excluirCurso(row.original.id)"
                        />
                    </div>
                </template>
            </UTable>
        </UCard>

        <!-- Modal Curso -->
        <UModal v-model:open="isOpen" :title="cursoEditando ? 'Editar Curso' : 'Novo Curso'">
            <template #body>
                <div class="space-y-4">
                    <UFormField label="Nome do Curso" name="nome">
                        <UInput v-model="novoCurso.nome" placeholder="Ex: Técnico em Informática" class="w-full" />
                    </UFormField>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton color="neutral" variant="ghost" @click="isOpen = false">Cancelar</UButton>
                    <UButton color="error" :loading="carregando" @click="salvarCurso">Salvar</UButton>
                </div>
            </template>
        </UModal>
    </div>
</template>
