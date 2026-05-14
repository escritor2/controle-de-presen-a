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
      <UVerticalNavigation 
        :links="links" 
        :ui="{
          active: 'text-primary-500 before:bg-primary-500',
          icon: { active: 'text-primary-500' }
        }"
      />
    </div>

    <!-- Perfil do Usuário no Rodapé -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <UAvatar :alt="user?.email" size="sm" />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold truncate">{{ user?.email }}</p>
          <UBadge :color="user?.role === 'ADMIN' ? 'red' : 'green'" variant="flat" size="xs">
            {{ user?.role }}
          </UBadge>
        </div>
      </div>
    </div>
  </div>

  <!-- Área do Conteúdo Principal -->
  <main class="ml-64 p-8 min-h-screen bg-gray-50 dark:bg-black">
    <slot />
  </main>
</template>

<script setup>
const { links } = useNavigation()
const { data: user } = useAuth()
</script>