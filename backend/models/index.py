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
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('SELECT * FROM models ORDER BY created_at DESC')
                models = cur.fetchall()
                
                result = []
                for model in models:
                    result.append({
                        'id': model['id'],
                        'photos': model['photos'],
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
            
            with conn.cursor() as cur:
                cur.execute('''
                    INSERT INTO models (photos, face_type, eye_color, skin_color, body_type, hair_color, hair_length, hair_type)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (
                    body_data['photos'],
                    body_data['faceType'],
                    body_data['eyeColor'],
                    body_data['skinColor'],
                    body_data['bodyType'],
                    body_data['hairColor'],
                    body_data['hairLength'],
                    body_data['hairType']
                ))
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
                cur.execute('DELETE FROM models WHERE id = %s', (model_id,))
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
