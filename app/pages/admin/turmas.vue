<script setup lang="ts">

definePageMeta({
    middleware: ['auth', 'admin'],
    layout: 'sidebar'
})

const { data: turmas, refresh } = await useFetch<any[]>('/api/turmas')
const { data: professores } = await useFetch<any[]>('/api/professores')
const { data: cursos } = await useFetch<any[]>('/api/cursos')

const colunas = [
    { id: 'codigo', header: 'Código' },
    { id: 'nome', header: 'Nome' },
    { id: 'curso_nome', header: 'Curso' },
    { id: 'disciplinas', header: 'Disciplinas (Professores)' },
    { id: 'spreadsheetId', header: 'Planilha ID' },
    { id: 'acoes', header: 'Ações' }
] as any

const isOpen = ref(false)
const isAddDisciplinaOpen = ref(false)
const isNovaTurmaOpen = ref(false)
const turmaSelecionada = ref<any>(null)
const spreadsheetId = ref('')
const novaDisciplina = ref({ nome: '', professorId: '' })
const novaTurma = ref({ nome: '', codigo: '', periodo: 'Manhã', termo: 1, cursoId: '' })

const carregando = ref(false)
const toast = useToast()

function abrirEdicao(row: any) {
    turmaSelecionada.value = row
    spreadsheetId.value = row.spreadsheetId || ''
    isOpen.value = true
}

function abrirAddDisciplina(row: any) {
    turmaSelecionada.value = row
    novaDisciplina.value = { nome: '', professorId: '' }
    isAddDisciplinaOpen.value = true
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

async function adicionarDisciplina() {
    if (!turmaSelecionada.value || !novaDisciplina.value.nome || !novaDisciplina.value.professorId) return

    carregando.value = true
    try {
        await $fetch(`/api/turmas/${turmaSelecionada.value.id}/disciplinas`, {
            method: 'POST',
            body: novaDisciplina.value
        })
        isAddDisciplinaOpen.value = false
        await refresh()
        toast.add({ title: 'Sucesso', description: 'Disciplina e Professor vinculados', color: 'success' })
    } catch (err) {
        toast.add({ title: 'Erro', description: 'Erro ao vincular disciplina', color: 'error' })
    } finally {
        carregando.value = false
    }
}

async function criarTurma() {
    if (!novaTurma.value.nome || !novaTurma.value.codigo || !novaTurma.value.cursoId) return

    carregando.value = true
    try {
        await $fetch('/api/turmas', {
            method: 'POST',
            body: novaTurma.value
        })
        isNovaTurmaOpen.value = false
        novaTurma.value = { nome: '', codigo: '', periodo: 'Manhã', termo: 1, cursoId: '' }
        await refresh()
        toast.add({ title: 'Sucesso', description: 'Turma criada com sucesso', color: 'success' })
    } catch (err: any) {
        toast.add({ title: 'Erro', description: err.data?.statusMessage || 'Erro ao criar turma', color: 'error' })
    } finally {
        carregando.value = false
    }
}

async function inicializarPlanilha() {
    if (!turmaSelecionada.value || !turmaSelecionada.value.spreadsheetId) {
        toast.add({ title: 'Atenção', description: 'Vincule uma planilha primeiro', color: 'warning' })
        return
    }

    if (!confirm('Isso irá apagar o conteúdo atual da planilha e criar a lista de alunos do sistema. Continuar?')) return

    carregando.value = true
    try {
        const res: any = await $fetch(`/api/turmas/${turmaSelecionada.value.id}/init-sheet`, { method: 'POST' })
        
        if (res.result === 'error') {
            toast.add({ title: 'Erro no Google', description: res.message || 'Erro desconhecido', color: 'error' })
        } else {
            toast.add({ title: 'Sucesso', description: 'Planilha inicializada com os alunos!', color: 'success' })
        }
    } catch (err: any) {
        toast.add({ title: 'Erro', description: err.data?.statusMessage || 'Erro ao inicializar planilha', color: 'error' })
    } finally {
        carregando.value = false
    }
}

function baixarModelo() {
    const hoje = new Date()
    let colunas = ['Matricula', 'Nome']
    
    // Adiciona 10 dias úteis como exemplo
    let dias = 0
    let cursor = 0
    while (dias < 10) {
        const d = new Date()
        d.setDate(hoje.getDate() + cursor)
        if (d.getDay() !== 0 && d.getDay() !== 6) {
            colunas.push(`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`)
            dias++
        }
        cursor++
    }

    const csvContent = colunas.join(',') + '\n' + '12345,Aluno Exemplo,P,P,P,P,P,P,P,P,P,P'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'modelo_presenca.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

watch(() => novaTurma.value.codigo, (newVal) => {
    if (newVal) {
        novaTurma.value.codigo = formatCodigoTurma(newVal)
    }
})

watch(() => novaTurma.value.termo, (newVal: any) => {
    if (typeof newVal === 'string') {
        novaTurma.value.termo = parseInt(newVal.replace(/\D/g, '')) || 1
    }
})
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Turmas</h1>
                <p class="text-gray-500 dark:text-gray-400">Vincule as turmas às planilhas do Google Sheets.</p>
            </div>
            <div class="flex gap-2">
                <UButton icon="i-heroicons-document-arrow-down" color="neutral" variant="outline" @click="baixarModelo">
                    Baixar Modelo CSV
                </UButton>
                <UButton icon="i-heroicons-plus" color="error" @click="isNovaTurmaOpen = true">
                    Nova Turma
                </UButton>
            </div>
        </div>

        <UCard>
            <UTable :columns="colunas" :data="turmas || []">
                <template #curso_nome-cell="{ row }">
                    {{ row.original.curso?.nome }}
                </template>

                <template #disciplinas-cell="{ row }">
                    <div class="flex flex-col gap-1">
                        <div v-for="d in row.original.disciplinas" :key="d.id" class="text-sm">
                            <span class="font-medium text-red-600">{{ d.nome }}:</span>
                            <span class="text-gray-600"> {{ d.professor.nome }}</span>
                        </div>
                        <UButton
                            v-if="!row.original.disciplinas?.length"
                            label="Atribuir Professor"
                            icon="i-heroicons-user-plus"
                            color="error"
                            variant="link"
                            size="xs"
                            @click="abrirAddDisciplina(row.original)"
                        />
                        <UButton
                            v-else
                            icon="i-heroicons-plus"
                            color="neutral"
                            variant="ghost"
                            size="xs"
                            @click="abrirAddDisciplina(row.original)"
                        />
                    </div>
                </template>

                <template #spreadsheetId-cell="{ row }">
                    <code v-if="row.original.spreadsheetId" class="text-xs bg-gray-100 p-1 rounded">{{ row.original.spreadsheetId }}</code>
                    <span v-else class="text-gray-400 italic">Não vinculado</span>
                </template>

                <template #acoes-cell="{ row }">
                    <div class="flex gap-2">
                        <UButton
                            icon="i-heroicons-pencil-square"
                            color="neutral"
                            variant="ghost"
                            size="xs"
                            @click="abrirEdicao(row.original)"
                        />
                    </div>
                </template>
            </UTable>
        </UCard>

        <!-- Modal Editar Planilha -->
        <UModal v-model:open="isOpen" title="Vincular Planilha" :description="`Insira o ID da planilha do Google Sheets para a turma ${turmaSelecionada?.nome}`">
            <template #body>
                <div class="space-y-4">
                    <UFormField label="Google Sheet ID" name="spreadsheetId">
                        <UInput v-model="spreadsheetId" placeholder="ex: 1BxiMVs0XRA5nFMdKvBdBAngmUUq-j1991AAD96GvW-g" class="w-full" />
                    </UFormField>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-between w-full">
                    <UButton 
                        v-if="spreadsheetId" 
                        label="Exportar Alunos para Google" 
                        icon="i-heroicons-cloud-arrow-up" 
                        color="primary" 
                        variant="soft" 
                        :loading="carregando"
                        @click="inicializarPlanilha"
                    />
                    <div class="flex gap-2">
                        <UButton color="neutral" variant="ghost" @click="isOpen = false">Cancelar</UButton>
                        <UButton color="error" :loading="carregando" @click="salvarPlanilha">Salvar Vínculo</UButton>
                    </div>
                </div>
            </template>
        </UModal>

        <!-- Modal Adicionar Disciplina/Professor -->
        <UModal v-model:open="isAddDisciplinaOpen" title="Atribuir Professor à Turma" description="Defina a disciplina e o professor responsável.">
            <template #body>
                <div class="space-y-4">
                    <UFormField label="Nome da Disciplina" name="disciplina">
                        <UInput v-model="novaDisciplina.nome" placeholder="ex: Matemática, Oficina..." class="w-full" />
                    </UFormField>

                    <UFormField label="Selecionar Professor" name="professor">
                        <USelect
                            v-model="novaDisciplina.professorId"
                            :items="professores?.map(p => ({ label: p.nome, value: p.id })) || []"
                            placeholder="Selecione um professor"
                            class="w-full"
                        />
                    </UFormField>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton color="neutral" variant="ghost" @click="isAddDisciplinaOpen = false">Cancelar</UButton>
                    <UButton color="error" :loading="carregando" @click="adicionarDisciplina">Vincular Professor</UButton>
                </div>
            </template>
        </UModal>

        <!-- Modal Nova Turma -->
        <UModal v-model:open="isNovaTurmaOpen" title="Nova Turma" description="Cadastre uma nova turma no sistema.">
            <template #body>
                <div class="grid grid-cols-2 gap-4">
                    <UFormField label="Nome da Turma" name="nome" class="col-span-2">
                        <UInput v-model="novaTurma.nome" placeholder="ex: Desenvolvimento de Sistemas A" class="w-full" maxlength="100" />
                    </UFormField>

                    <UFormField label="Código" name="codigo">
                        <UInput v-model="novaTurma.codigo" placeholder="ex: 101, 202..." class="w-full" maxlength="15" />
                    </UFormField>

                    <UFormField label="Termo/Semestre" name="termo">
                        <UInput v-model.number="novaTurma.termo" type="number" class="w-full" />
                    </UFormField>

                    <UFormField label="Período" name="periodo">
                        <USelect
                            v-model="novaTurma.periodo"
                            :items="['Manhã', 'Tarde', 'Noite']"
                            class="w-full"
                        />
                    </UFormField>

                    <UFormField label="Curso" name="curso">
                        <USelect
                            v-model="novaTurma.cursoId"
                            :items="cursos?.map(c => ({ label: c.nome, value: c.id })) || []"
                            placeholder="Selecione o curso"
                            class="w-full"
                        />
                    </UFormField>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton color="neutral" variant="ghost" @click="isNovaTurmaOpen = false">Cancelar</UButton>
                    <UButton color="error" :loading="carregando" @click="criarTurma">Criar Turma</UButton>
                </div>
            </template>
        </UModal>
    </div>
</template>
