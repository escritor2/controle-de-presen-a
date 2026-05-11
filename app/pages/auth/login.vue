<script setup>
const estado = ref({
    email: '',
    senha: ''
})

const erroMsg = ref('')
const carregando = ref(false)

async function login() {
    carregando.value = true
    erroMsg.value = ''
    try {
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: {
                email: estado.value.email,
                senha: estado.value.senha
            }
        })
        await navigateTo('/sixseven')
    } catch (err) {
        erroMsg.value = err.data?.statusMessage || 'Erro ao entrar. Verifique suas credenciais.'
    } finally {
        carregando.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-black rounded-2xl shadow-sm overflow-hidden border border-gray-200">

            <div class="bg-red-800 px-8 py-8 text-center">
                <div class="w-14 h-14 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UIcon name="i-heroicons-academic-cap" class="text-white text-3xl" />
                </div>
                <h1 class="text-white text-xl font-semibold">Sistema Escolar</h1>
                <p class="text-red-200 text-sm mt-1">Acesse sua conta para continuar</p>
            </div>

            <div class="px-8 py-8">
                <UFormField label="E-mail" name="email" class="mb-5">
                    <UInput
                        v-model="estado.email"
                        type="email"
                        placeholder="seu@email.com"
                        icon="i-heroicons-envelope"
                        size="lg"
                        class="w-full"
                    />
                </UFormField>

                <UFormField label="Senha" name="password" class="mb-6">
                    <UInput
                        v-model="estado.senha"
                        type="password"
                        placeholder="••••••••"
                        icon="i-heroicons-lock-closed"
                        size="lg"
                        class="w-full"
                    />
                </UFormField>

                <p v-if="erroMsg" class="text-red-600 text-sm mb-4 flex items-center gap-1.5">
                    <UIcon name="i-heroicons-exclamation-circle" />
                    {{ erroMsg }}
                </p>

                <UButton
                    color="error"
                    variant="solid"
                    size="lg"
                    block
                    :loading="carregando"
                    icon="i-heroicons-arrow-right-end-on-rectangle"
                    @click="login"
                >
                    Entrar no sistema
                </UButton>

                <p class="text-center text-sm text-gray-400 mt-5">
                    Esqueceu a senha?
                    <a href="#" class="text-red-700 hover:underline">Recuperar acesso</a>
                </p>
            </div>
        </div>
    </div>
</template>