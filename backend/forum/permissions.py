from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """
    GET/HEAD/OPTIONS → bárki
    POST/PUT/PATCH/DELETE → csak staff user
    """

    def has_permission(self, request, view):
        # Olvasás mindig mehet
        if request.method in SAFE_METHODS:
            return True

        # Írás csak staff és bejelentkezett user
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )