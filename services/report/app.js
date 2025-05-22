const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}

async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }
}

async function printReport() {
    console.log("\n===== RELATÓRIO DE VENDAS =====")
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} vendas`);
    }
    console.log("===============================\n")
}

async function processMessage(msg) {
    const deliveryData = JSON.parse(msg.content)
    try {
        await updateReport(deliveryData.products)
        await printReport()
        console.log("✔ Relatório atualizado com sucesso!")
    } catch (error) {
        console.log(`X Erro ao processar relatório: ${error}`)
    }
}

async function consume() {
    console.log(`INSCRITO COM SUCESSO NA FILA: ${process.env.RABBITMQ_QUEUE_NAME}`)
    await (await RabbitMQService.getInstance()).consume(process.env.RABBITMQ_QUEUE_NAME, (msg) => {
        processMessage(msg)
    })
} 

consume()
