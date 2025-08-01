from django.contrib.auth.models import User

def change_password(username, password):
    u = User.objects.get(username)
    u.set_password(password)
    u.save()