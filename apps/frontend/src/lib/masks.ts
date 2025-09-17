/**
 * Utilitários de máscaras de entrada
 * 
 * Funções para formatação e validação de dados de entrada em formulários,
 * incluindo CPF, CEP, telefone e extração de apenas dígitos.
 */

/**
 * Remove todos os caracteres não numéricos de uma string
 * 
 * @param v String de entrada (pode ser undefined ou null)
 * @returns String contendo apenas dígitos
 */
export const onlyDigits = (v: string | undefined | null) => (v || '').replace(/\D+/g, '');

/**
 * Aplica máscara de CPF (XXX.XXX.XXX-XX)
 * 
 * @param v String do CPF para formatar
 * @returns CPF formatado com pontos e hífen
 */
export const maskCPF = (v: string | undefined | null) => {
    v = onlyDigits(v).slice(0, 11);
    return v
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2}).*/, '$1.$2.$3-$4');
};

/**
 * Aplica máscara de CEP (XXXXX-XXX)
 * 
 * @param v String do CEP para formatar
 * @returns CEP formatado com hífen
 */
export const maskCEP = (v: string | undefined | null) => {
    v = onlyDigits(v).slice(0, 8);
    return v.replace(/^(\d{5})(\d{1,3}).*/, '$1-$2');
};

/**
 * Aplica máscara de telefone brasileiro
 * 
 * Suporta tanto telefones fixos (10 dígitos) quanto celulares (11 dígitos).
 * Formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
 * 
 * @param v String do telefone para formatar
 * @returns Telefone formatado com parênteses e hífen
 */
export const maskPhone = (v: string | undefined | null) => {
    v = onlyDigits(v).slice(0, 11);
    if (v.length <= 10) {
        return v
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return v
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
};