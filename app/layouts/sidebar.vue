<template>
  <div class="fixed inset-y-0 left-0 w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
    <!-- Header: Identificação do Sistema -->
    <div class="p-6 border-b border-gray-100 dark:border-gray-800">
      <h2 class="text-lg font-bold text-primary-600 flex items-center gap-2">
        <UIcon name="i-heroicons-academic-cap" />
        Sistema Escolar
      </h2>
    </div>

    <!-- Navegação Dinâmica -->
    <div class="flex-1 overflow-y-auto p-4">
      <UNavigationMenu 
        :items="links" 
        orientation="vertical"
        class="w-full"
      />
    </div>

    <!-- Perfil do Usuário no Rodapé -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
      <div class="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <UAvatar :alt="user?.email" size="sm" />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold truncate">{{ user?.email }}</p>
          <UBadge :color="user?.role === 'ADMIN' ? 'error' : 'success'" variant="soft" size="xs">
            {{ user?.role }}
          </UBadge>
        </div>
      </div>
      
      <UButton
        icon="i-heroicons-arrow-left-on-rectangle"
        color="neutral"
        variant="ghost"
        size="sm"
        block
        class="justify-start text-gray-500 hover:text-red-600"
        @click="logout"
      >
        Sair do Sistema
      </UButton>
    </div>
  </div>

  <!-- Área do Conteúdo Principal -->
  <main class="ml-64 p-8 min-h-screen bg-gray-50 dark:bg-black">
    <slot />
  </main>
</template>

<script setup lang="ts">
const { links } = useNavigation()
const { user, logout } = useAuth()
</script>