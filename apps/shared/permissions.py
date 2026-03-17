from rest_framework.permissions import BasePermission


class IsModeratorOrAdmin(BasePermission):
    """
    Allows access only to users with moderator or admin type.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.type in ('moderator', 'admin')
