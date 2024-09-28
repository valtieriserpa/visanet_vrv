// Carregar as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Inicializar o Stripe com a chave secreta
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    const { amount, currency, email, name } = req.body;

    // Verificação e logging para ajudar no diagnóstico de erros
    console.log("Dados recebidos:", { amount, currency, email, name });

    // Validação dos dados recebidos
    if (!amount || isNaN(amount) || amount <= 0) {
        console.error("Erro: Valor inválido ou ausente.");
        return res.status(400).json({ error: 'Valor inválido ou ausente.' });
    }

    if (!currency || !['brl', 'usd', 'eur'].includes(currency)) {
        console.error("Erro: Moeda inválida ou ausente.");
        return res.status(400).json({ error: 'Moeda inválida ou ausente.' });
    }

    if (!email || !validateEmail(email)) {
        console.error("Erro: E-mail inválido ou ausente.");
        return res.status(400).json({ error: 'E-mail inválido ou ausente.' });
    }

    if (!name || name.trim().length === 0) {
        console.error("Erro: Nome inválido ou ausente.");
        return res.status(400).json({ error: 'Nome inválido ou ausente.' });
    }

    try {
        // Criar um PaymentIntent com o valor, moeda, e associar o nome e e-mail
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,  // O valor já está em centavos
            currency: currency,  // Define a moeda escolhida (BRL, USD ou EUR)
            receipt_email: email,  // Associar o e-mail ao pagamento
            metadata: { customer_name: name },  // Armazena o nome do cliente como metadata
            description: 'Pagamento de Consultoria Técnica'
        });

        console.log("PaymentIntent criado com sucesso:", paymentIntent);

        // Enviar o clientSecret ao frontend para finalizar o pagamento
        return res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Erro ao criar PaymentIntent:", error);
        return res.status(500).json({ error: 'Erro ao processar o pagamento. Tente novamente mais tarde.' });
    }
};

// Função para validar o formato do e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}
