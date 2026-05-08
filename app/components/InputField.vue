<script setup>
    const props = defineProps({
        field_name:{
            type: String
        },
        tipo:{
            type: String,
            default: "text"
        }
    })
    function nameFormat(str){
        return str.replaceAll(" ", "_").toLowerCase();
    }

</script>

<template>
    <div class="form-field">
        <label :for=nameFormat(props.field_name) >{{ props.field_name }}</label>
        <input :name=nameFormat(props.field_name) :type=props.tipo>
    </div>
</template>


<style>
    .form-field{
        display: flex;
        flex-flow: column;
        justify-content: space-between;
        
    }
    .form-field input{
        border-radius:20px;
        margin-top: 2px;
        margin-bottom: 2px;
        border: 2px #afafaf solid;
        height: 25px;
    }
</style>