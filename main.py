from flask import Flask,request,send_file,make_response
import requests
from scrape import scraper
from create_doc import create
from summary import summarize
from transformers import pipeline

model_name = "deepset/bert-large-uncased-whole-word-masking-squad2"
nlp = pipeline('question-answering', model=model_name, tokenizer=model_name)
app=Flask(__name__)

@app.route("/download_og",methods=["GET","POST"])
def download_og():
    if request.method=="POST":
        data= request.json
        url=data.get("url")
        title,text=scraper(url)
        doc_stream=create(title,text)
        return send_file(
            doc_stream,
            as_attachment=True,
            download_name='example.docx',
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )

@app.route("/scraper",methods=["POST", "OPTIONS"])
def get_context():
    if request.method=="POST":
        data=request.json
        url=data.get("url")
        title,context=scraper(url)
        content=title+str(context)
        encoded_content = content.encode('utf-8')
        response = make_response(encoded_content)
        response.headers['Content-Type'] = 'text/html; charset=utf-8'
        return response

@app.route("/qa",methods=["POST"])
def get_answer():
    if request.method=="POST":
        data=request.json
        url=data.get("url")
        question=data.get("question")
        title,context=scraper(url)
        context=title+str(context)
        output = nlp({
                "question": question,
                "context": context
            }
        )
        return output

@app.route("/download_summary",methods=["GET","POST"])
def download_summary():
    if request.method=="POST":
        data= request.json
        url=data.get("url")
        title,text=scraper(url)
        text=summarize(text)
        doc_stream=create(title,text)
        return send_file(
            doc_stream,
            as_attachment=True,
            download_name='example.docx',
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )

app.run(host='0.0.0.0',port=5000,debug=True)