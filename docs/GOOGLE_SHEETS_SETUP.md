# Configuração da Sincronização com Google Sheets

Este guia explica como configurar o "Proxy" no Google Apps Script para permitir que o sistema Nuxt atualize suas planilhas em tempo real.

## Passo a Passo

### 1. Preparar a Planilha
* Crie uma nova planilha no Google Sheets.
* Na primeira linha (Cabeçalho), coloque: `Matricula` na célula A1, `Nome` na B1, e as datas (ex: `15/05`) nas colunas seguintes.

### 2. Configurar a Senha de Sincronização (Segurança)
Para que sua senha não fique exposta no código:
* No editor do Apps Script, clique no ícone da engrenagem **Configurações do Projeto** (Project Settings) no menu lateral esquerdo.
* Role até o final e clique em **Adicionar propriedade do script**.
* Em **Propriedade**, digite: `SYNC_TOKEN`
* Em **Valor**, digite sua senha secreta (a mesma que definiu no sistema Nuxt).
* Clique em **Salvar propriedades do script**.

### 3. Colar o Código do Proxy
* Volte para o **Editor** (ícone `< >`).
* Apague todo o código existente e cole o código abaixo:

```javascript
// O script busca a senha nas configurações internas (Propriedades do Script)
const SECURITY_TOKEN = PropertiesService.getScriptProperties().getProperty('SYNC_TOKEN');

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.token !== SECURITY_TOKEN) {
      return response({ result: "error", message: "Token inválido" });
    }

    var ss = SpreadsheetApp.openById(data.spreadsheetId);
    var sheet = ss.getSheets()[0];

    if (data.action === "initialize") {
      sheet.clear();
      var header = ["Matricula", "Nome"].concat(data.dates || []);
      sheet.appendRow(header);
      if (data.students) {
        data.students.forEach(function(aluno) {
          sheet.appendRow([aluno.matricula, aluno.nome]);
        });
      }
      sheet.getRange(1, 1, 1, header.length).setFontWeight("bold").setBackground("#f3f4f6");
      return response({ result: "success", message: "Inicializado" });
    }
        var values = sheet.getDataRange().getDisplayValues();
    var header = values[0];
    
    var colIndex = -1;
    for (var j = 0; j < header.length; j++) {
      if (header[j].toString().trim() == data.data.toString().trim()) {
        colIndex = j + 1;
        break;
      }
    }
    if (colIndex == -1) return response({ result: "error", message: "Data não encontrada" });

    var rowIndex = -1;
    for (var i = 0; i < values.length; i++) {
      if (values[i][0].toString().trim() == data.matricula.toString().trim()) {
        rowIndex = i + 1;
        break;
      }
    }
    if (rowIndex != -1) {
      sheet.getRange(rowIndex, colIndex).setValue(data.status);
      return response({ result: "success" });
    }
    return response({ result: "not_found" });

  } catch (f) {
    return response({ result: "error", message: f.toString() });
  } finally {
    lock.releaseLock();
  }
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

```

### 3. Publicar o Script
* Clique em **Implantar > Nova Implantação**.
* Tipo: **App da Web**.
* Executar como: **Você**.
* Quem pode acessar: **Qualquer pessoa**.
* Copie a **URL do App da Web** gerada.

### 4. Vincular ao Sistema
* No sistema de Presença, vá em **Gerenciar Turmas**.
* Cole o **ID da Planilha** (o código longo da URL da planilha).
* Clique em **Salvar**.
* Agora, use o botão **"Exportar Alunos para Google"** para testar a conexão.

## Segurança
O `SECURITY_TOKEN` no script deve ser exatamente igual ao `SYNC_TOKEN` definido no arquivo `.env` (ou `nuxt.config.ts`) do seu projeto Nuxt. Isso impede que pessoas externas usem seu proxy.
