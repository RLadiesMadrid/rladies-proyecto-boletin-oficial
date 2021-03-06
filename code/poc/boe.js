const request = require('request');
const fs = require('fs');
const PDFParser = require("pdf2json");
const moment = require('moment');
// const getData = require('./getData');
let dateInit = moment("2017-10-01");
let dateEnd = moment();
const db = require('./db');

function getData(date,index){
	if (date < dateEnd){
		try{
		const url = 'https://www.bocm.es/boletin/CM_Orden_BOCM/'+date.format('YYYY/MM/DD') + '/BOCM-'+date.format('YYYYMMDD') + '-'+index+'.PDF';
		console.log("asking for",url);
		let pdfParser = new PDFParser(this,1);
		pdfParser.on("pdfParser_dataError", errData => {
			console.error(errData.parserError);
			setTimeout(()=>{
				getData(date.add(1,'days'),1);
			},4000)
		});
		pdfParser.on("pdfParser_dataReady", async pdfData => {
			let textToSave =pdfParser.getRawTextContent();
			let words = await db.getKeywords();
			db.saveText(textToSave, date.format('YYYYMMDD') + '-' + index, date.format('YYYY-MM-DD'), url).then((e)=>{
				console.log(e.insertId);
				findInText(textToSave,words,e.insertId);
			// 	console.log("saving good")
			});
			setTimeout(()=>{
				index++;
				getData(date,index);
			},4000)
		});
		request({url: url, encoding:null}).pipe(pdfParser);
		} catch (err) {
			setTimeout(()=>{
				getData(date,index);},4000)
		}
	}
}
function findInText(text,words,textid) {
	words.forEach((w)=>{
		let count = (text.match(new RegExp(w.keyword,'g')) || []).length;
		// console.log(w);
		db.saveTextKeyword(textid,w.id,count).then(()=>{

		}).catch((err)=>{
			// console.error(err);
		});
	})
}
getData(dateInit,1);
// async function run(date,index) {
// 	try {
// 		await db.connect();
// 		const url = 'https://www.bocm.es/boletin/CM_Orden_BOCM/' + date.format('YYYY/MM/DD') + '/BOCM-' + date.format('YYYYMMDD') + '-' + index + '.PDF';
// 		let textData = await getData.get(url);
// 		let keywords = await db.getKeywords();
// 		// let text = findInText(keywords, textData);
// 		await db.saveText(textData, date.format('YYYYMMDD') + '-' + index, date.format('YYYYMMDD'), url);
// 		getData(date.add(1, 'days'), index++);
// 		//find in text the keywords
// 		//
//
// 		getData(dateInit, 54);
// 	} catch (err) {
// 		setTimeout(() => {
// 			index++;
// 			getData(date, 1);
// 		}, 4000)
// 	}
// }
//
// run();
