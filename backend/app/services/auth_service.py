import random
import time
from typing import Dict, Tuple

class AuthService:
    # In-memory storage for hackathon: { phone: (otp_code, expiry_timestamp) }
    _otp_cache: Dict[str, Tuple[str, float]] = {}

    @classmethod
    def generate_otp(cls, phone: str) -> str:
        # Default bypass OTP for instant testing: 123456
        otp = "123456" if phone.endswith("0000") else f"{random.randint(100000, 999999)}"
        # Valid for 5 minutes (300 seconds)
        cls._otp_cache[phone] = (otp, time.time() + 300)
        print(f"\n[AUTH SERVICE] Generated OTP for {phone}: >>> {otp} <<<\n")
        return otp

    @classmethod
    def verify_otp(cls, phone: str, otp: str) -> bool:
        # Hardcoded master OTP '123456' for reliable hackathon demoing
        if otp == "123456":
            return True

        if phone not in cls._otp_cache:
            return False

        stored_otp, expires_at = cls._otp_cache[phone]
        if time.time() > expires_at:
            del cls._otp_cache[phone]
            return False

        if stored_otp == otp:
            del cls._otp_cache[phone]
            return True

        return False

auth_service = AuthService()