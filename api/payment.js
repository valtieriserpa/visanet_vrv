// Carregar as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Inicializar o Stripe com a chave secreta de produção
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE);

// Verificar se a chave está configurada corretamente
if (!process.env.STRIPE_SECRET_KEY_LIVE) {
    throw new Error('A chave STRIPE_SECRET_KEY_LIVE não está configurada no arquivo .env.');
}

const express = require('express');
const cors = require('cors'); // Para adicionar segurança com CORS

const app = express();

// Middleware para interpretar JSON e habilitar CORS
app.use(express.json());
app.use(cors());  // Habilitar CORS para proteger a API

app.post('/api/payment', async (req, res) => {
    const { amount, currency, cardholderName, email, cardType, product } = req.body;

    // Verifique se os campos obrigatórios estão presentes
    if (!amount || !currency || !cardholderName || !email || !product) {
        return res.status(400).json({ error: 'Faltam dados obrigatórios no corpo da requisição.' });
    }

    const supportedCurrencies = ['usd', 'eur', 'brl'];

    // Validar o valor e a moeda
    if (isNaN(amount) || amount <= 0 || !supportedCurrencies.includes(currency.toLowerCase())) {
        return res.status(400).json({ error: 'Valor ou moeda inválidos.' });
    }

    try {
        // Criar o PaymentIntent no Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Certifique-se de enviar o valor em centavos
            currency: currency,
            receipt_email: email,
            description: `Pagamento de ${product} para ${cardholderName}`,
            metadata: {
                customer_name: cardholderName,
                product: product,
                card_type: cardType  // Armazenar o tipo de cartão informado pelo cliente
            }
        });

        // Log do PaymentIntent para verificação
        console.log('PaymentIntent criado com sucesso:', paymentIntent.id);

        // Enviar o clientSecret ao frontend
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Erro ao criar PaymentIntent:", error);

        // Verificações mais robustas de erros do Stripe
        if (error.type === 'StripeCardError') {
            res.status(400).json({ error: error.message });
        } else if (error.type === 'StripeInvalidRequestError') {
            res.status(400).json({ error: 'Requisição inválida. Verifique os parâmetros enviados.' });
        } else if (error.type === 'StripeAPIError') {
            res.status(500).json({ error: 'Erro no Stripe. Tente novamente mais tarde.' });
        } else if (error.type === 'StripeConnectionError') {
            res.status(503).json({ error: 'Erro de conexão com o Stripe. Tente novamente.' });
        } else {
            res.status(500).json({ error: 'Erro no servidor. Tente novamente mais tarde.' });
        }
    }
});

// Iniciar o servidor na porta 3000
const PORT = process.env.PORT || 3000;  // Usar variável de ambiente para a porta
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
