from flask import Blueprint, request, jsonify
from app.models import Session, SessionPlayer, User
from app.extensions import db
import uuid
import datetime

sessions_bp = Blueprint('sessions', __name__)

# Helper to verify token (simplified for now, ideally use a decorator)
def get_user_from_token(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    
    try:
        token = auth_header.split(" ")[1]
        import jwt
        from config import Config
        data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        return User.query.get(data['user_id'])
    except:
        return None

@sessions_bp.route('/', methods=['POST'])
def create_session():
    user = get_user_from_token(request)
    if not user or user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403

    data = request.get_json()
    config = data.get('config', {})
    players_data = data.get('players', []) # List of {username: '...', role: '...'}
    
    new_session = Session(created_by=user.id, config=config)
    db.session.add(new_session)
    db.session.commit() # Commit to get ID

    # Assign players
    for p_data in players_data:
        p_user = User.query.filter_by(username=p_data['username']).first()
        if p_user:
            player = SessionPlayer(
                session_id=new_session.id,
                user_id=p_user.id,
                game_role=p_data['role'],
                status='PENDING'
            )
            db.session.add(player)
    
    db.session.commit()
    
    return jsonify({'message': 'Session created and players assigned', 'session_id': new_session.id}), 201

@sessions_bp.route('/pending', methods=['GET'])
def get_pending_sessions():
    user = get_user_from_token(request)
    if not user:
        return jsonify({'message': 'Authentication required'}), 401

    # Find sessions where this user is PENDING
    pending_records = SessionPlayer.query.filter_by(user_id=user.id, status='PENDING').all()
    
    sessions = []
    for record in pending_records:
        session = Session.query.get(record.session_id)
        if session and session.status == 'CREATED': # Only show created sessions
            sessions.append({
                'session_id': session.id,
                'role': record.game_role,
                'created_at': session.created_at.isoformat()
            })

    return jsonify({'pending_sessions': sessions}), 200

@sessions_bp.route('/<int:session_id>/join', methods=['POST'])
def join_session(session_id):
    user = get_user_from_token(request)
    if not user:
        return jsonify({'message': 'Authentication required'}), 401

    session = Session.query.get_or_404(session_id)
    if session.status != 'CREATED':
        return jsonify({'message': 'Session is not open for joining'}), 400

    # Check if assigned
    player_record = SessionPlayer.query.filter_by(session_id=session_id, user_id=user.id).first()
    if not player_record:
        return jsonify({'message': 'You are not invited to this session'}), 403
    
    if player_record.status == 'JOINED':
        return jsonify({'message': 'Already joined'}), 200 # Idempotent

    player_record.status = 'JOINED'
    db.session.commit()

    return jsonify({'message': 'Joined session', 'role': player_record.game_role}), 200

@sessions_bp.route('/<int:session_id>/start', methods=['POST'])
def start_session(session_id):
    user = get_user_from_token(request)
    if not user or user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403

    session = Session.query.get_or_404(session_id)
    if session.status != 'CREATED':
        return jsonify({'message': 'Session cannot be started'}), 400

    session.status = 'STARTED'
    db.session.commit()

    return jsonify({'message': 'Session started', 'session_id': session.id}), 200
