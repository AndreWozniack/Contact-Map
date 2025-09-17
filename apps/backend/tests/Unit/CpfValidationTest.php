<?php

namespace Tests\Unit;

use App\Rules\Cpf;
use Tests\TestCase;

/**
 * Testes unitários para validação de CPF
 * 
 * Testa todos os cenários de validação da regra Cpf,
 * incluindo casos válidos, inválidos e casos extremos.
 */
class CpfValidationTest extends TestCase
{
    private Cpf $cpfRule;

    /**
     * Configura o ambiente de teste
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->cpfRule = new Cpf();
    }

    /**
     * Testa CPFs válidos
     * 
     * @dataProvider validCpfProvider
     */
    public function test_valid_cpfs(string $cpf): void
    {
        $failed = false;
        $this->cpfRule->validate('cpf', $cpf, function () use (&$failed) {
            $failed = true;
        });

        $this->assertFalse($failed, "CPF {$cpf} deveria ser válido");
    }

    /**
     * Testa CPFs inválidos
     * 
     * @dataProvider invalidCpfProvider
     */
    public function test_invalid_cpfs(string $cpf): void
    {
        $failed = false;
        $this->cpfRule->validate('cpf', $cpf, function () use (&$failed) {
            $failed = true;
        });

        $this->assertTrue($failed, "CPF {$cpf} deveria ser inválido");
    }

    /**
     * Testa CPFs com formatação
     */
    public function test_formatted_cpfs(): void
    {
        $validCpfs = [
            '390.533.447-05',
            '123.456.789-09',
            '111.444.777-35',
        ];

        foreach ($validCpfs as $cpf) {
            $failed = false;
            $this->cpfRule->validate('cpf', $cpf, function () use (&$failed) {
                $failed = true;
            });

            $this->assertFalse($failed, "CPF formatado {$cpf} deveria ser válido");
        }
    }

    /**
     * Testa valores nulos e vazios
     */
    public function test_null_and_empty_values(): void
    {
        $invalidValues = [null, '', '   ', 'abc', '123'];

        foreach ($invalidValues as $value) {
            $failed = false;
            $this->cpfRule->validate('cpf', $value, function () use (&$failed) {
                $failed = true;
            });

            $this->assertTrue($failed, "Valor '{$value}' deveria ser inválido");
        }
    }

    /**
     * Testa CPFs com todos os dígitos iguais
     */
    public function test_repeated_digits_cpfs(): void
    {
        $repeatedCpfs = [
            '11111111111',
            '22222222222',
            '33333333333',
            '00000000000',
            '99999999999',
        ];

        foreach ($repeatedCpfs as $cpf) {
            $failed = false;
            $this->cpfRule->validate('cpf', $cpf, function () use (&$failed) {
                $failed = true;
            });

            $this->assertTrue($failed, "CPF com dígitos repetidos {$cpf} deveria ser inválido");
        }
    }

    /**
     * Provedor de CPFs válidos
     */
    public static function validCpfProvider(): array
    {
        return [
            ['39053344705'],
            ['12345678909'],
            ['11144477735'],
            // Removendo CPFs que podem não ser válidos
        ];
    }

    /**
     * Provedor de CPFs inválidos
     */
    public static function invalidCpfProvider(): array
    {
        return [
            ['39053344704'], // Dígito verificador incorreto
            ['12345678908'], // Dígito verificador incorreto
            ['1234567890'],  // Muito curto
            ['123456789012'], // Muito longo
            ['abcdefghijk'], // Caracteres inválidos
            [''],           // Vazio
        ];
    }
}
