from flask import Blueprint, request, jsonify
from app.models import Session, SessionPlayer, GameResult, User, PerformanceReport
from app.extensions import db
import jwt
from config import Config

dashboard_bp = Blueprint('dashboard', __name__)
analytics_bp = Blueprint('analytics', __name__)

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

@analytics_bp.route('/analytics/overview', methods=['GET'])
def get_analytics_overview():
    sessions = Session.query.all()
    players = User.query.filter_by(role='player').all()
    total_sessions = len(sessions)
    top_performers = [{
        'user_id': player.id,
        'name': player.username,
        'rank': '',
        'score': 0,
        'sessions_count': 0,
    } for player in players]

    return jsonify({
        'avg_completion_time': 0,
        'avg_victims_rescued': 0,
        'mask_compliance_rate': 0,
        'zone_accuracy': 0,
        'team_readiness_score': 0,
        'team_consistency_index': 0,
        'total_sessions': total_sessions,
        'pass_rate': 0,
        'top_performers': top_performers,
        'needs_attention': [],
        'outlier_scores': [],
    }), 200

@dashboard_bp.route('/sessions', methods=['GET'])
def get_all_sessions():
    # In a real app, add pagination and filtering
    sessions = Session.query.order_by(Session.created_at.desc()).all()
    
    results = []
    for s in sessions:
        results.append({
            'id': s.id,
            'status': s.status,
            'created_at': s.created_at.isoformat(),
            'created_by': s.created_by,
            'config': s.config
        })
    
    return jsonify({'sessions': results}), 200

@dashboard_bp.route('/sessions/<int:session_id>', methods=['GET'])
def get_session_details(session_id):
    session = Session.query.get_or_404(session_id)
    
    # Get Players
    players = SessionPlayer.query.filter_by(session_id=session_id).all()
    player_data = []
    for p in players:
        user = User.query.get(p.user_id)
        player_data.append({
            'user_id': p.user_id,
            'username': user.username if user else 'Unknown',
            'role': p.game_role,
            'status': p.status,
            'joined_at': p.joined_at.isoformat()
        })
        
    # Get Results
    results = GameResult.query.filter_by(session_id=session_id).all()
    result_data = []
    for r in results:
        user = User.query.get(r.user_id)
        result_data.append({
            'user_id': r.user_id,
            'username': user.username if user else 'Unknown',
            'metrics': r.metrics,
            'recorded_at': r.recorded_at.isoformat()
        })

    # Get AI Reports
    reports = PerformanceReport.query.filter_by(session_id=session_id).all()
    report_data = []
    for rep in reports:
        user = User.query.get(rep.user_id)
        report_data.append({
            'user_id': rep.user_id,
            'username': user.username if user else 'Unknown',
            'content': rep.report_content,
            'created_at': rep.created_at.isoformat()
        })

    return jsonify({
        'session': {
            'id': session.id,
            'status': session.status,
            'created_at': session.created_at.isoformat(),
            'config': session.config
        },
        'players': player_data,
        'results': result_data,
        'reports': report_data
    }), 200
