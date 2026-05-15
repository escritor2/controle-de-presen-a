<template>

    <form @submit.prevent="handleSubmit" method="POST">
        <InputField field_name="Email"/>
        <InputField field_name="Senha" tipo="password"/>
        <button type="submit">aaaa</button>
    </form>
</template>

<script>
export default{
    methods: {
            handleSubmit(){
            alert("AAAAAAAAAAAA");
        }
    }
}
</script>