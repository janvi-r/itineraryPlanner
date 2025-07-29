import random
import smtplib
from email.message import EmailMessage

otp = ""
for i in range(6):
    otp += str(random.randint(0,9))

server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()

from_mail = "rudra1hp@gmail.com"
server.login(from_mail, "lvxs lhfz jitj fcli")
to_mail = input("Enter the email address: ")

msg = EmailMessage()
msg['Subject'] = 'OTP Verification'
msg['From'] = from_mail
msg['To'] = to_mail
msg.set_content("Your OTP Verification Pin is : " + otp)

server.send_message(msg)

input_otp = input("Enter the OTP Verification Pin : ")
if input_otp == otp:
    print("OTP Verified")
else:
    print("Invalid OTP")

