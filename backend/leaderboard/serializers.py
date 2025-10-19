from rest_framework import serializers

class LeaderboardRowSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    attempts = serializers.IntegerField()
    correct = serializers.IntegerField()
    points = serializers.IntegerField()
    last_activity = serializers.DateTimeField(allow_null=True)
    rank = serializers.IntegerField()

class MyLeaderboardSerializer(serializers.Serializer):
    me = LeaderboardRowSerializer()
    around = LeaderboardRowSerializer(many=True)
