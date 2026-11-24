"""Store the date of consent for self-service accounts."""

from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"


def upgrade() -> None:
    op.add_column("users", sa.Column("privacy_accepted_at", sa.DateTime(timezone=True)))


def downgrade() -> None:
    op.drop_column("users", "privacy_accepted_at")
