export const formatCNPJ = (v: string) => {
    v = v.replace(/\D/g, "")
    if (v.length > 14) v = v.substring(0, 14)
    
    if (v.length <= 2) return v
    if (v.length <= 5) return v.replace(/^(\d{2})(\d)/, "$1.$2")
    if (v.length <= 8) return v.replace(/^(\d{2})(\d{3})(\d)/, "$1.$2.$3")
    if (v.length <= 12) return v.replace(/^(\d{2})(\d{3})(\d{3})(\d)/, "$1.$2.$3/$4")
    return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d)/, "$1.$2.$3/$4-$5")
}

export const formatMatricula = (v: string) => {
    return v.replace(/\D/g, "") // Apenas números para matrícula
}

export const formatCodigoTurma = (v: string) => {
    return v.toUpperCase().replace(/\s/g, "") // Caixa alta e sem espaços
}
