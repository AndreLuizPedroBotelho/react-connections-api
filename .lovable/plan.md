
# 🌟 CuriosityNet — Frontend React

Frontend moderno para a rede social de curiosidades **CuriosityNet**, consumindo a API FastAPI que roda em `localhost:8000`.

---

## 1. Autenticação (Login & Registro)
- **Página de Login** com campos de usuário e senha, design com card centralizado
- **Página de Registro** com campos de username, email, senha e **seleção de interesses** (tags clicáveis como "ciência", "história", "tecnologia", etc.)
- Armazenamento do token JWT no localStorage
- Redirecionamento automático para o feed após autenticar
- Rota protegida: se não logado, redireciona para login

## 2. Feed Diário de Curiosidades
- **Página principal** com as 30 curiosidades do dia em cards bonitos
- Cada card mostra: emoji, título, conteúdo, categoria (badge colorido) e nível de dificuldade
- Botão de **curtir** (com animação de coração) e contagem de likes
- Seção de **comentários** expansível em cada curiosidade
- Filtro por **categoria** no topo do feed
- Busca no **histórico** de curiosidades anteriores

## 3. Feed Social
- Aba/página separada mostrando curiosidades curtidas por quem o usuário segue
- Cards com indicação de "Curtido por @fulano"
- Mesmo sistema de likes e comentários

## 4. Perfil e Social
- **Meu Perfil** com dados do usuário, contagem de seguidores/seguindo
- **Perfil público** de outros usuários com botão seguir/desseguir
- Lista de seguidores e seguindo

## 5. Layout e Navegação
- **Navbar** fixa no topo com logo "CuriosityNet", links para Feed Diário, Feed Social, Perfil e Logout
- **Design responsivo** para mobile e desktop
- Tema moderno com cores vibrantes, cards com sombras suaves e animações de transição
- Toast notifications para ações (curtiu, comentou, seguiu)

## 6. Configuração da API
- Serviço centralizado para chamadas HTTP com interceptor para incluir o token JWT
- URL base configurável (padrão: `http://localhost:8000`)
- Tratamento de erros com mensagens amigáveis ao usuário
