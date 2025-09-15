# 📝 Documentação — Lambda ConsumerCatalog

## 📌 Visão Geral
Esta Lambda faz parte do fluxo da API Publisher. Ela consome mensagens enviadas pela [API](https://github.com/vitoriadeveloper/product-catalog-aws) para a fila SQS e atualiza o catálogo no S3.

## 🗂 Estrutura de Pastas
```bash
src/
├── constants/
│   └── bucket.js               # Nome do bucket S3
│
├___ lambda_function.js   # Função handler principal da Lambda
│  
│
├── services/
│   ├── catalogService.js       # Regras de negócio do catálogo
│   └── s3Service.js             # Operações de leitura e escrita no S3
│
└── utils/
    └── streamUtils.js           # Funções utilitárias para conversão de streams
```

## ⚙ Fluxo de Execução
1. O SQS dispara um evento com um ou mais registros.
2. A função handler (consumerCatalogHandler.js) itera sobre os registros.

* Para cada mensagem:

1. Faz o parse do record.body e do rawBody.Message.
2. Identifica se é um produto (possui categoryId) ou categoria (possui ownerId).
3. A função chama o processCatalogItem do catalogService.js.

* O catalogService:
1. Lê o arquivo ownerKey-catalog.json do S3 (se existir).
2. Atualiza a lista products ou categories.
3. Salva de volta no S3 usando o s3Service.js.

## 📁 Arquivos principais
`src/constants/bucket.js`
```js
export const BUCKET_NAME = "catalog-products-s3";
```

`src/utils/streamUtils.js`
```js
export function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", chunk => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
}
```
`src/services/s3Service.js`

```js
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { streamToString } from "../utils/streamUtils.js";
import { BUCKET_NAME } from "../constants/bucket.js";

const client = new S3Client({ region: "sa-east-1" });

export async function getS3Object(key) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
  const response = await client.send(cmd);
  return streamToString(response.Body);
}

export async function putS3Object(key, content) {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: content,
    ContentType: "application/json",
  });
  return client.send(cmd);
}

```

## 🚀 Deploy na AWS
* Compacte a pasta src e o package.json em um .zip.
* Faça upload na função Lambda.
* Configure o Handler no console da AWS como:
```bash
src/handlers/consumerCatalogHandler.handler
```

## ✅ Boas práticas aplicadas
* Separação de responsabilidades (handler, serviços, utilitários e constantes).
* Isolamento da lógica de negócio (catalogService) da infraestrutura (s3Service).
* Tratamento de erros e logs claros.
* Código mais testável e reutilizável.
