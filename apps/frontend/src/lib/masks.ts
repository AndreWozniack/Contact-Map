export const onlyDigits = (v: string | undefined | null) => (v || '').replace(/\D+/g, '');

export const maskCPF = (v: string | undefined | null) => {
    v = onlyDigits(v).slice(0, 11);
    return v
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2}).*/, '$1.$2.$3-$4');
};

export const maskCEP = (v: string | undefined | null) => {
    v = onlyDigits(v).slice(0, 8);
    return v.replace(/^(\d{5})(\d{1,3}).*/, '$1-$2');
};

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