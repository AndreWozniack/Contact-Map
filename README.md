# Contact Map

Uma aplicação web para gerenciamento de contatos com visualização em mapa, permitindo cadastrar, organizar e localizar geograficamente seus contatos pessoais.

## Sobre o Projeto

O Contact Map é uma aplicação full-stack que combina gerenciamento de contatos com funcionalidades de geolocalização. Os usuários podem cadastrar contatos com endereços completos e visualizá-los em um mapa interativo, facilitando a organização e localização de pessoas importantes.

## Funcionalidades Principais

- **Gerenciamento de Contatos**: Cadastro, edição, visualização e exclusão de contatos
- **Validação de CPF**: Sistema de validação automática de CPF
- **Endereçamento Completo**: Suporte a CEP, logradouro, cidade, estado e complemento
- **Geolocalização**: Conversão automática de endereços em coordenadas geográficas
- **Visualização em Mapa**: Interface interativa com Google Maps para localizar contatos
- **Autenticação**: Sistema de login e registro de usuários
- **API RESTful**: Backend com endpoints para todas as operações

## Tecnologias Utilizadas

### Backend
- **Laravel 11** - Framework PHP moderno
- **MySQL** - Banco de dados relacional tradicional
- **Laravel Sanctum** - Autenticação de API
- **PHP 8.x** - Linguagem de programação

### Frontend
- **React** - Biblioteca para interfaces
- **Vite** - Build tool moderna e rápida
- **Material-UI (MUI)** - Componentes de interface
- **Google Maps API** - Integração com mapas
- **React Router** - Roteamento de páginas

### Infraestrutura
- **Docker** - Containerização da aplicação
- **Docker Compose** - Orquestração de containers
- **Nginx** - Servidor web para produção

## Como Executar

### Usando Docker

1. Clone o repositório:
```bash
git clone https://github.com/AndreWozniack/Contact-Map.git
cd Contact-Map
```

2. Execute o ambiente de desenvolvimento:
```bash
docker-compose -f docker-compose up -d
```

3. Acesse a aplicação:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8080/api

## Autor

**Andre Wozniack**
- GitHub: [@AndreWozniack](https://github.com/AndreWozniack)
