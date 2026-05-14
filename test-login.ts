import "dotenv/config"
import { $fetch } from 'ofetch'

async function test() {
    try {
        const res = await $fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            body: { email: 'admin@admin.com', senha: 'admin123' }
        })
        console.log('Login success:', res)
    } catch (e: any) {
        console.error('Login failed:', e.data || e.message)
    }
}
test()
