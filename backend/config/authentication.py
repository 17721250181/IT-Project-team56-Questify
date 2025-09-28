"""
Simple Cookie Authentication for Questify
Handles user authentication via questify_user cookie
"""

from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
import json

User = get_user_model()


class CookieAuthentication(BaseAuthentication):
    """
    Simple cookie authentication that reads user info from questify_user cookie
    """
    
    def authenticate(self, request):
        """
        Check if user is authenticated via questify_user cookie
        Returns (user, None) if authenticated, None if not
        """
        # Get the questify_user cookie
        user_cookie = request.COOKIES.get('questify_user')
        
        if not user_cookie:
            return None
        
        try:
            # Parse the JSON data from cookie
            user_data = json.loads(user_cookie)
            user_id = user_data.get('id')
            
            if not user_id:
                return None
            
            # Find the user in database
            try:
                user = User.objects.get(id=user_id)
                return (user, None)  # Successfully authenticated
            except User.DoesNotExist:
                return None  # User not found
                
        except json.JSONDecodeError:
            return None  # Invalid JSON in cookie
    
    def authenticate_header(self, request):
        """
        Return authentication header for 401 responses
        """
        return 'Cookie'