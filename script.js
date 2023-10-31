document.addEventListener("DOMContentLoaded", function () {
    const chatMessages = document.getElementById("chat-messages");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const downloadOgButton = document.getElementById("download-og-button");
    const downloadSummaryButton = document.getElementById("download-summary-button");

    let scraperResponse = null;
    const qaurl = "http://127.0.0.1:5000/qa";
    const apiUrlOg = "http://127.0.0.1:5000/download_og";
    const apiUrlSummary = "http://127.0.0.1:5000/download_summary";
    let url=null;
    // Function to add a message to the chat interface
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement("div");
        messageDiv.className = isUser ? "user-message" : "chatbot-message";
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendToScraper(url) {
        const scraperUrl = 'http://127.0.0.1:5000/scraper';
        const data = {
            "url": url,
        };
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
        fetch(scraperUrl, requestOptions)
            .then(response => response.json())
            .then(json => {
                scraperResponse = json;
            });
    }

    function sendCurrentTabUrlToApi(url, apiEndpoint) {
        fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "url": url }),
        })
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'webpage.docx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch((e) => {
                console.log(e);
            });
    }

    function getChatbotResponse(userMessage) {
        return "Answer: " + userMessage;
    }

    sendButton.addEventListener("click", function () {
        const userMessage = userInput.value;
        const qaOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "url":url, "question": userMessage }),
        }
        if (userMessage.trim() !== "") {
            addMessage(userMessage, true);
            fetch(qaurl, qaOptions)
                .then(response => response.json())
                .then(json => {
                    qaResponse = json;
                    console.log(qaResponse);
                })
                .catch((e) => {
                    console.log(e);
                })
                .then(() => {
                    const chatbotResponse = getChatbotResponse(qaResponse.answer);
                    console.log(qaResponse.answer);
                    addMessage(chatbotResponse);
                })
                .catch((e) => {
                    console.log(e);
                })
            userInput.value = "";
        }
    });

    downloadOgButton.addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            url = tabs[0].url;
            sendCurrentTabUrlToApi(url, apiUrlOg);
        });
    });

    downloadSummaryButton.addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            url = tabs[0].url;
            sendCurrentTabUrlToApi(url, apiUrlSummary);
        });
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        url = tabs[0].url;
        sendToScraper(url);
    });
})