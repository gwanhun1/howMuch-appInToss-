"""create record and statistics tables"""

from alembic import op
import sqlalchemy as sa


revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


# alembic upgrade head가 이 함수를 실행한다. 외래 키가 가리키는 users를 먼저 만든다.
def upgrade() -> None:
    op.create_table('users',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('username', sa.String(length=80), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username')
    )
    op.create_table('monthly_record_stats',
        sa.Column('owner_id', sa.Uuid(), nullable=False),
        sa.Column('month', sa.Date(), nullable=False),
        sa.Column('category', sa.String(length=20), nullable=False),
        sa.Column('mode', sa.String(length=8), nullable=False),
        sa.Column('record_count', sa.Integer(), nullable=False),
        sa.Column('amount', sa.BigInteger(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('owner_id', 'month', 'category', 'mode')
    )
    op.create_table('records',
        sa.Column('owner_id', sa.Uuid(), nullable=False),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('relation', sa.String(length=50), nullable=False),
        sa.Column('profile_icon', sa.String(length=80), nullable=False),
        sa.Column('type', sa.String(length=20), nullable=True),
        sa.Column('mode', sa.String(length=8), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('event_date', sa.Date(), nullable=True),
        sa.Column('is_favorite', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint("mode IN ('paid', 'received')", name='record_mode_valid'),
        sa.CheckConstraint("type IN ('용돈', '축의금', '조의금', '돌잔치')", name='record_type_valid'),
        sa.CheckConstraint('amount BETWEEN 1 AND 100000000', name='record_amount_range'),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('owner_id', 'id')
    )
    op.create_index('ix_records_owner_event_date', 'records', ['owner_id', 'event_date'], unique=False)
    op.create_table('sessions',
        sa.Column('token_hash', sa.String(length=64), nullable=False),
        sa.Column('owner_id', sa.Uuid(), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('token_hash')
    )
    op.create_index(op.f('ix_sessions_expires_at'), 'sessions', ['expires_at'], unique=False)
    op.create_index(op.f('ix_sessions_owner_id'), 'sessions', ['owner_id'], unique=False)
    op.create_table('stats_refresh_state',
        sa.Column('owner_id', sa.Uuid(), nullable=False),
        sa.Column('refreshed_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('undated_count', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('owner_id')
    )


# 개발 DB를 이전 스키마로 되돌리는 함수다. 외래 키를 가진 테이블부터 지운다.
def downgrade() -> None:
    op.drop_table('stats_refresh_state')
    op.drop_index(op.f('ix_sessions_owner_id'), table_name='sessions')
    op.drop_index(op.f('ix_sessions_expires_at'), table_name='sessions')
    op.drop_table('sessions')
    op.drop_index('ix_records_owner_event_date', table_name='records')
    op.drop_table('records')
    op.drop_table('monthly_record_stats')
    op.drop_table('users')
