import requests as req
import os 
from bs4 import BeautifulSoup as bs

def scraper(url):
    response = req.get(url)
    soup= bs(response.text,"html.parser")
    elem= soup.find("div",{"id":"mw-content-text"})
    curr_key="0"
    curr_subkey="0"
    data={curr_key:{curr_subkey:""}}
    for i in list(elem.find("p").next_elements):
        if i.name=='h2':
            curr_key=i.text
            data[curr_key]={"0":""}
            curr_subkey="0"
        elif i.name=='h3':
            curr_subkey=i.text
            data[curr_key][curr_subkey]=""
        elif i.name=='p':
            data[curr_key][curr_subkey]+=i.text
    
    return soup.title.text,data