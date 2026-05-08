<script setup>
    defineProps(['field_name', 'id'])
</script>

<template>
    
    <label for="">{{ field_name }}</label>
    <input id='{{ id }}' type="text">
</template>