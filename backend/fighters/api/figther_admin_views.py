from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser

from ..models import Fighter


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])  # <- EZ A KULCS
def admin_update_fighter(request, fighter_id: int):
    # admin/staff check
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({"detail": "Admin only."}, status=status.HTTP_403_FORBIDDEN)

    # DEBUG: ezt most hagyd bent 1-2 mentés erejéig
    print("ADMIN PATCH content_type:", request.content_type)
    print("ADMIN PATCH data:", request.data)

    try:
        f = Fighter.objects.get(id=fighter_id)
    except Fighter.DoesNotExist:
        return Response({"detail": "Fighter not found."}, status=status.HTTP_404_NOT_FOUND)

    allowed = {"nickname", "description", "bio_long", "wins", "losses", "draw"}

    payload = {}
    for key in allowed:
        if key in request.data:
            payload[key] = request.data.get(key)

    if not payload:
        return Response(
            {"detail": "No editable fields provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    for k, v in payload.items():
        setattr(f, k, v)

    f.save()

    return Response(
        {
            "id": f.id,
            "nickname": f.nickname,
            "description": f.description,
            "bio_long": f.bio_long,
            "wins": f.wins,
            "losses": f.losses,
            "draw": f.draw,
        },
        status=status.HTTP_200_OK,
    )
