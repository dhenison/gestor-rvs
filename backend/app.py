import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

app = Flask(__name__)
# Habilita CORS para permitir que o frontend (PWA) faça requisições para essa API
CORS(app)

# Configurações da Evolution API (virão do arquivo .env ou do painel do Render)
EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL")
EVOLUTION_API_TOKEN = os.getenv("EVOLUTION_API_TOKEN")
EVOLUTION_INSTANCE_NAME = os.getenv("EVOLUTION_INSTANCE_NAME")

@app.route('/', methods=['GET'])
def health_check():
    """Rota simples para verificar se a API está no ar."""
    return jsonify({"status": "online", "message": "Gestor RVS WhatsApp API rodando!"})

@app.route('/send-message', methods=['POST'])
def send_message():
    """
    Rota que o frontend chamará para enviar mensagens pelo WhatsApp.
    O corpo da requisição (JSON) deve conter: 'number' (número do destinatário) e 'text' (mensagem).
    """
    if not EVOLUTION_API_URL or not EVOLUTION_API_TOKEN or not EVOLUTION_INSTANCE_NAME:
        return jsonify({"error": "As configurações da Evolution API ainda não foram definidas no servidor."}), 500

    data = request.json
    if not data or 'number' not in data or 'text' not in data:
        return jsonify({"error": "Faltando 'number' ou 'text' no corpo da requisição."}), 400

    number = data.get('number')
    text = data.get('text')

    # Endpoint da Evolution API para envio de mensagem de texto
    endpoint = f"{EVOLUTION_API_URL}/message/sendText/{EVOLUTION_INSTANCE_NAME}"

    headers = {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_TOKEN
    }

    payload = {
        "number": number,
        "options": {
            "delay": 1200,
            "presence": "composing"
        },
        "textMessage": {
            "text": text
        }
    }

    try:
        response = requests.post(endpoint, json=payload, headers=headers)
        response.raise_for_status() # Lança erro se o status HTTP não for 2xx
        return jsonify({"success": True, "message": "Mensagem enviada com sucesso!", "data": response.json()})
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Falha ao enviar mensagem pela Evolution API: {str(e)}"}), 500

if __name__ == '__main__':
    # Quando rodar localmente, usará a porta 5000. No Render, o gunicorn lidará com as portas.
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
