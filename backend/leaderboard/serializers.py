from rest_framework import serializers

class LeaderboardRowSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    display_name = serializers.CharField()
    attempts = serializers.IntegerField()
    correct = serializers.IntegerField()
    points = serializers.IntegerField()
    last_activity = serializers.DateTimeField(allow_null=True)
    rank = serializers.IntegerField()
    total_users = serializers.IntegerField(required=False)

class MyLeaderboardSerializer(serializers.Serializer):
    me = LeaderboardRowSerializer()
    around = LeaderboardRowSerializer(many=True)
