from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """
    GET, HEAD, OPTIONS → bárki használhatja
    POST, PUT, PATCH, DELETE → csak bejelentkezett staff user
    """

    def has_permission(self, request, view):
        # Olvasási műveletek mindenki számára engedélyezettek
        if request.method in SAFE_METHODS:
            return True

        # Írás csak staff és bejelentkezett felhasználónak
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )