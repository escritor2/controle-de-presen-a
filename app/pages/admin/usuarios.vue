<script setup lang="ts">
definePageMeta({
    middleware: ['auth', 'admin'],
    layout: 'sidebar'
})

const { data: usuarios, refresh } = await useFetch('/api/usuarios')

const colunas = [
    { key: 'email', label: 'E-mail' },
    { key: 'role', label: 'Cargo' },
    { key: 'createdAt', label: 'Criado em' },
    { key: 'acoes', label: 'Ações' }
]

const isOpen = ref(false)
const novoUsuario = ref({
    email: '',
    senha: '',
    role: 'PROFESSOR' as 'ADMIN' | 'PROFESSOR' | 'EMPRESA',
    nome: ''
})

const carregando = ref(false)
const toast = useToast()

async function criarUsuario() {
    if (!novoUsuario.value.email || !novoUsuario.value.senha) {
        toast.add({ title: 'Atenção', description: 'Preencha todos os campos obrigatórios', color: 'orange' })
        return
    }

    carregando.value = true
    try {
        await $fetch('/api/usuarios', {
            method: 'POST',
            body: novoUsuario.value
        })
        isOpen.value = false
        novoUsuario.value = { email: '', senha: '', role: 'PROFESSOR', nome: '' }
        await refresh()
        toast.add({ title: 'Sucesso', description: 'Usuário criado com sucesso', color: 'success' })
    } catch (err: any) {
        toast.add({ title: 'Erro', description: err.data?.statusMessage || 'Erro ao criar usuário', color: 'error' })
    } finally {
        carregando.value = false
    }
}

async function excluirUsuario(id: string) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    
    try {
        await $fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
        await refresh()
        toast.add({ title: 'Sucesso', description: 'Usuário removido', color: 'success' })
    } catch (err) {
        toast.add({ title: 'Erro', description: 'Erro ao remover usuário', color: 'error' })
    }
}

const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
}
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Usuários</h1>
                <p class="text-gray-500 dark:text-gray-400">Adicione ou remova professores e administradores.</p>
            </div>
            <UButton icon="i-heroicons-plus" color="error" @click="isOpen = true">
                Novo Usuário
            </UButton>
        </div>

        <UCard>
            <UTable :columns="colunas" :rows="usuarios?.usuarios || []">
                <template #email-data="{ row }">
                    <div class="flex items-center gap-2">
                        <UAvatar :alt="row.email" size="xs" />
                        <span>{{ row.email }}</span>
                    </div>
                </template>

                <template #role-data="{ row }">
                    <UBadge :color="row.role === 'ADMIN' ? 'error' : 'primary'" variant="soft">
                        {{ row.role }}
                    </UBadge>
                </template>

                <template #createdAt-data="{ row }">
                    {{ formatarData(row.createdAt) }}
                </template>

                <template #acoes-data="{ row }">
                    <UButton
                        icon="i-heroicons-trash"
                        color="error"
                        variant="ghost"
                        size="xs"
                        @click="excluirUsuario(row.id)"
                    />
                </template>
            </UTable>
        </UCard>

        <!-- Modal Novo Usuário -->
        <UModal v-model="isOpen">
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold">Novo Usuário</h3>
                        <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isOpen = false" />
                    </div>
                </template>

                <div class="space-y-4">
                    <UFormField label="Nome Completo" name="nome">
                        <UInput v-model="novoUsuario.nome" placeholder="Nome do Professor" />
                    </UFormField>

                    <UFormField label="E-mail" name="email">
                        <UInput v-model="novoUsuario.email" type="email" placeholder="email@senai.br" />
                    </UFormField>

                    <UFormField label="Senha" name="senha">
                        <UInput v-model="novoUsuario.senha" type="password" placeholder="Mínimo 6 caracteres" />
                    </UFormField>

                    <UFormField label="Cargo" name="role">
                        <USelect
                            v-model="novoUsuario.role"
                            :options="[
                                { label: 'Professor (Comum)', value: 'PROFESSOR' },
                                { label: 'Administrador', value: 'ADMIN' }
                            ]"
                        />
                    </UFormField>
                </div>

                <template #footer>
                    <div class="flex justify-end gap-2">
                        <UButton color="neutral" variant="ghost" @click="isOpen = false">Cancelar</UButton>
                        <UButton color="error" :loading="carregando" @click="criarUsuario">Salvar</UButton>
                    </div>
                </template>
            </UCard>
        </UModal>
    </div>
</template>
