from django.contrib.auth.models import User
from rest_framework import serializers
from backend.models import UserProfile

class UserCreateSerializer(serializers.ModelSerializer):
    birthday = serializers.DateField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'birthday']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        birthday = validated_data.pop('birthday')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, birthday=birthday)
        return user

