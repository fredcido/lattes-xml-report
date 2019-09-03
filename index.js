const fs = require('fs');
const glob = require('glob');
const parser = require('fast-xml-parser');
const og = require('object-get');
const writeCSV = require('write-csv');
const Iconv  = require('iconv').Iconv;

const data = {
  "Nome": "",
  "ID Lattes": "",
  "Se possui bolsa CNPq": "",
  "Data da ultima atualizacao": "",
  "Formação acadêmica/titulação": "",
  "Projetos de pesquisa": "",
  "Projetos de extensão": "",
  "Áreas de atuação": "",
  "Artigos completos publicados em periódicos": "",
  "Capítulos de livros publicados": "",
  "Trabalhos completos publicados em anais de congressos": "",
  "Resumos expandidos publicados em anais de congressos": "",
  "Resumos publicados em anais de congressos": "",
  "Apresentações de Trabalho": "",
  "Participação em bancas de trabalhos de conclusão": "",
  "Participação em eventos, congressos, exposições e feiras": "",
  "Orientações e supervisões concluídas	Bolsista": ""
};

const xmlOptions = {
  ignoreAttributes: false,
  parseAttributeValue: true,
  attrNodeName: 'attr',
  attributeNamePrefix: ''
};

const iconv = new Iconv('ISO-8859-1', 'UTF-8');
const convert = input => iconv.convert(input).toString();

const rows = [];
glob('./curriculos/*.xml', function (err, files) {
   if (err) {
      console.log(err);
  } else {
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file).toString();
        const tObj = parser.getTraversalObj(content, xmlOptions);
        const result = parser.convertToJson(tObj, xmlOptions);
        const row = {...data};

        const xmlData = result['CURRICULO-VITAE'];
        const dadosGerais = xmlData['DADOS-GERAIS'];

        row['Nome'] = convert(og(dadosGerais,'attr.NOME-COMPLETO'));
        row['ID Lattes'] = og(xmlData, 'attr.NUMERO-IDENTIFICADOR');
        row['Data da ultima atualizacao'] = og(xmlData, 'attr.DATA-ATUALIZACAO');
        row['Formação acadêmica/titulação'] = og(dadosGerais, 'FORMACAO-ACADEMICA-TITULACAO.GRADUACAO.attr.NOME-CURSO');

        rows.push(row);
      } catch (e) {
        console.log(e);
      }
    });

    writeCSV('./result.csv', rows);
    console.log(rows);
  }
});
