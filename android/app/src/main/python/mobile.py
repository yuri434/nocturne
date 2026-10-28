import json
from backend import handle
def dispatch(text):
    try:
        return json.dumps(handle(json.loads(text)))
    except Exception as error:
        return json.dumps({'error': 'Não foi possível concluir: ' + str(error)[:300]})
