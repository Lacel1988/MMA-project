from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """
<<<<<<< HEAD
    GET, HEAD, OPTIONS mindenkinek.
    POST, PUT, PATCH, DELETE csak staffnak.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
=======
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
>>>>>>> origin/forum-alpha
