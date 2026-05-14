

<script setup>
    definePageMeta({
        layout: "sidebar",
    })
    const columns = [{
        key: "name",
        label: "Nome"
    },
    {
        key: "class",
        label: "Turma"
    },
    {
        key: "presence",
        label: "Presença"
    }

    ]

</script>


<template>
    <!-- <UTable :columns="columns"> -->
        <template>
            <UCheckbox/>
        </template>
    <!-- </UTable> -->
</template>