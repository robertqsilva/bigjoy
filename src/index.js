require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require('express')
const cron = require("node-cron");
const axios = require("axios");

const app = express()

app.use(express.json())


const token = process.env.TOKEN_TELEGRAM;
const bot = new TelegramBot(token, { polling: true });

let array = [];
let entrada = 0;
let meta = 0;
let aguardandoMeta = false;
let aguardandoResposta = false;

app.get("/bot", async (req, res) => {
  return res.status(200).json({ mensagem: "servidor on papai" });
});


cron.schedule("*/5 * * * *", () => {
  axios
    .get("https://api-fortune-tig.onrender.com/bot")
    .then((response) => {
      console.log("Solicitação de manutenção enviada com sucesso");
    })
    .catch((error) => {
      console.error(
        "Erro ao enviar a solicitação de manutenção:",
        error.message
      );
    });
});

app.listen(process.env.PORT, () => {
  console.log("Servidor rodando");
});

// Comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "Bem-vindo! Qual é a sua meta? Por favor, digite a meta desejada."
  );
  aguardandoMeta = true;
});

// Listener para capturar a meta inserida pelo usuário
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  if (aguardandoMeta) {
    // Verifica se a mensagem atual é um número (a meta desejada)
    if (!isNaN(msg.text)) {
      meta = parseInt(msg.text);

      // Gera o array e envia a primeira entrada
      entrada = gerarArraySoma20(meta);
      bot.sendMessage(
        chatId,
        `Sua primeira entrada é: ${entrada}. Ganhou ou perdeu?`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Ganhou", callback_data: "ganhou" }],
              [{ text: "Perdeu", callback_data: "perdeu" }],
            ],
          },
        }
      );

      // Atualiza o estado de espera
      aguardandoMeta = false;
      aguardandoResposta = true;
    } else {
      // Se a mensagem não for um número, pede novamente a meta
      bot.sendMessage(
        chatId,
        "Por favor, digite um valor numérico para a meta."
      );
    }
  }
});

// Listener para capturar as respostas através dos botões
bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const resposta = callbackQuery.data.toLowerCase();
  const resultado = valorEntradas(resposta === "ganhou");

  if (array.length === 1) {
    // Se o array tem apenas um elemento, informe a entrada como esse elemento
    bot.sendMessage(chatId, `A entrada é: ${array[0]}. Ganhou ou perdeu?`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Ganhou", callback_data: "ganhou" }],
          [{ text: "Perdeu", callback_data: "perdeu" }],
        ],
      },
    });
  } else if (array.length === 0) {
    // Se o array estiver vazio, encerre o jogo
    bot.sendMessage(chatId, `Parabéns! Você atingiu sua meta`);
    // Encerrar o atendimento
  } else {
    // Se o array ainda tem mais de um elemento, continue o jogo
    bot.sendMessage(
      chatId,
      `Sua próxima entrada é: ${resultado}. Ganhou ou perdeu?`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Ganhou", callback_data: "ganhou" }],
            [{ text: "Perdeu", callback_data: "perdeu" }],
          ],
        },
      }
    );
  }

  // Atualiza o estado de espera
  aguardandoResposta = true;
});

// Função para processar a resposta do usuário
function valorEntradas(resposta) {
  if (resposta) {
    if (array.length > 1) {
      const newArray = array.slice(1, array.length - 1);
      entrada = newArray[0] + newArray[newArray.length - 1];
      array = newArray;
    } else if (array.length === 1) {
      array = [];
    }
  } else {
    if (array.length === 1) {
      array.push(array[0]);
      entrada = array[0] + array[0];
    } else {
      array.push(entrada);
      entrada = array[0] + array[array.length - 1];
    }
  }

  return entrada;
}

function gerarArraySoma20(ganhoFinal) {
  const minElementos = 8;
  const maxElementos = 10;

  while (true) {
    const numElementos =
      Math.floor(Math.random() * (maxElementos / 2 - minElementos / 2 + 1)) +
      minElementos / 2;

    if (ganhoFinal > 60 && ganhoFinal <= 80) {
      array = Array.from(
        { length: numElementos * 2 },
        () => Math.floor(Math.random() * 23) + 1
      );
    }
    if (ganhoFinal > 80 && ganhoFinal <= 110) {
      array = Array.from(
        { length: numElementos * 2 },
        () => Math.floor(Math.random() * 28) + 1
      );
    }
    if (ganhoFinal > 110 && ganhoFinal <= 150) {
      array = Array.from(
        { length: numElementos * 2 },
        () => Math.floor(Math.random() * 35) + 1
      );
    }
    if (ganhoFinal > 150) {
      array = Array.from(
        { length: numElementos * 2 },
        () => Math.floor(Math.random() * 40) + 1
      );
    }

    if (ganhoFinal > 40 && ganhoFinal <= 60) {
      array = Array.from(
        { length: numElementos * 2 },
        () => Math.floor(Math.random() * 16) + 1
      );
    }

    if (ganhoFinal <= 40 && ganhoFinal >= 35) {
      array = Array.from(
        { length: numElementos * 2 },
        () => Math.floor(Math.random() * 12) + 1
      );
    }
    if (ganhoFinal <= 34 && ganhoFinal >= 20) {
      array = Array.from(
        { length: numElementos * 2 },
        () => Math.floor(Math.random() * 9) + 1
      );
    }
    if (ganhoFinal <= 19 && ganhoFinal >= 10) {
      array = Array.from(
        { length: numElementos * 2 },
        () => Math.floor(Math.random() * 5) + 1
      );
    }
    if (ganhoFinal < 10) {
      array = Array.from(
        { length: numElementos * 2 },
        () => Math.floor(Math.random() * 3) + 1
      );
    }

    const slicedArray = array.slice(0, numElementos * 2);

    if (
      slicedArray.reduce((acc, curr) => acc + curr, 0) === ganhoFinal &&
      !slicedArray.includes(0)
    ) {
      array = slicedArray;
      entrada = array[0] + slicedArray.slice(-1)[0];
      return entrada;
    }
  }
}
