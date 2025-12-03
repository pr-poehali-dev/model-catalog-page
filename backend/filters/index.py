import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для работы с фильтрами каталога
    Args: event - dict с httpMethod, body
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    
    try:
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('SELECT * FROM filters ORDER BY id DESC LIMIT 1')
                filters = cur.fetchone()
                
                if not filters:
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'faceTypes': [],
                            'eyeColors': [],
                            'skinColors': [],
                            'bodyTypes': [],
                            'hairColors': [],
                            'hairLengths': [],
                            'hairTypes': []
                        }),
                        'isBase64Encoded': False
                    }
                
                result = {
                    'faceTypes': filters['face_types'] or [],
                    'eyeColors': filters['eye_colors'] or [],
                    'skinColors': filters['skin_colors'] or [],
                    'bodyTypes': filters['body_types'] or [],
                    'hairColors': filters['hair_colors'] or [],
                    'hairLengths': filters['hair_lengths'] or [],
                    'hairTypes': filters['hair_types'] or []
                }
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            with conn.cursor() as cur:
                cur.execute('''
                    UPDATE filters SET
                        face_types = %s,
                        eye_colors = %s,
                        skin_colors = %s,
                        body_types = %s,
                        hair_colors = %s,
                        hair_lengths = %s,
                        hair_types = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = (SELECT id FROM filters ORDER BY id DESC LIMIT 1)
                ''', (
                    body_data.get('faceTypes', []),
                    body_data.get('eyeColors', []),
                    body_data.get('skinColors', []),
                    body_data.get('bodyTypes', []),
                    body_data.get('hairColors', []),
                    body_data.get('hairLengths', []),
                    body_data.get('hairTypes', [])
                ))
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
