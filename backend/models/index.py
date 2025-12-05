import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для работы с моделями в каталоге
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            model_id = params.get('id')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if model_id:
                    cur.execute(f'SELECT * FROM models WHERE id = {model_id}')
                    model = cur.fetchone()
                    if not model:
                        return {
                            'statusCode': 404,
                            'headers': {'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Model not found'}),
                            'isBase64Encoded': False
                        }
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'id': model['id'],
                            'photos': model['photos'],
                            'faceType': model['face_type'],
                            'eyeColor': model['eye_color'],
                            'skinColor': model['skin_color'],
                            'bodyType': model['body_type'],
                            'hairColor': model['hair_color'],
                            'hairLength': model['hair_length'],
                            'hairType': model['hair_type']
                        }),
                        'isBase64Encoded': False
                    }
                else:
                    cur.execute('SELECT id, face_type, eye_color, skin_color, body_type, hair_color, hair_length, hair_type, array_length(photos, 1) as photos_count FROM models ORDER BY created_at DESC LIMIT 50')
                    models = cur.fetchall()
                    
                    result = []
                    for model in models:
                        result.append({
                            'id': model['id'],
                            'photosCount': model['photos_count'] or 0,
                            'faceType': model['face_type'],
                            'eyeColor': model['eye_color'],
                            'skinColor': model['skin_color'],
                            'bodyType': model['body_type'],
                            'hairColor': model['hair_color'],
                            'hairLength': model['hair_length'],
                            'hairType': model['hair_type']
                        })
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps(result),
                        'isBase64Encoded': False
                    }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            photos = body_data['photos']
            photos_array = "ARRAY[" + ",".join([f"'{p.replace(chr(39), chr(39)+chr(39))}'" for p in photos]) + "]"
            face_type = body_data['faceType'].replace("'", "''")
            eye_color = body_data['eyeColor'].replace("'", "''")
            skin_color = body_data['skinColor'].replace("'", "''")
            body_type = body_data['bodyType'].replace("'", "''")
            hair_color = body_data['hairColor'].replace("'", "''")
            hair_length = body_data['hairLength'].replace("'", "''")
            hair_type = body_data['hairType'].replace("'", "''")
            
            with conn.cursor() as cur:
                cur.execute(f'''
                    INSERT INTO models (photos, face_type, eye_color, skin_color, body_type, hair_color, hair_length, hair_type)
                    VALUES ({photos_array}, '{face_type}', '{eye_color}', '{skin_color}', '{body_type}', '{hair_color}', '{hair_length}', '{hair_type}')
                    RETURNING id
                ''')
                model_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'id': model_id}),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            model_id = params.get('id')
            
            with conn.cursor() as cur:
                cur.execute(f'DELETE FROM models WHERE id = {model_id}')
                
                cur.execute('SELECT COUNT(*) FROM models')
                count = cur.fetchone()[0]
                
                if count == 0:
                    cur.execute("SELECT setval('models_id_seq', 1, false)")
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()