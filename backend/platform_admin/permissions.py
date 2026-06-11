from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to users with the 'ADMIN' role or is_staff=True.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff))
