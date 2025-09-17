<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Regra de validação para CPF brasileiro
 * 
 * Esta classe implementa a validação completa de CPF,
 * incluindo verificação de formato, dígitos verificadores
 * e rejeição de CPFs com todos os dígitos iguais.
 */
class Cpf implements ValidationRule
{
    /**
     * Executa a validação do CPF
     * 
     * Valida se o CPF fornecido está em formato correto,
     * possui exatamente 11 dígitos, não é uma sequência
     * repetida e tem dígitos verificadores válidos.
     * 
     * @param string $attribute Nome do atributo sendo validado
     * @param mixed $value Valor a ser validado
     * @param Closure $fail Função para reportar falha na validação
     * @return void
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $cpf = preg_replace('/\D/', '', $value ?? '');
        if(strlen($cpf) != 11 || preg_match('/(\d)\1{10}/', $cpf)) {
            $fail('CPF Inválido');
            return;
        }

        for ($t = 9; $t < 11; $t++) {
            $d = 0;
            for ($c = 0; $c < $t; $c++) {
                $d += $cpf[$c] * (($t + 1) - $c);
            }
            $d = ((10 * $d) % 11) % 10;
            if ($cpf[$t] != $d) {
                $fail('CPF inválido.');
                return;
            }
        }
    }
}
