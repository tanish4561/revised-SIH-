from flask import Blueprint, jsonify, request
import jwt

from app.models import User
from config import Config

comparison_bp = Blueprint('comparison', __name__)


def get_user_from_token():
    auth_header = request.headers.get('Authorization', '')
    parts = auth_header.split(' ', 1)
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return None

    try:
        payload = jwt.decode(parts[1], Config.SECRET_KEY, algorithms=['HS256'])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

    return User.query.get(payload.get('user_id'))


@comparison_bp.route('/personnel', methods=['GET'])
def get_personnel_comparison():
    personnel = []
    for person in User.query.filter_by(role='player').order_by(User.username).all():
        personnel.append({
            'id': str(person.id),
            'name': person.username,
            'rank': '',
            'zone_precision_score': 0,
            'triage_accuracy_score': 0,
            'speed_score': 0,
            'protocol_compliance_score': 0,
            'decision_making_score': 0,
            'overall_score': 0,
            'total_sessions': 0,
            'passed_sessions': 0,
            'pass_rate': 0,
            'avg_completion_time': 0,
            'avg_ppm_deviation': 0,
            'perfect_triage_count': 0,
            'percentile_zone_precision': 0,
            'percentile_triage': 0,
            'percentile_speed': 0,
            'percentile_overall': 0,
        })

    return jsonify({
        'personnel': personnel,
        'team_average': None,
        'total_count': len(personnel),
    }), 200
